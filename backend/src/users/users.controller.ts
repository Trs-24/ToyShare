import {
    Controller,
    Get,
    Patch,
    Body,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(
        @Request() req,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const user = await this.usersService.update(req.user.userId, updateUserDto);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile/avatar')
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/avatars',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async uploadAvatar(
        @Request() req,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) throw new NotFoundException('File not found');

        return this.usersService.update(req.user.userId, {
            avatarUrl: `/uploads/avatars/${file.filename}`,
        });
    }
}
