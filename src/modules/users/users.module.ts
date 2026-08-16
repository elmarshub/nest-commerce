import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/decorators/guards/jwt-auth.guards';
import { RolesGuard } from '@/common/decorators/guards/roles.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard, RolesGuard],
})
export class UsersModule {}
