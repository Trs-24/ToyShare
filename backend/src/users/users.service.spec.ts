import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find a user by email', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findOne('test@test.com');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });

  describe('findByGoogleId', () => {
    it('should find a user by googleId', async () => {
      const mockUser = { id: '1', googleId: 'g123' };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findByGoogleId('g123');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { googleId: 'g123' },
      });
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const mockUser = { id: 'user-id-123' };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findById('user-id-123');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createData = { email: 'new@test.com', name: 'New User' };
      const createdUser = { id: '2', ...createData };
      mockPrismaService.user.create.mockResolvedValueOnce(createdUser);

      const result = await service.create(createData);
      expect(result).toEqual(createdUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { id: '1', email: 'test@test.com', ...updateData };
      mockPrismaService.user.update.mockResolvedValueOnce(updatedUser);

      const result = await service.update('1', updateData);
      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });
  });
});
