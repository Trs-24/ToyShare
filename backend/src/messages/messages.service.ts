import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) { }

  async create(userId: string, dto: CreateMessageDto) {
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: dto.exchangeId },
    });
    if (!exchange) throw new NotFoundException('Exchange not found');

    // Verify the sender is a participant of this exchange
    if (exchange.initiatorId !== userId && exchange.receiverId !== userId) {
      throw new ForbiddenException('You are not a participant of this exchange');
    }

    const receiverId =
      exchange.initiatorId === userId
        ? exchange.receiverId
        : exchange.initiatorId;

    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        senderId: userId,
        receiverId: receiverId,
        exchangeId: dto.exchangeId,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Notify the receiver about the new message
    await this.notificationsService.create(
      receiverId,
      'New message',
      `${message.sender.name} sent you a message`,
    );

    return message;
  }

  async findByExchange(exchangeId: string, userId: string) {
    // Verify the user is a participant of this exchange
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: exchangeId },
    });
    if (!exchange) throw new NotFoundException('Exchange not found');
    if (exchange.initiatorId !== userId && exchange.receiverId !== userId) {
      throw new ForbiddenException('You are not a participant of this exchange');
    }

    return this.prisma.message.findMany({
      where: { exchangeId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, userId: string, dto: UpdateMessageDto) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    return this.prisma.message.update({
      where: { id },
      data: { content: dto.content },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async delete(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }
}
