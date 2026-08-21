import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { Prisma } from '@generated/prisma/client';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomUUID, createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
  private readonly VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  // register new user
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          password: false,
        },
      });
      const tokens = await this.startNewSession(user.id, user.email);
      await this.sendVerificationEmail(user.id, user.email);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(rawToken);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + this.VERIFICATION_TOKEN_TTL_MS),
      },
    });

    await this.emailService.sendEmailVerificationEmail(email, rawToken);
  }

  async verifyEmail({ token }: VerifyEmailDto): Promise<{ message: string }> {
    const hashedToken = this.hashToken(token);

    const verificationToken =
      await this.prisma.emailVerificationToken.findUnique({
        where: { token: hashedToken },
      });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.emailVerificationToken.updateMany({
        where: {
          id: verificationToken.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });

      if (count !== 1) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      });
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification({
    email,
  }: ResendVerificationDto): Promise<{ message: string }> {
    const genericResponse = {
      message:
        'If an account with that email exists and is not yet verified, a verification link has been sent',
    };

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return genericResponse;
    }

    await this.sendVerificationEmail(user.id, user.email);

    return genericResponse;
  }

  //   token
  private async generateTokens(
    userId: string,
    email: string,
    sessionId: string,
  ): Promise<{ accessToken: string; refreshToken: string; refreshId: string }> {
    const payload = { sub: userId, email };

    const refreshId = randomBytes(16).toString('hex');

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET must be set');
    }

    const accessTokenTtl = Number(
      this.configService.get<number>('JWT_EXPIRES_IN', 900),
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: accessTokenTtl }),
      this.jwtService.signAsync(
        { ...payload, sessionId, refreshId },
        { secret: refreshSecret, expiresIn: '30d' },
      ),
    ]);

    return { accessToken, refreshToken, refreshId };
  }

  private async startNewSession(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const sessionId = randomUUID();
    const tokens = await this.generateTokens(userId, email, sessionId);
    const tokenHash = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);

    await this.prisma.refreshSession.create({
      data: {
        id: sessionId,
        userId,
        tokenHash,
        currentRefreshTokenId: tokens.refreshId,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async rotateSession(
    sessionId: string,
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.generateTokens(userId, email, sessionId);
    const tokenHash = await bcrypt.hash(tokens.refreshToken, this.SALT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      const session = await tx.refreshSession.findUnique({
        where: { id: sessionId },
        select: { currentRefreshTokenId: true },
      });

      await tx.refreshSession.update({
        where: { id: sessionId },
        data: {
          tokenHash,
          currentRefreshTokenId: tokens.refreshId,
          previousRefreshTokenId: session?.currentRefreshTokenId,
        },
      });
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(
    userId: string,
    sessionId: string,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.rotateSession(sessionId, user.id, user.email);

    return {
      ...tokens,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.startNewSession(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async forgotPassword({
    email,
  }: ForgotPasswordDto): Promise<{ message: string }> {
    const genericResponse = {
      message:
        'If an account with that email exists, a password reset link has been sent',
    };

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return genericResponse;
    }

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(rawToken);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + this.RESET_TOKEN_TTL_MS),
      },
    });

    await this.emailService.sendPasswordResetEmail(email, rawToken);

    return genericResponse;
  }

  async resetPassword({
    token,
    newPassword,
  }: ResetPasswordDto): Promise<{ message: string }> {
    const hashedToken = this.hashToken(token);

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });

      if (count !== 1) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      await tx.refreshSession.deleteMany({
        where: { userId: resetToken.userId },
      });
    });

    return { message: 'Password has been reset successfully' };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshSession.deleteMany({
      where: { userId },
    });
  }
}
