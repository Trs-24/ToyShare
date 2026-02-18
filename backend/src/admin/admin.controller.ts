import {
    Controller,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    getStats() {
        return this.adminService.getStats();
    }

    @Get('users')
    findAllUsers(@Query('search') search?: string) {
        return this.adminService.findAllUsers(search);
    }

    @Patch('users/:id')
    updateUser(@Param('id') id: string, @Body() data: any) {
        return this.adminService.updateUser(id, data);
    }

    @Get('items')
    findAllItems(@Query('search') search?: string) {
        return this.adminService.findAllItems(search);
    }

    @Patch('items/:id')
    updateItem(@Param('id') id: string, @Body() data: any) {
        return this.adminService.updateItem(id, data);
    }

    @Delete('items/:id')
    deleteItem(@Param('id') id: string) {
        return this.adminService.deleteItem(id);
    }

    @Get('exchanges')
    findAllExchanges() {
        return this.adminService.findAllExchanges();
    }
}
