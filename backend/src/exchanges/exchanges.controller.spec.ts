import { Test, TestingModule } from '@nestjs/testing';
import { ExchangesController } from './exchanges.controller';
import { ExchangesService } from './exchanges.service';

describe('ExchangesController', () => {
  let controller: ExchangesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangesController],
      providers: [
        {
          provide: ExchangesService,
          useValue: {
            create: jest.fn(),
            findAllByUser: jest.fn(),
            findOne: jest.fn(),
            updateStatus: jest.fn(),
            updateShipping: jest.fn(),
            cancel: jest.fn(),
            createRating: jest.fn(),
            getRatings: jest.fn(),
            confirmShippingDetails: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExchangesController>(ExchangesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
