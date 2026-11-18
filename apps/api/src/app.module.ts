import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { MailModule } from './modules/mail/mail.module';
import { AuditModule } from './modules/audit/audit.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { WebsitesModule } from './modules/websites/websites.module';
import { DomainsModule } from './modules/domains/domains.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { StorageModule } from './modules/storage/storage.module';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 10, // 10 requests per minute for sensitive endpoints
      },
    ]),
    PrismaModule,
    HealthModule,
    MailModule,
    AuditModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    TagsModule,
    SettingsModule,
    ReportsModule,
    RegistrationsModule,
    WebsitesModule,
    DomainsModule,
    HealthCheckModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass:
        process.env.NODE_ENV === 'test'
          ? (class BypassThrottlerInTests {
              canActivate() {
                return true;
              }
            } as any)
          : ThrottlerGuard,
    },
  ],
})
export class AppModule {}
