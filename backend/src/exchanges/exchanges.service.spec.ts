import { Test, TestingModule } from '@nestjs/testing';
import { ExchangesService } from './exchanges.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('ExchangesService', () => {
  let service: ExchangesService;
  let prisma: PrismaService;
  let notifications: NotificationsService;

  const mockPrismaService = {
    item: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    exchange: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    rating: {
      findUnique: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockEmailService = {
    sendExchangeNotification: jest.fn(),
    sendMessageNotification: jest.fn(),
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<ExchangesService>(ExchangesService);
    prisma = module.get<PrismaService>(PrismaService);
    notifications = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exchange proposal', async () => {
      const dto = { offeredItemId: 'item1', requestedItemId: 'item2' };
      const userId = 'user1';

      (prisma.item.findUnique as jest.Mock).mockResolvedValue({
        id: 'item2',
        ownerId: 'user2',
        title: 'Item 2',
        owner: { email: 'user2@example.com', emailNotifications: true },
      });
      (prisma.exchange.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.exchange.create as jest.Mock).mockResolvedValue({
        id: 'ex1',
        ...dto,
        initiatorId: userId,
        receiverId: 'user2',
        status: 'PROPOSED',
        initiator: { name: 'User 1' },
      });

      const result = await service.create(userId, dto);

      expect(result.status).toBe('PROPOSED');
      expect(prisma.exchange.create).toHaveBeenCalled();
      expect(notifications.create).toHaveBeenCalledWith(
        'user2',
        'New Exchange Proposal',
        expect.any(String),
      );
    });

    it('should throw BadRequest if requested item is in active exchange', async () => {
      const dto = { offeredItemId: 'item1', requestedItemId: 'item2' };
      const userId = 'user1';

      (prisma.item.findUnique as jest.Mock).mockResolvedValue({
        id: 'item2',
        ownerId: 'user2',
      });
      (prisma.exchange.findFirst as jest.Mock).mockResolvedValue({
        id: 'ex_active',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should allow receiver to accept exchange', async () => {
      const exchangeId = 'ex1';
      const userId = 'user2'; // receiver
      const dto = { status: 'ACCEPTED' };

      const mockExchange = {
        id: exchangeId,
        initiatorId: 'user1',
        receiverId: 'user2',
        status: 'PROPOSED',
        itemRequested: { title: 'Item 2' },
        initiator: { name: 'User 1' },
        receiver: { name: 'User 2' },
      };

      (prisma.exchange.findUnique as jest.Mock).mockResolvedValue(mockExchange);
      (prisma.exchange.update as jest.Mock).mockResolvedValue({
        ...mockExchange,
        status: 'ACCEPTED',
      });

      const result = await service.updateStatus(exchangeId, userId, dto as any);

      expect(result.status).toBe('ACCEPTED');
      expect(notifications.create).toHaveBeenCalledWith(
        'user1',
        expect.stringContaining('ACCEPTED'),
        expect.any(String),
      );
    });

    it('should forbid non-receiver from accepting', async () => {
      const exchangeId = 'ex1';
      const userId = 'user1'; // initiator
      const dto = { status: 'ACCEPTED' };

      const mockExchange = {
        id: exchangeId,
        initiatorId: 'user1',
        receiverId: 'user2',
        status: 'PROPOSED',
      };

      (prisma.exchange.findUnique as jest.Mock).mockResolvedValue(mockExchange);

      await expect(
        service.updateStatus(exchangeId, userId, dto as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
