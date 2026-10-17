import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '@/audit-log/audit-log.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
            updateProfile: jest.fn(),
            changePassword: jest.fn(),
            deleteAccount: jest.fn(),
            remove: jest.fn(),
            updateRole: jest.fn(),
          },
        },
        { provide: AuditLogService, useValue: { record: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
