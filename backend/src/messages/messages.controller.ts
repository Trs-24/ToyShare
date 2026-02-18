import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Post()
  create(@Request() req, @Body() dto: CreateMessageDto) {
    return this.messagesService.create(req.user.userId, dto);
  }

  @Get('exchange/:exchangeId')
  findByExchange(@Param('exchangeId') exchangeId: string, @Request() req) {
    return this.messagesService.findByExchange(exchangeId, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.messagesService.delete(id, req.user.userId);
  }
}
