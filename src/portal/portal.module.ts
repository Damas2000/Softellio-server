import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { PortalAuthService } from './auth/portal-auth.service';
import { PortalAuthController } from './auth/portal-auth.controller';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    ActivityModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
          } as any,
        };
      },
    }),
  ],
  controllers: [PortalController, PortalAuthController],
  providers: [PortalService, PortalAuthService],
  exports: [PortalService, PortalAuthService],
})
export class PortalModule {}