import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RedisService } from '../redis/redis.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationsService } from '../notifications/notifications.service';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cloudinaryService: CloudinaryService,
    private redis: RedisService,
    private notifications: NotificationsService,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthDate?: string,
  ) {
    const exists = await this.prisma.prisma.user.findUnique({
      where: { email },
    });
    if (exists) throw new BadRequestException('User already exists');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.prisma.user.create({
      data: {
        email,
        password: hash,
        role: 'USER',
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    try {
      const admins = await this.prisma.prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await this.notifications.create(
          admin.id,
          'משתמש חדש נרשם',
          `המשתמש "${firstName} ${lastName}" נרשם למערכת.`
        );
      }
    } catch (err) {
      console.error('Failed to send new user notification', err);
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequestException('Invalid credentials');

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken: token };
  }

  async getMe(userId: number) {
    const cacheKey = `user:${userId}:profile`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch {
        return cached;
      }
    }

    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        createdAt: true,
        profileImage: true,
      },
    });

    if (user) {
      await this.redis.set(cacheKey, JSON.stringify(user), 60);
    }

    return user;
  }

  async getWishlist(userId: number) {
    const cacheKey = `user:${userId}:wishlist`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch {
        return cached;
      }
    }

    const wishlist = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
      select: {
        wishlist: {
          select: {
            id: true,
            name: true,
            mainImage: true,
            regularPrice: true,
            discountedPrice: true,
            status: true,
            category: true,
          },
        },
      },
    });

    if (wishlist) {
      await this.redis.set(cacheKey, JSON.stringify(wishlist), 60);
    }

    return wishlist;
  }

  async getJoinGroup(userId: number) {
    const cacheKey = `user:${userId}:joined`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch {
        return cached;
      }
    }

    const joined = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
      select: { joinedSales: true },
    });

    if (joined) {
      await this.redis.set(cacheKey, JSON.stringify(joined), 60);
    }

    return joined;
  }

  verifyToken(token: string) {
    try {
      return this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getAllUsers() {
    const cacheKey = `users:all`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch {
        return cached;
      }
    }

    const users = await this.prisma.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        createdAt: true,
        profileImage: true,
      },
    });

    if (users) {
      await this.redis.set(cacheKey, JSON.stringify(users), 60);
    }

    return users;
  }

  async updateProfileImage(userId: number, file: Express.Multer.File) {
    const imageUrl = await this.cloudinaryService.uploadFile(file);
    const updated = await this.prisma.prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
      select: { id: true, profileImage: true },
    });

    await this.redis.del(`user:${userId}:profile`);
    return updated;
  }

  async removeProfileImage(userId: number) {
    const updated = await this.prisma.prisma.user.update({
      where: { id: userId },
      data: { profileImage: DEFAULT_AVATAR },
      select: { id: true, profileImage: true },
    });

    await this.redis.del(`user:${userId}:profile`);
    return updated;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isChangingSensitive = dto.email || dto.newPassword;

    if (isChangingSensitive) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid current password');
    }

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.prisma.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) throw new BadRequestException('Email already in use');
    }

    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.newPassword) data.password = await bcrypt.hash(dto.newPassword, 10);

    const updatedUser = await this.prisma.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      },
    });

    await this.redis.del(`user:${userId}:profile`);

    return updatedUser;
  }

  async deleteUser(userId: number) {
    const userToDelete = await this.prisma.prisma.user.findUnique({ where: { id: userId } });
    if (!userToDelete) throw new BadRequestException('User not found');

    await this.prisma.prisma.user.delete({ where: { id: userId } });

    await this.redis.del(`user:${userId}:profile`);
    await this.redis.del(`user:${userId}:wishlist`);
    await this.redis.del(`user:${userId}:joined`);

    try {
      const admins = await this.prisma.prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await this.notifications.create(
          admin.id,
          'משתמש נמחק',
          `המשתמש "${userToDelete.firstName} ${userToDelete.lastName}" נמחק מהמערכת.`
        );
      }
    } catch (err) {
      console.error('Failed to send user deleted notification', err);
    }

    return { message: 'User deleted successfully' };
  }
}
