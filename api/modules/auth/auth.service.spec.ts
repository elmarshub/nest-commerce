import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn((value: string) => Promise.resolve(`hashed:${value}`)),
  compare: jest.fn(() => Promise.resolve(true)),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: EmailService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('AuthService#refreshTokens concurrent rotation', () => {
  const userId = 'user-1';
  const sessionId = 'session-1';
  const startingRefreshId = 'refresh-start';

  const user = {
    id: userId,
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: null,
    role: 'USER',
  };

  let service: AuthService;
  let updateMany: jest.Mock;
  let findUniqueSession: jest.Mock;
  let signAsync: jest.Mock;
  let tokenCounter: number;

  beforeEach(async () => {
    tokenCounter = 0;
    updateMany = jest.fn();
    findUniqueSession = jest.fn();

    signAsync = jest.fn((payload: Record<string, unknown>) => {
      tokenCounter += 1;

      return Promise.resolve(
        'refreshId' in payload
          ? `refresh-token-${tokenCounter}`
          : `access-token-${tokenCounter}`,
      );
    });

    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
      },
      refreshSession: {
        updateMany,
        findUnique: findUniqueSession,
      },
    };

    const configService = {
      get: jest.fn((key: string, fallback?: unknown) => {
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        if (key === 'JWT_EXPIRES_IN') return fallback ?? 900;
        return fallback;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { signAsync } },
        { provide: EmailService, useValue: {} },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('replays the winning rotation result for a duplicate retry instead of erroring', async () => {
    updateMany
      .mockResolvedValueOnce({ count: 1 }) // first caller wins the CAS
      .mockResolvedValueOnce({ count: 0 }); // second caller loses it

    const first = await service.refreshTokens(
      userId,
      sessionId,
      startingRefreshId,
    );
    const second = await service.refreshTokens(
      userId,
      sessionId,
      startingRefreshId,
    );

    expect(second.accessToken).toBe(first.accessToken);
    expect(second.refreshToken).toBe(first.refreshToken);
    // The grace-period cache should short-circuit the fallback lookup —
    // the loser never needs to ask the DB what happened.
    expect(findUniqueSession).not.toHaveBeenCalled();
  });

  it('stays consistent when the CAS calls resolve in reversed order', async () => {
    const pendingUpdates: Array<(value: { count: number }) => void> = [];
    updateMany.mockImplementation(
      () =>
        new Promise((resolve) => {
          pendingUpdates.push(resolve);
        }),
    );

    const requestA = service.refreshTokens(
      userId,
      sessionId,
      startingRefreshId,
    );
    const requestB = service.refreshTokens(
      userId,
      sessionId,
      startingRefreshId,
    );

    await new Promise((resolve) => setImmediate(resolve));
    expect(pendingUpdates).toHaveLength(2);

    pendingUpdates[1]({ count: 1 });
    await Promise.race([requestA, requestB]);

    pendingUpdates[0]({ count: 0 });
    const [resultA, resultB] = await Promise.all([requestA, requestB]);

    expect(resultA.accessToken).toBe(resultB.accessToken);
    expect(resultA.refreshToken).toBe(resultB.refreshToken);
    expect(findUniqueSession).not.toHaveBeenCalled();
  });

  it('rejects a stale token that is not the session it just rotated from', async () => {
    updateMany.mockResolvedValueOnce({ count: 0 });
    findUniqueSession.mockResolvedValueOnce({
      previousRefreshTokenId: 'some-other-token',
    });

    await expect(
      service.refreshTokens(userId, sessionId, startingRefreshId),
    ).rejects.toThrow('Invalid refresh token');
  });
});
