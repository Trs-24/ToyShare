import { IsEnum } from 'class-validator';
import { ExchangeStatus } from '@prisma/client';

export class UpdateExchangeDto {
  @IsEnum(ExchangeStatus)
  status: ExchangeStatus;
}
