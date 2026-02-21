import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

import { PrismaService } from '../src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: any;

  const testUser = {
    email: 'e2e@test.com',
    password: 'password123',
    name: 'E2E User',
    phone: '+380991234567',
  };

  beforeEach(async () => {
    prismaService = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      user: {
        create: jest
          .fn()
          .mockImplementation((args) =>
            Promise.resolve({ id: 'test-id', ...args.data }),
          ),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toEqual(testUser.email);
        expect(res.body.id).toBeDefined();
        // ensure password isn't leaked
        expect(res.body.password).toBeUndefined();
      });
  });

  it('/auth/register (POST) - duplicate email throws 400', () => {
    prismaService.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '6.0.0',
      }),
    );

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain(
          'Account with this email or phone already exists',
        );
      });
  });

  it('/auth/login (POST)', () => {
    const hashedPass = '$2b$10$EP0fT2Z...'; // Dummy hash string
    (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

    prismaService.user.findUnique.mockResolvedValueOnce({
      id: 'test-id',
      email: testUser.email,
      password: hashedPass,
      role: 'USER',
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });
});
