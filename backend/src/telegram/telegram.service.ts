import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not provided, bot will not start');
      return;
    }
    this.bot = new Telegraf(token);
  }

  onModuleInit() {
    if (!this.bot) return;

    this.bot.start((ctx) => {
      ctx.reply(
        'Добро пожаловать в службу верификации ToyShare! Пожалуйста, поделитесь вашим номером телефона для верификации.',
        Markup.keyboard([
          Markup.button.contactRequest('📱 Поделиться контактом'),
        ])
          .resize()
          .oneTime(),
      );
    });

    this.bot.on('contact', async (ctx) => {
      const contact = ctx.message.contact;

      // Ensure the contact shared by the user is their own number (not someone else's)
      if (contact.user_id !== ctx.from.id) {
        return ctx.reply(
          'Пожалуйста, отправьте свой собственный номер телефона с помощью кнопки ниже.',
          Markup.keyboard([
            Markup.button.contactRequest('📱 Поделиться контактом'),
          ])
            .resize()
            .oneTime(),
        );
      }

      // Format phone starting with +, handling standard international formats
      // Example: 380XX... -> +380XX...
      let phoneNumber = contact.phone_number;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }

      this.logger.log(`Received contact sharing for phone: ${phoneNumber}`);

      try {
        const user = await this.prisma.user.findFirst({
          where: {
            OR: [
              { phone: phoneNumber },
              // In some cases they might have registered it without +
              { phone: phoneNumber.replace('+', '') },
            ],
          },
        });

        if (!user) {
          return ctx.reply(
            `Пользователь с номером ${phoneNumber} не найден в ToyShare. Убедитесь, что вы использовали этот номер при регистрации.`,
          );
        }

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            isPhoneVerified: true,
            telegramChatId: ctx.chat.id.toString(),
            telegramUsername: ctx.from.username || null,
          },
        });

        return ctx.reply(
          '✅ Ваш номер телефона успешно подтвержден! Вы можете вернуться на сайт ToyShare.',
          Markup.removeKeyboard(),
        );
      } catch (error) {
        this.logger.error('Error verifying phone', error);
        return ctx.reply(
          'Произошла ошибка при верификации. Пожалуйста, попробуйте позже.',
        );
      }
    });

    this.bot.launch();
    this.logger.log('Telegram Bot started');

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}
