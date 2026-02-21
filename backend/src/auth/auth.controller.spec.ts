import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; register: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3001'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token', async () => {
      authService.login.mockResolvedValue({ access_token: 'token' });
      const req = { user: { id: '1' } };
      const res = await controller.login(req);
      expect(res).toEqual({ access_token: 'token' });
      expect(authService.login).toHaveBeenCalledWith(req.user);
    });
  });

  describe('register', () => {
    it('should register and return user', async () => {
      const dto = {
        email: 'test@t.com',
        password: 'p',
        name: 'N',
        phone: '123',
      };
      authService.register.mockResolvedValue({ id: '1', email: 'test@t.com' });
      const res = await controller.register(dto);
      expect(res).toEqual({ id: '1', email: 'test@t.com' });
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });
});
