import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedAdminService implements OnApplicationBootstrap {
  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const exists = await this.prisma.prisma.user.findFirst({
      where: { email: 'admin@example.com' },
    });

    if (exists) return;

    await this.prisma.prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    console.log('Admin user created automatically.');
  }
}
