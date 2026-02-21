import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findOne: jest.Mock;
    findByGoogleId: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
      findByGoogleId: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockImplementation(() => 'mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      usersService.findOne.mockResolvedValue(null);
      const result = await service.validateUser('test@test.com', 'pass');
      expect(result).toBeNull();
    });

    it('should return null if user has no password (e.g., google only)', async () => {
      usersService.findOne.mockResolvedValue({
        email: 'test@test.com',
        password: null,
      });
      const result = await service.validateUser('test@test.com', 'pass');
      expect(result).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      usersService.findOne.mockResolvedValue({
        email: 'test@test.com',
        password: 'hashedpassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validateUser('test@test.com', 'wrongpass');
      expect(result).toBeNull();
    });

    it('should return user without password on success', async () => {
      usersService.findOne.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashedpassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validateUser('test@test.com', 'correctpass');
      expect(result).toEqual({ id: '1', email: 'test@test.com' });
    });
  });

  describe('login', () => {
    it('should return access token with correct payload', async () => {
      const user = {
        id: 'user-id',
        email: 'user@test.com',
        role: 'USER',
        isEmailVerified: true,
      };
      const token = 'test-token';
      (jwtService.sign as jest.Mock).mockReturnValue(token);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.email,
        sub: user.id,
        role: user.role,
        isEmailVerified: true,
      });
      expect(result).toEqual({ access_token: token });
    });
  });

  describe('register', () => {
    it('should hash password and create a new user', async () => {
      const userParam = { email: 'new@test.com', password: 'plainpassword' };
      const createdUser = {
        id: 'new-id',
        email: 'new@test.com',
        password: 'hashedpassword',
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      usersService.create.mockResolvedValue(createdUser);

      const result = await service.register(userParam);
      expect(usersService.create).toHaveBeenCalledWith({
        ...userParam,
        password: 'hashedpassword',
      });
      expect(result).toEqual({ id: 'new-id', email: 'new@test.com' });
    });

    it('should throw BadRequestException if Prisma throws P2002', async () => {
      const userParam = { email: 'dup@test.com', password: 'pass' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'duplicate',
        { code: 'P2002', clientVersion: '6.0' },
      );
      usersService.create.mockRejectedValue(prismaError);

      await expect(service.register(userParam)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw original error if not P2002', async () => {
      const userParam = { email: 'err@test.com', password: 'pass' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      usersService.create.mockRejectedValue(new Error('Other error'));

      await expect(service.register(userParam)).rejects.toThrow('Other error');
    });
  });

  describe('validateGoogleUser', () => {
    const googleProfile = {
      googleId: 'g123',
      email: 'g@test.com',
      name: 'Google User',
      avatarUrl: 'url',
    };

    it('should return user directly if found by googleId', async () => {
      usersService.findByGoogleId.mockResolvedValue({
        id: 'u1',
        password: 'abc',
        ...googleProfile,
      });
      const result = await service.validateGoogleUser(googleProfile);
      expect(result).toEqual({
        id: 'u1',
        googleId: 'g123',
        email: 'g@test.com',
        name: 'Google User',
        avatarUrl: 'url',
      });
      expect(usersService.findOne).not.toHaveBeenCalled();
    });

    it('should link googleId to existing user by email if not found by googleId', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findOne.mockResolvedValue({
        id: 'u2',
        email: 'g@test.com',
        password: 'abc',
        avatarUrl: null,
      });
      usersService.update.mockResolvedValue({
        id: 'u2',
        email: 'g@test.com',
        password: 'abc',
        googleId: 'g123',
        avatarUrl: 'url',
      });

      const result = await service.validateGoogleUser(googleProfile);
      expect(usersService.update).toHaveBeenCalledWith('u2', {
        googleId: 'g123',
        avatarUrl: 'url',
      });
      expect(result).toEqual({
        id: 'u2',
        email: 'g@test.com',
        googleId: 'g123',
        avatarUrl: 'url',
      });
    });

    it('should create a new user if not found by googleId or email', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findOne.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 'u3',
        password: null,
        ...googleProfile,
      });

      const result = await service.validateGoogleUser(googleProfile);
      expect(usersService.create).toHaveBeenCalledWith(googleProfile);
      expect(result).toEqual({ id: 'u3', ...googleProfile });
    });
  });
});
