import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findById: jest.Mock;
    update: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile using userId from req.user', async () => {
      const req = { user: { userId: 'user-1' } };
      const mockUser = { id: 'user-1', name: 'Test' };
      usersService.findById.mockResolvedValue(mockUser);

      const res = await controller.getProfile(req);
      expect(res).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile using userId from req.user', async () => {
      const req = { user: { userId: 'user-1' } };
      const dto = { name: 'New Name' };
      const updatedUser = { id: 'user-1', name: 'New Name' };
      usersService.update.mockResolvedValue(updatedUser);

      const res = await controller.updateProfile(req, dto);
      expect(res).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('user-1', dto);
    });
  });
});
