import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exchanges')
@UseGuards(JwtAuthGuard)
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateExchangeDto) {
    return this.exchangesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: string) {
    return this.exchangesService.findAll(req.user.userId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.exchangesService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateExchangeDto,
  ) {
    return this.exchangesService.updateStatus(id, req.user.userId, dto);
  }

  @Patch(':id/offer')
  updateOffer(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateOfferDto,
  ) {
    return this.exchangesService.updateOffer(id, req.user.userId, dto);
  }

  @Patch(':id/shipping')
  updateShipping(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateShippingDto,
  ) {
    return this.exchangesService.updateShipping(id, req.user.userId, dto);
  }

  @Patch(':id/confirm-shipping')
  confirmShipping(@Param('id') id: string, @Request() req) {
    return this.exchangesService.confirmShipping(id, req.user.userId);
  }

  @Post(':id/rating')
  createRating(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: CreateRatingDto,
  ) {
    return this.exchangesService.createRating(id, req.user.userId, dto);
  }

  @Get(':id/rating')
  getRatings(@Param('id') id: string, @Request() req) {
    return this.exchangesService.getRatings(id, req.user.userId);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Request() req) {
    return this.exchangesService.cancel(id, req.user.userId);
  }
}
