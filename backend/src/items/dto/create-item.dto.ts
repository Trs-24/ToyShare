import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ItemCondition } from '@prisma/client';

export class CreateItemDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ItemCondition)
  condition: ItemCondition;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsString()
  @IsOptional()
  wishlist?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  age?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
