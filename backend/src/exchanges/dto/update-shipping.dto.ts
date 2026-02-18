import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateShippingDto {
    @IsDateString()
    @IsOptional()
    meetingDate?: string;

    @IsString()
    @IsOptional()
    postOffice?: string;

    @IsString()
    @IsOptional()
    shippingNote?: string;
}
