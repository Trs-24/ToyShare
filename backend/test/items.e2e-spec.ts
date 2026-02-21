import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

import { PrismaService } from '../src/prisma/prisma.service';
import { CloudinaryService } from '../src/cloudinary/cloudinary.service';

describe('ItemsController (e2e)', () => {
  let app: INestApplication;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      item: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'test-item-1',
            title: 'Test Toy',
            description: 'Test description',
            category: 'Toy',
            condition: 'GOOD',
            owner: { id: 'user-1', name: 'User 1' },
            photos: [{ url: 'http://example.com/photo.jpg' }],
            offeredInExchanges: [],
            requestedInExchanges: [],
          },
        ]),
        create: jest
          .fn()
          .mockImplementation((args) =>
            Promise.resolve({ id: 'new-item-id', ...args.data }),
          ),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(CloudinaryService)
      .useValue({ uploadImage: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/items (GET) - lists items', () => {
    return request(app.getHttpServer())
      .get('/items')
      .expect(200)
      .expect((res) => {
        expect(res.body.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ title: 'Test Toy' }),
          ]),
        );
      });
  });
});
