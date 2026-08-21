import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@generated/prisma/client';
import { Role } from '@generated/prisma/enums';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersResponseDto } from './dto/user-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { AuthService } from '../auth/auth.service';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findOne(userId: string): Promise<UsersResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ...USER_SELECT, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<UsersResponseDto> {
    const currentUser = await this.findOne(userId);
    const isChangingEmail = !!data.email && data.email !== currentUser.email;

    if (isChangingEmail) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already in use');
      }
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: isChangingEmail
          ? { ...data, emailVerified: false, emailVerifiedAt: null }
          : data,
        select: USER_SELECT,
      });

      if (isChangingEmail) {
        await this.authService.sendVerificationEmail(userId, data.email!);
      }

      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already in use');
      }

      throw error;
    }
  }

  async changePassword(
    userId: string,
    { currentPassword, newPassword }: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      await tx.refreshSession.deleteMany({ where: { userId } });
    });

    return { message: 'Password changed successfully' };
  }

  async deleteAccount(
    userId: string,
    { password }: DeleteAccountDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    await this.softDeleteUser(userId);
  }

  async remove(userId: string): Promise<void> {
    await this.findOne(userId);

    await this.softDeleteUser(userId);
  }

  private async softDeleteUser(userId: string): Promise<void> {
    const randomPassword = await bcrypt.hash(randomUUID(), this.SALT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          email: `deleted-${userId}@deleted.invalid`,
          firstName: null,
          lastName: null,
          password: randomPassword,
        },
      });

      await tx.refreshSession.deleteMany({ where: { userId } });
    });
  }

  async updateRole(
    actorId: string,
    userId: string,
    role: Role,
  ): Promise<UsersResponseDto> {
    if (actorId === userId) {
      throw new BadRequestException('You cannot change your own role');
    }

    await this.findOne(userId);

    return await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: USER_SELECT,
    });
  }

  async findAll(
    skip?: number,
    take?: number,
  ): Promise<{ users: UsersResponseDto[]; total: number }> {
    const DEFAULT_TAKE = 20;
    const MAX_TAKE = 100;

    const sanitizedSkip = Math.max(skip ?? 0, 0);
    const sanitizedTake = Math.min(Math.max(take ?? DEFAULT_TAKE, 1), MAX_TAKE);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: USER_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: sanitizedSkip,
        take: sanitizedTake,
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return { users, total };
  }
}
