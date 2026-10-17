import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }

  // liveness probe for Render; skips throttling so frequent pings never 429
  @Public()
  @SkipThrottle()
  @Get('health')
  @ApiExcludeEndpoint()
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
