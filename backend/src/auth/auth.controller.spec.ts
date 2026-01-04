import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.birthDate,
    );
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('users')
  getAll() {
    return this.auth.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req) {
    const userId = this.extractUserId(req);
    return this.auth.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishlist')
  wishlist(@Req() req) {
    const userId = this.extractUserId(req);
    return this.auth.getWishlist(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/wishlist/:productId')
  addToWishlist(@Req() req, @Param('productId') productId: string) {
    const userId = this.extractUserId(req);
    return this.auth.addToWishlist(userId, Number(productId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/wishlist/:productId')
  removeFromWishlist(@Req() req, @Param('productId') productId: string) {
    const userId = this.extractUserId(req);
    return this.auth.removeFromWishlist(userId, Number(productId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/join-group')
  joinGroup(@Req() req) {
    const userId = this.extractUserId(req);
    return this.auth.getJoinGroup(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  updateProfileImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const userId = this.extractUserId(req);
    return this.auth.updateProfileImage(userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/profile-image')
  removeProfileImage(@Req() req) {
    const userId = this.extractUserId(req);
    return this.auth.removeProfileImage(userId);
  }

  private extractUserId(req: any): number {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('No token');
    const token = authHeader.replace('Bearer ', '');
    const payload = this.auth.verifyToken(token);
    return payload.sub;
  }
}
