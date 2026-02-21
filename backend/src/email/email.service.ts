import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    this.fromEmail =
      this.configService.get<string>('SMTP_FROM') || 'noreply@toyshare.app';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT') || 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"ToyShare" <${this.fromEmail}>`,
        to,
        subject: 'Підтвердіть ваш email — ToyShare',
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
            <h1 style="color: #4f46e5; text-align: center;">🧸 ToyShare</h1>
            <p style="color: #374151; font-size: 16px;">Вітаємо! Для завершення реєстрації підтвердіть ваш email:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${verifyUrl}" style="background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                ✅ Підтвердити email
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Якщо ви не реєструвалися на ToyShare, проігноруйте цей лист.</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendExchangeNotification(
    to: string,
    title: string,
    body: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"ToyShare" <${this.fromEmail}>`,
        to,
        subject: `${title} — ToyShare`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
            <h1 style="color: #4f46e5; text-align: center;">🧸 ToyShare</h1>
            <h2 style="color: #374151;">${title}</h2>
            <p style="color: #374151; font-size: 16px;">${body}</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/exchanges" style="background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Переглянути обміни
              </a>
            </div>
          </div>
        `,
      });
      this.logger.log(`Exchange notification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send exchange email to ${to}`, error);
    }
  }

  async sendMessageNotification(
    to: string,
    senderName: string,
    exchangeTitle: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"ToyShare" <${this.fromEmail}>`,
        to,
        subject: `Нове повідомлення від ${senderName} — ToyShare`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
            <h1 style="color: #4f46e5; text-align: center;">🧸 ToyShare</h1>
            <h2 style="color: #374151;">💬 Нове повідомлення</h2>
            <p style="color: #374151; font-size: 16px;"><strong>${senderName}</strong> надіслав вам повідомлення в обміні "${exchangeTitle}".</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/exchanges" style="background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Переглянути повідомлення
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Ви отримали цей лист, бо повідомлення не було прочитано протягом 10 хвилин.</p>
          </div>
        `,
      });
      this.logger.log(`Message notification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send message email to ${to}`, error);
    }
  }
}
