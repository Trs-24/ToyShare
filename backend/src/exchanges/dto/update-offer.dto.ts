import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateOfferDto {
  @IsString()
  @IsNotEmpty()
  itemOfferedId: string;
}
