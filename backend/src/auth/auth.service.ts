import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

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
    const payload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: any) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const emailVerifyToken = crypto.randomUUID();

    try {
      const created = await this.usersService.create({
        ...user,
        password: hashedPassword,
        emailVerifyToken,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = created;

      // Send verification email (async, don't block registration)
      this.emailService.sendVerificationEmail(created.email, emailVerifyToken);

      return result;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Account with this email or phone already exists.',
        );
      }
      throw error;
    }
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByEmailToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }
    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerifyToken: null,
    });
    return { message: 'Email verified successfully.' };
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

    // 3. Create a new user (no password, auto-verified via Google)
    const newUser = await this.usersService.create({
      email: googleProfile.email,
      name: googleProfile.name,
      googleId: googleProfile.googleId,
      avatarUrl: googleProfile.avatarUrl,
      isEmailVerified: true, // Google OAuth users are auto-verified
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = newUser;
    return result;
  }
}
