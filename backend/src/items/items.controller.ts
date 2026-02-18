import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
  Delete,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(req.user.userId, createItemDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('condition') condition?: string,
    @Query('gender') gender?: string,
    @Query('age') age?: string,
    @Query('type') type?: string,
    @Query('city') city?: string,
    @Query('ownerId') ownerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.itemsService.findAll({
      search,
      category,
      condition,
      gender,
      age,
      type,
      city,
      ownerId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    try {
      return await this.itemsService.update(id, req.user.userId, updateItemDto);
    } catch {
      throw new ForbiddenException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    try {
      return await this.itemsService.remove(id, req.user.userId);
    } catch {
      throw new ForbiddenException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(), // Use memory storage for Cloudinary upload
      fileFilter: (req, file, cb) => {
        const allowedTypes = /\.(jpg|jpeg|png|webp|gif)$/i;
        if (!allowedTypes.test(file.originalname)) {
          return cb(new ForbiddenException('Only image files are allowed (jpg, jpeg, png, webp, gif)'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file);
    return {
      url: result.secure_url,
    };
  }
}
