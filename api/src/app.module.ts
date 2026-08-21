import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PaymentsModule } from './modules/payments/payments.module';
import { CartsModule } from './modules/carts/carts.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { EmailModule } from './email/email.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MetaModule } from './modules/meta/meta.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 10,
        },
      ],
    }),
    PrismaModule,
    EmailModule,
    AuditLogModule,
    AuthModule,
    UsersModule,
    CategoryModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    CartsModule,
    AddressesModule,
    ReviewsModule,
    MetaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
