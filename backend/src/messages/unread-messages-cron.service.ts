import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

/**
 * Cron job that checks for unread messages older than 10 minutes
 * and sends email notifications to recipients who have email notifications enabled.
 */
@Injectable()
export class UnreadMessagesCronService {
  private readonly logger = new Logger(UnreadMessagesCronService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Runs every 5 minutes to check for messages that:
   * 1. Were created more than 10 minutes ago
   * 2. Have not been "notified" via email yet
   * 3. The recipient has emailNotifications enabled
   *
   * Since the Message model does not have an `isRead` or `emailNotified` field,
   * we track by checking unread notifications instead. We'll look for messages
   * where the corresponding notification is still unread.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleUnreadMessages() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    try {
      // Find messages older than 10 min that have unread notifications
      const unreadNotifications = await this.prisma.notification.findMany({
        where: {
          isRead: false,
          title: 'New message',
          createdAt: { lte: tenMinutesAgo },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              emailNotifications: true,
            },
          },
        },
      });

      for (const notif of unreadNotifications as any[]) {
        if (!notif.user || !notif.user.emailNotifications) continue;

        // Send email and mark notification so we don't email again
        await this.emailService.sendMessageNotification(
          notif.user.email,
          'Користувач',
          'обмін',
        );

        // Mark notification as read to prevent duplicate emails
        await this.prisma.notification.update({
          where: { id: notif.id },
          data: { isRead: true },
        });
      }

      if (unreadNotifications.length > 0) {
        this.logger.log(
          `Processed ${unreadNotifications.length} unread message notifications`,
        );
      }
    } catch (error) {
      this.logger.error('Error processing unread messages cron', error);
    }
  }
}
