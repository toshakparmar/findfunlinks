import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { OwnerScopeGuard } from '../../common/guards/owner-scope.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_ACCESS_SECRET ||
        'super_secret_access_key_min_32_characters_random_findfunlinks',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, PermissionsGuard, OwnerScopeGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, PermissionsGuard, OwnerScopeGuard],
})
export class AuthModule {}
