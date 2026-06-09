import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { PoliciesGuard } from './guards/policies.guard';
import { CaslModule } from '../casl/casl.module';

@Global()
@Module({
  imports: [
    CaslModule,
    UsersModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, AuthGuard, RolesGuard, PoliciesGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, RolesGuard, PoliciesGuard],
})
export class AuthModule {}
