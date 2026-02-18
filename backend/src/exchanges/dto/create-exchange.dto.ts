import { IsString, IsOptional } from 'class-validator';

export class CreateExchangeDto {
  @IsString()
  offeredItemId: string;

  @IsString()
  requestedItemId: string;

  @IsString()
  @IsOptional()
  note?: string;
}
