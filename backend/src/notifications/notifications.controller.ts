import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('auth/me/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id;
    return { notifications: await this.notificationsService.findAllForUser(userId) };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(parseInt(id, 10), userId);
  }
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, AdminGuard)
export class NotificationsAdminController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('all')
  async findAllAdmin() {
    return this.notificationsService.findAll();
  }
}
