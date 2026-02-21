import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UnreadMessagesCronService } from './unread-messages-cron.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [MessagesService, UnreadMessagesCronService],
  controllers: [MessagesController],
})
export class MessagesModule {}
