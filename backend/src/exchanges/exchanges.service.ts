import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class ExchangesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, dto: CreateExchangeDto) {
    const requestedItem = await this.prisma.item.findUnique({
      where: { id: dto.requestedItemId },
      include: { owner: true },
    });
    if (!requestedItem) throw new NotFoundException('Requested item not found');

    // Check if requested item is already in an active exchange
    const activeExchangeForRequested = await this.prisma.exchange.findFirst({
      where: {
        OR: [
          { itemOfferedId: dto.requestedItemId },
          { itemRequestedId: dto.requestedItemId },
        ],
        status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
      },
    });
    if (activeExchangeForRequested) {
      throw new BadRequestException(
        'This item is already in an active exchange',
      );
    }

    // NEW: Check if this user already proposed an exchange for this item
    const existingProposal = await this.prisma.exchange.findFirst({
      where: {
        initiatorId: userId,
        itemRequestedId: dto.requestedItemId,
        status: 'PROPOSED',
      },
    });
    if (existingProposal) {
      throw new BadRequestException(
        'You already have a pending proposal for this item',
      );
    }

    // Check if offered item is already in an active exchange
    if (dto.offeredItemId) {
      const activeExchangeForOffered = await this.prisma.exchange.findFirst({
        where: {
          OR: [
            { itemOfferedId: dto.offeredItemId },
            { itemRequestedId: dto.offeredItemId },
          ],
          status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
        },
      });
      if (activeExchangeForOffered) {
        throw new BadRequestException(
          'Your item is already in an active exchange',
        );
      }
    }

    const exchange = await this.prisma.exchange.create({
      data: {
        itemOfferedId: dto.offeredItemId,
        itemRequestedId: dto.requestedItemId,
        initiatorId: userId,
        receiverId: requestedItem.ownerId,
        status: 'PROPOSED',
      },
      include: {
        itemOffered: true,
        itemRequested: true,
        initiator: { select: { id: true, name: true, email: true } },
      },
    });

    await this.notificationsService.create(
      requestedItem.ownerId,
      'New Exchange Proposal',
      `${exchange.initiator.name} Proposed an exchange for ${requestedItem.title}`,
    );

    // Send email notification if user opted in
    if ((requestedItem.owner as any).emailNotifications) {
      this.emailService.sendExchangeNotification(
        requestedItem.owner.email,
        'Нова пропозиція обміну',
        `${exchange.initiator.name} запропонував обмін на ваш товар "${requestedItem.title}".`,
      );
    }

    return exchange;
  }

  async findAll(userId: string, status?: string) {
    const where: any = {
      OR: [{ initiatorId: userId }, { receiverId: userId }],
    };
    if (status) {
      where.status = status;
    }
    return this.prisma.exchange.findMany({
      where,
      include: {
        itemOffered: { include: { photos: true } },
        itemRequested: { include: { photos: true } },
        initiator: {
          select: { id: true, name: true, avatarUrl: true, rating: true },
        },
        receiver: {
          select: { id: true, name: true, avatarUrl: true, rating: true },
        },
        ratings: {
          include: {
            fromUser: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const exchange = await this.prisma.exchange.findUnique({
      where: { id },
      include: {
        itemOffered: { include: { photos: true, owner: true } },
        itemRequested: { include: { photos: true, owner: true } },
        initiator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            avatarUrl: true,
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        ratings: {
          include: {
            fromUser: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!exchange) throw new NotFoundException('Exchange not found');

    // If userId is provided, verify the user is a participant
    if (
      userId &&
      exchange.initiatorId !== userId &&
      exchange.receiverId !== userId
    ) {
      throw new ForbiddenException(
        'You are not a participant of this exchange',
      );
    }

    return exchange;
  }

  /**
   * Updates the status of an exchange.
   * Handles complex state transitions including:
   * - Completing an exchange (requires both parties to confirm shipping and completion)
   * - Cancelling/Rejecting proposals
   * - Updating status during the normal flow (PROPOSED -> ACCEPTED -> IN_PROGRESS)
   *
   * @param id Exchange ID
   * @param userId ID of the user performing the action
   * @param dto New status
   */
  async updateStatus(id: string, userId: string, dto: UpdateExchangeDto) {
    const exchange = await this.findOne(id);

    // Allow both participants to mark as COMPLETED
    if (dto.status === 'COMPLETED') {
      if (exchange.initiatorId !== userId && exchange.receiverId !== userId) {
        throw new ForbiddenException(
          'Only exchange participants can complete this exchange',
        );
      }
      if (exchange.status !== 'IN_PROGRESS') {
        throw new BadRequestException(
          'Only in-progress exchanges can be completed',
        );
      }

      // Both users must confirm shipping before completing
      const ex = exchange as any;
      if (!ex.initiatorShippingConfirmed || !ex.receiverShippingConfirmed) {
        throw new BadRequestException(
          'Both participants must confirm shipping details before completing the exchange',
        );
      }

      // Set the confirmation flag for this user
      const isInitiator = exchange.initiatorId === userId;
      const updateData: any = isInitiator
        ? { initiatorCompleted: true }
        : { receiverCompleted: true };

      // Check if the OTHER user already confirmed
      const otherConfirmed = isInitiator
        ? (exchange as any).receiverCompleted
        : (exchange as any).initiatorCompleted;

      // If both confirmed, transition to COMPLETED
      if (otherConfirmed) {
        updateData.status = 'COMPLETED';
      }

      const updated = await this.prisma.exchange.update({
        where: { id },
        data: updateData,
        include: {
          itemOffered: true,
          itemRequested: true,
          initiator: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
      });

      // If both confirmed — mark items unavailable and cancel other exchanges
      if (otherConfirmed) {
        const itemIds = [
          exchange.itemOfferedId,
          exchange.itemRequestedId,
        ].filter(Boolean) as string[];

        if (itemIds.length > 0) {
          await this.prisma.item.updateMany({
            where: { id: { in: itemIds } },
            data: { isAvailable: false },
          });
        }

        await this.prisma.exchange.updateMany({
          where: {
            id: { not: id },
            OR: [
              { itemOfferedId: { in: itemIds } },
              { itemRequestedId: { in: itemIds } },
            ],
            status: { in: ['PROPOSED', 'ACCEPTED'] },
          },
          data: { status: 'CANCELLED' },
        });
      }

      const otherUserId = isInitiator
        ? exchange.receiverId
        : exchange.initiatorId;
      const actorName = isInitiator
        ? exchange.initiator.name
        : exchange.receiver.name;

      await this.notificationsService.create(
        otherUserId,
        otherConfirmed ? 'Exchange completed' : 'Completion confirmation',
        otherConfirmed
          ? `Exchange for ${exchange.itemRequested?.title} has been completed by both participants`
          : `${actorName} has confirmed exchange completion. Please confirm on your side.`,
      );

      return updated;
    }

    // For non-COMPLETED statuses, only receiver can update
    if (exchange.receiverId !== userId) {
      throw new ForbiddenException(
        'Only the receiver can update this exchange status',
      );
    }

    const updated = await this.prisma.exchange.update({
      where: { id },
      data: { status: dto.status },
      include: {
        itemOffered: true,
        itemRequested: true,
        initiator: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    const otherUserId =
      exchange.initiatorId === userId
        ? exchange.receiverId
        : exchange.initiatorId;
    const actorName =
      exchange.initiatorId === userId
        ? exchange.initiator.name
        : exchange.receiver.name;

    await this.notificationsService.create(
      otherUserId,
      `Exchange ${dto.status}`,
      `${actorName} ${dto.status.toLowerCase()} the exchange for ${exchange.itemRequested?.title}`,
    );

    return updated;
  }

  /**
   * Updates the offered item for a PROPOSED exchange.
   * - Allowed only for the initiator.
   * - Allowed only in PROPOSED status.
   */
  async updateOffer(id: string, userId: string, dto: UpdateOfferDto) {
    const exchange = await this.prisma.exchange.findUnique({ where: { id } });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    if (exchange.initiatorId !== userId) {
      throw new ForbiddenException('You can only update your own proposals');
    }

    if (exchange.status !== 'PROPOSED') {
      throw new BadRequestException('Can only update PROPOSED exchanges');
    }

    // Verify the new offered item belongs to the user and is available
    if (dto.itemOfferedId) {
      const newOfferedItem = await this.prisma.item.findUnique({
        where: { id: dto.itemOfferedId },
      });

      if (!newOfferedItem || newOfferedItem.ownerId !== userId) {
        throw new ForbiddenException('You do not own the offered item');
      }

      // Check if new offered item is not already in an active exchange
      const activeExchangeForOffered = await this.prisma.exchange.findFirst({
        where: {
          id: { not: id }, // exclude this exchange itself
          OR: [
            { itemOfferedId: dto.itemOfferedId },
            { itemRequestedId: dto.itemOfferedId },
          ],
          status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
        },
      });

      if (activeExchangeForOffered) {
        throw new BadRequestException(
          'Your item is already in an active exchange',
        );
      }
    }

    const updated = await this.prisma.exchange.update({
      where: { id },
      data: {
        itemOfferedId: dto.itemOfferedId,
      },
      include: {
        itemOffered: true,
        itemRequested: true,
        initiator: { select: { id: true, name: true } },
      },
    });

    // Notify the receiver about the changed proposal
    await this.notificationsService.create(
      exchange.receiverId,
      'Пропозиція змінена',
      `${updated.initiator.name} змінив запропонований товар для обміну на ${updated.itemRequested?.title}`,
    );

    return updated;
  }

  /**
   * Updates shipping details for an exchange.
   * - Allowed only for participants.
   * - Allowed only in ACCEPTED or IN_PROGRESS status.
   * - Automatically transitions exchange from ACCEPTED to IN_PROGRESS.
   * - Prevents editing if the user has already "confirmed" their shipping details.
   */
  async updateShipping(id: string, userId: string, dto: UpdateShippingDto) {
    const exchange = await this.findOne(id);

    // Both participants can update shipping details
    if (exchange.initiatorId !== userId && exchange.receiverId !== userId) {
      throw new ForbiddenException(
        'Only exchange participants can update shipping details',
      );
    }

    // Block editing if user already confirmed shipping
    const isInitiator = exchange.initiatorId === userId;
    const exShipping = exchange as any;
    if (isInitiator && exShipping.initiatorShippingConfirmed) {
      throw new BadRequestException(
        'You have already confirmed shipping details. Editing is no longer possible.',
      );
    }
    if (!isInitiator && exShipping.receiverShippingConfirmed) {
      throw new BadRequestException(
        'You have already confirmed shipping details. Editing is no longer possible.',
      );
    }

    const status = exchange.status as string;
    if (status !== 'ACCEPTED' && status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Shipping can only be updated for accepted or in-progress exchanges',
      );
    }

    const data: any = {};
    if (dto.meetingDate) data.meetingDate = new Date(dto.meetingDate);
    if (dto.postOffice !== undefined) data.postOffice = dto.postOffice;
    if (dto.shippingNote !== undefined) data.shippingNote = dto.shippingNote;

    // Automatically transition to IN_PROGRESS if currently ACCEPTED
    if (exchange.status === 'ACCEPTED') {
      data.status = 'IN_PROGRESS';
    }

    const updated = await this.prisma.exchange.update({
      where: { id },
      data,
      include: {
        itemOffered: true,
        itemRequested: true,
        initiator: {
          select: { id: true, name: true, phone: true, city: true },
        },
        receiver: {
          select: { id: true, name: true, phone: true, city: true },
        },
      },
    });

    // Notify the other participant
    const otherUserId =
      exchange.initiatorId === userId
        ? exchange.receiverId
        : exchange.initiatorId;

    await this.notificationsService.create(
      otherUserId,
      'Shipping Details Updated',
      `Shipping details for exchange have been updated`,
    );

    return updated;
  }

  async confirmShipping(id: string, userId: string) {
    const exchange = await this.findOne(id);

    if (exchange.initiatorId !== userId && exchange.receiverId !== userId) {
      throw new ForbiddenException(
        'Only exchange participants can confirm shipping',
      );
    }

    const status = exchange.status as string;
    if (status !== 'ACCEPTED' && status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Shipping can only be confirmed for accepted or in-progress exchanges',
      );
    }

    // Require at least some shipping data
    if (!exchange.meetingDate && !exchange.postOffice) {
      throw new BadRequestException(
        'Please specify a meeting date or post office before confirming',
      );
    }

    const isInitiator = exchange.initiatorId === userId;
    const exConfirm = exchange as any;
    if (isInitiator && exConfirm.initiatorShippingConfirmed) {
      throw new BadRequestException(
        'You have already confirmed shipping details',
      );
    }
    if (!isInitiator && exConfirm.receiverShippingConfirmed) {
      throw new BadRequestException(
        'You have already confirmed shipping details',
      );
    }

    const data: any = isInitiator
      ? { initiatorShippingConfirmed: true }
      : { receiverShippingConfirmed: true };

    // Automatically transition to IN_PROGRESS if currently ACCEPTED
    if (exchange.status === 'ACCEPTED') {
      data.status = 'IN_PROGRESS';
    }

    const updated = await this.prisma.exchange.update({
      where: { id },
      data,
      include: {
        itemOffered: true,
        itemRequested: true,
        initiator: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    // Notify the other participant
    const otherUserId = isInitiator
      ? exchange.receiverId
      : exchange.initiatorId;
    const actorName = isInitiator
      ? exchange.initiator.name
      : exchange.receiver.name;

    await this.notificationsService.create(
      otherUserId,
      'Shipping details confirmed',
      `${actorName} has confirmed shipping details`,
    );

    return updated;
  }

  async cancel(id: string, userId: string) {
    const exchange = await this.findOne(id);

    if (exchange.initiatorId !== userId) {
      throw new ForbiddenException(
        'Only the initiator can cancel this exchange',
      );
    }

    return this.prisma.exchange.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async createRating(exchangeId: string, userId: string, dto: CreateRatingDto) {
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: exchangeId },
    });
    if (!exchange) throw new NotFoundException('Exchange not found');
    if (exchange.status !== 'COMPLETED') {
      throw new BadRequestException('Can only rate completed exchanges');
    }
    if (exchange.initiatorId !== userId && exchange.receiverId !== userId) {
      throw new ForbiddenException(
        'Only exchange participants can leave ratings',
      );
    }

    const toUserId =
      exchange.initiatorId === userId
        ? exchange.receiverId
        : exchange.initiatorId;

    // Check for existing rating
    const existing = await this.prisma.rating.findUnique({
      where: { exchangeId_fromUserId: { exchangeId, fromUserId: userId } },
    });
    if (existing) {
      throw new BadRequestException('You have already rated this exchange');
    }

    const rating = await this.prisma.rating.create({
      data: {
        score: dto.score,
        comment: dto.comment,
        exchangeId,
        fromUserId: userId,
        toUserId,
      },
      include: {
        fromUser: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Recalculate average rating for the target user
    const aggregate = await this.prisma.rating.aggregate({
      where: { toUserId },
      _avg: { score: true },
    });
    await this.prisma.user.update({
      where: { id: toUserId },
      data: { rating: aggregate._avg.score || 0 },
    });

    return rating;
  }

  async getRatings(exchangeId: string, userId: string) {
    // Verify the user is a participant
    const exchange = await this.prisma.exchange.findUnique({
      where: { id: exchangeId },
    });
    if (!exchange) throw new NotFoundException('Exchange not found');
    if (exchange.initiatorId !== userId && exchange.receiverId !== userId) {
      throw new ForbiddenException(
        'You are not a participant of this exchange',
      );
    }

    return this.prisma.rating.findMany({
      where: { exchangeId },
      include: {
        fromUser: { select: { id: true, name: true, avatarUrl: true } },
        toUser: { select: { id: true, name: true } },
      },
    });
  }
}
