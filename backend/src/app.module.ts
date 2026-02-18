import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { ConfigModule } from '@nestjs/config';
import { ExchangesModule } from './exchanges/exchanges.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    ExchangesModule,
    MessagesModule,
    NotificationsModule,
    AdminModule,
    CloudinaryModule,
  ],
})
export class AppModule { }
