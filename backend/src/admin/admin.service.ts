import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [totalUsers, totalItems, activeExchanges, completedExchanges] =
            await Promise.all([
                this.prisma.user.count(),
                this.prisma.item.count(),
                this.prisma.exchange.count({
                    where: { status: { in: ['PROPOSED', 'ACCEPTED', 'IN_PROGRESS'] } },
                }),
                this.prisma.exchange.count({
                    where: { status: 'COMPLETED' },
                }),
            ]);

        return { totalUsers, totalItems, activeExchanges, completedExchanges };
    }

    async findAllUsers(search?: string) {
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { city: { contains: search } },
            ];
        }

        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                avatarUrl: true,
                rating: true,
                status: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        items: true,
                        sentExchanges: true,
                        receivedExchanges: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateUser(id: string, data: any) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const allowedFields: any = {};
        if (data.name !== undefined) allowedFields.name = data.name;
        if (data.status !== undefined) allowedFields.status = data.status;
        if (data.role !== undefined) allowedFields.role = data.role;
        if (data.city !== undefined) allowedFields.city = data.city;
        if (data.phone !== undefined) allowedFields.phone = data.phone;

        const updated = await this.prisma.user.update({
            where: { id },
            data: allowedFields,
        });

        const { password, ...result } = updated;
        return result;
    }

    async findAllItems(search?: string) {
        const where: any = {};

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }

        return this.prisma.item.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
                photos: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateItem(id: string, data: any) {
        const item = await this.prisma.item.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Item not found');

        const allowedFields: any = {};
        if (data.title !== undefined) allowedFields.title = data.title;
        if (data.description !== undefined) allowedFields.description = data.description;
        if (data.isAvailable !== undefined) allowedFields.isAvailable = data.isAvailable;
        if (data.category !== undefined) allowedFields.category = data.category;
        if (data.condition !== undefined) allowedFields.condition = data.condition;

        return this.prisma.item.update({
            where: { id },
            data: allowedFields,
            include: {
                owner: { select: { id: true, name: true } },
                photos: true,
            },
        });
    }

    async deleteItem(id: string) {
        const item = await this.prisma.item.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Item not found');

        // Delete related photos first
        await this.prisma.photo.deleteMany({ where: { itemId: id } });
        return this.prisma.item.delete({ where: { id } });
    }

    async findAllExchanges() {
        return this.prisma.exchange.findMany({
            include: {
                itemOffered: { include: { photos: true } },
                itemRequested: { include: { photos: true } },
                initiator: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
                receiver: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
