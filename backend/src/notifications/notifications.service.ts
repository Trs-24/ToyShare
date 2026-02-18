
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, title: string, message: string) {
        return this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.prisma.notification.findUnique({ where: { id } });
        if (!notification) throw new NotFoundException('Notification not found');
        if (notification.userId !== userId) {
            throw new ForbiddenException('You can only mark your own notifications as read');
        }
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true };
    }
}
