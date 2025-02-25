import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '@/domain/adapters/jwt.interface';
import { User } from '@/infrastructure/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ) { }

  login(user: User) {
    const payload: JwtPayload = { username: user.username, id: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET })
    };
  }
}
