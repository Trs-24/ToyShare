import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { Item } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createItemDto: CreateItemDto): Promise<Item> {
    const { photos, ...itemData } = createItemDto;

    return this.prisma.item.create({
      data: {
        ...itemData,
        ownerId: userId,
        photos: {
          create: photos?.map((url) => ({ url })) || [],
        },
      },
      include: {
        photos: true,
      },
    });
  }

  async findAll(params: {
    search?: string;
    category?: string;
    condition?: string;
    gender?: string;
    age?: string;
    type?: string;
    city?: string;
    ownerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const { search, category, condition, gender, age, type, city, ownerId } = params;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 15));

    const where: any = {
      isAvailable: true,
    };

    if (category) where.category = category;
    if (condition) where.condition = condition;
    if (gender) where.gender = gender;
    if (age) where.age = age;
    if (type) where.type = type;
    if (ownerId) {
      where.ownerId = ownerId;
      // When fetching own items, don't filter by availability
      delete where.isAvailable;
    }

    const items = await this.prisma.item.findMany({
      where,
      include: {
        owner: {
          select: { name: true, avatarUrl: true, id: true, city: true },
        },
        photos: true,
        offeredInExchanges: {
          where: {
            status: { in: ['ACCEPTED', 'IN_PROGRESS', 'PROPOSED'] },
          },
          select: { status: true },
          take: 1,
        },
        requestedInExchanges: {
          where: {
            status: { in: ['ACCEPTED', 'IN_PROGRESS', 'PROPOSED'] },
          },
          select: { status: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Case-insensitive filtering in JS (SQLite doesn't support mode: 'insensitive' for Unicode)
    let filtered = items;

    if (city) {
      const cityLower = city.toLowerCase();
      filtered = filtered.filter(
        (item) => item.owner?.city?.toLowerCase().includes(cityLower),
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower),
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const start = (page - 1) * limit;
    const paginatedItems = filtered.slice(start, start + limit);

    // Add exchangeStatus field to each item
    const result = paginatedItems.map((item) => {
      const activeExchange =
        item.offeredInExchanges[0] || item.requestedInExchanges[0];
      const { offeredInExchanges, requestedInExchanges, ...rest } = item;
      return {
        ...rest,
        exchangeStatus: activeExchange?.status || null,
      };
    });

    return { items: result, total, page, limit, totalPages };
  }

  async findOne(id: string): Promise<any | null> {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: {
        owner: {
          select: { name: true, avatarUrl: true, id: true, city: true },
        },
        photos: true,
        offeredInExchanges: {
          where: {
            status: { in: ['ACCEPTED', 'IN_PROGRESS', 'PROPOSED'] },
          },
          select: { status: true },
          take: 1,
        },
        requestedInExchanges: {
          where: {
            status: { in: ['ACCEPTED', 'IN_PROGRESS', 'PROPOSED'] },
          },
          select: { status: true },
          take: 1,
        },
      },
    });
    if (!item) return null;

    const activeExchange =
      item.offeredInExchanges[0] || item.requestedInExchanges[0];
    const { offeredInExchanges, requestedInExchanges, ...rest } = item;
    return {
      ...rest,
      exchangeStatus: activeExchange?.status || null,
    };
  }

  async update(id: string, userId: string, data: any): Promise<Item> {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item || item.ownerId !== userId) {
      throw new Error('Not found or forbidden');
    }
    const { photos, ...itemData } = data;
    const updateData: any = { ...itemData };

    if (photos) {
      updateData.photos = {
        deleteMany: {},
        create: photos.map((url) => ({ url })),
      };
    }

    return this.prisma.item.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string): Promise<Item> {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item || item.ownerId !== userId) {
      throw new Error('Not found or forbidden');
    }
    return this.prisma.item.delete({
      where: { id },
    });
  }
}
