import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { UserSessionDto } from 'src/dto/usersession.dto';

@Injectable()
export class PhStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.clientid'),
      clientSecret: configService.get<string>('auth.secret'),
      callbackURL: configService.get<string>('auth.callbackurl'),
      passReqToCallback: true,
      profileFields: {
        userId: 'id',
        login: 'login',
        email: 'email',
      },
    });
  }

  async validate(req, access_token, refreshToken, profile, cb) {
    const userEmail = (profile.email || '').split('.');
    const user: UserSessionDto = {
      userId: profile.userId,
      intraId: profile.login,
      email: profile.email,
    };
    cb(null, user);
  }
}
