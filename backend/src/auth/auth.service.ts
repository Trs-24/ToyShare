import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    // Google-only users don't have a password — reject email/password login
    if (!user || !user.password) {
      return null;
    }
    if (await bcrypt.compare(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: any) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const created = await this.usersService.create({
      ...user,
      password: hashedPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = created;
    return result;
  }

  async validateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }): Promise<any> {
    // 1. Try to find by googleId
    let user = await this.usersService.findByGoogleId(googleProfile.googleId);
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    // 2. Try to find by email — link the Google account
    user = await this.usersService.findOne(googleProfile.email);
    if (user) {
      user = await this.usersService.update(user.id, {
        googleId: googleProfile.googleId,
        avatarUrl: user.avatarUrl || googleProfile.avatarUrl,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    // 3. Create a new user (no password)
    const newUser = await this.usersService.create({
      email: googleProfile.email,
      name: googleProfile.name,
      googleId: googleProfile.googleId,
      avatarUrl: googleProfile.avatarUrl,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = newUser;
    return result;
  }
}
