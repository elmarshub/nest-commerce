import { Test, TestingModule } from '@nestjs/testing';
import { EmailService, shortOrderNumber } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    process.env.RESEND_API_KEY = 're_test_dummy';

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('shortOrderNumber', () => {
  it('uses the last 8 characters, uppercased', () => {
    expect(shortOrderNumber('cmvbq1c2u00023biwpaewnbl6')).toBe('PAEWNBL6');
  });
});
