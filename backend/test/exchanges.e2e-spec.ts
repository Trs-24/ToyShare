import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../src/notifications/notifications.service';

describe('ExchangesController (e2e)', () => {
  let app: INestApplication;
  let prismaService: any;
  let jwtService: JwtService;
  let mockToken: string;

  beforeEach(async () => {
    prismaService = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      item: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'item-2', ownerId: 'user-2' }),
      },
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'user-1', name: 'User 1' }),
      },
      exchange: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'new-exchange',
            ...args.data,
            initiator: { id: 'user-1', name: 'User 1' },
            receiver: { id: 'user-2', name: 'User 2' },
            itemRequested: { id: 'item-2', title: 'Test Toy' },
          }),
        ),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(NotificationsService)
      .useValue({ create: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = app.get<JwtService>(JwtService);
    mockToken = jwtService.sign(
      { sub: 'user-1', username: 'test@test.com' },
      { secret: process.env.JWT_SECRET || 'secret' },
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/exchanges (POST) - creates proposal', () => {
    return request(app.getHttpServer())
      .post('/exchanges')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ offeredItemId: 'item-1', requestedItemId: 'item-2' })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toEqual('new-exchange');
        expect(res.body.initiatorId).toEqual('user-1');
      });
  });
});
