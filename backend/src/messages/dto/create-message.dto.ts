import { IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  exchangeId: string;

  @IsString()
  content: string;
}
