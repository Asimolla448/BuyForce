import {
  Injectable,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsJsonService } from '../seed/products.seed';
import { RedisService } from '../redis/redis.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from 'src/payment/payment.service';

@Injectable()
export class ProductsService {
  constructor(
    private prismaService: PrismaService,
    private redis: RedisService,
    @Inject(forwardRef(() => ProductsJsonService))
    private productsJsonService: ProductsJsonService,
    private cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => NotificationsService))
    private notifications: NotificationsService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async findByCategory(category: string) {
    const cacheKey = `products:category:${category}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        if (typeof cached === 'string') {
          return this.addCalculations(JSON.parse(cached));
        }
        return this.addCalculations(JSON.parse(JSON.stringify(cached)));
      } catch (err) {
        console.warn(
          `Failed to parse cached products for category "${category}": ${err.message}`,
        );
        await this.redis.del(cacheKey);
      }
    }

    const products = await this.prismaService.prisma.product.findMany({
      where: { category },
      include: { joinedUsers: true, wishlistUsers: true },
    });

    if (products) {
      await this.redis.set(cacheKey, JSON.stringify(products), 60);
    }

    return this.addCalculations(products);
  }

  async createWithFiles(files: Express.Multer.File[], dto: CreateProductDto) {
    try {
      const mainImageFile = files.find((f) => f.fieldname === 'mainImage');
      if (!mainImageFile) {
        throw new BadRequestException('Main image is required');
      }
      const mainImageUrl =
        await this.cloudinaryService.uploadFile(mainImageFile);

      const imageFiles = files.filter((f) => f.fieldname === 'images');
      const imagesUrls = await Promise.all(
        imageFiles.map((f) => this.cloudinaryService.uploadFile(f)),
      );

      const videoFiles = files.filter((f) => f.fieldname === 'videos');
      const videosUrls = await Promise.all(
        videoFiles.map((f) => this.cloudinaryService.uploadFile(f)),
      );

      const productDto: CreateProductDto = {
        ...dto,
        mainImage: mainImageUrl,
        images: imagesUrls,
        videos: videosUrls,
      };

      return this.create(productDto);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async create(dto: CreateProductDto) {
    const regularPrice = Number(dto.regularPrice);
    const discountedPrice = Number(dto.discountPrice);
    const targetUsersCount = Number(dto.requiredUsers);
    const targetDate = new Date(dto.targetDate);

    const product = await this.prismaService.prisma.product.create({
      data: {
        name: dto.name,
        content: dto.content,
        regularPrice,
        discountedPrice,
        targetUsersCount,
        joinedUsers: { connect: [] },
        wishlistUsers: { connect: [] },
        targetDate,
        supplier: dto.supplier,
        status: dto.status || 'ACTIVE',
        category: dto.category,
        mainImage: dto.mainImage,
        images: dto.images || [],
        videos: dto.videos || [],
        notificationsLog: [],
      },
      include: { joinedUsers: true, wishlistUsers: true },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:category:${dto.category}`);

    await this.productsJsonService.addOrUpdateProduct({
      name: product.name,
      content: product.content,
      regularPrice: product.regularPrice,
      discountPrice: product.discountedPrice,
      requiredUsers: product.targetUsersCount,
      joinUsers: product.joinedUsers.map((u) => u.id),
      targetDate: product.targetDate,
      supplier: product.supplier,
      status: product.status,
      category: product.category,
      mainImage: product.mainImage,
      images: product.images,
      videos: product.videos,
    });

    const allUsers = await this.prismaService.prisma.user.findMany();
    for (const user of allUsers) {
      await this.notifications.create(
        user.id,
        'מוצר חדש זמין!',
        `המוצר "${product.name}" הוסף למערכת עכשיו.`,
      );
    }

    return this.addCalculations(product);
  }

  async findAll() {
    const cacheKey = 'products:all';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        if (typeof cached === 'string') {
          return this.addCalculations(JSON.parse(cached));
        }
        return this.addCalculations(JSON.parse(JSON.stringify(cached)));
      } catch (err) {
        console.warn(`Failed to parse cached products: ${err.message}`);
        await this.redis.del(cacheKey);
      }
    }

    const products = await this.prismaService.prisma.product.findMany({
      include: { joinedUsers: true, wishlistUsers: true },
    });

    if (products) {
      await this.redis.set(cacheKey, JSON.stringify(products), 60);
    }

    return this.addCalculations(products);
  }

  async findActive() {
    const products = await this.findAll();
    return products.filter((p) => p.status === 'ACTIVE');
  }

  async findById(id: number) {
    const cacheKey = `products:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        if (typeof cached === 'string') {
          return this.addCalculations(JSON.parse(cached));
        }
        return this.addCalculations(JSON.parse(JSON.stringify(cached)));
      } catch (err) {
        console.warn(`Failed to parse cached product ID ${id}: ${err.message}`);
        await this.redis.del(cacheKey);
      }
    }

    const product = await this.prismaService.prisma.product.findUnique({
      where: { id },
      include: { joinedUsers: true, wishlistUsers: true },
    });

    if (product) {
      await this.redis.set(cacheKey, JSON.stringify(product), 60);
    }

    return this.addCalculations(product);
  }

  async update(id: number, dto: Partial<CreateProductDto>) {
    const dataToUpdate: any = {
      name: dto.name,
      category: dto.category,
      mainImage: dto.mainImage,
      images: dto.images,
      videos: dto.videos,
    };

    Object.keys(dataToUpdate).forEach(
      (key) => dataToUpdate[key] === undefined && delete dataToUpdate[key],
    );

    const updated = await this.prismaService.prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { joinedUsers: true, wishlistUsers: true },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:${id}`);
    if (dto.category) await this.redis.del(`products:category:${dto.category}`);

    await this.productsJsonService.addOrUpdateProduct({
      name: updated.name,
      content: updated.content,
      regularPrice: updated.regularPrice,
      discountPrice: updated.discountedPrice,
      requiredUsers: updated.targetUsersCount,
      joinUsers: updated.joinedUsers.map((u) => u.id),
      targetDate: updated.targetDate,
      supplier: updated.supplier,
      status: updated.status,
      category: updated.category,
      mainImage: updated.mainImage,
      images: updated.images,
      videos: updated.videos,
    });

    return this.addCalculations(updated);
  }

  async remove(id: number) {
    const product = await this.prismaService.prisma.product.delete({
      where: { id },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:${id}`);
    await this.redis.del(`products:category:${product.category}`);

    return product;
  }

  async joinProduct(productId: number, userId: number) {
    const updated = await this.prismaService.prisma.product.update({
      where: { id: productId },
      data: { joinedUsers: { connect: { id: userId } } },
      include: { joinedUsers: true, wishlistUsers: true },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:${productId}`);

    const participants = updated.joinedUsers.length;
    const target = updated.targetUsersCount;
    const progress = (participants / target) * 100;

    let notificationsLog: number[] = updated.notificationsLog || [];

    if (progress >= 70 && !notificationsLog.includes(70)) {
      for (const user of updated.joinedUsers) {
        await this.notifications.create(
          user.id,
          'המוצר הגיע ל-70% מהיעד!',
          `המוצר "${updated.name}" הגיע ל-70% מהיעד. הצטרפותך נספרה.`,
        );
      }
      notificationsLog.push(70);
    }

    if (progress >= 95 && !notificationsLog.includes(95)) {
      for (const user of updated.joinedUsers) {
        await this.notifications.create(
          user.id,
          'המוצר הגיע ל-95% מהיעד!',
          `המוצר "${updated.name}" הגיע ל-95% מהיעד. הצטרפותך נספרה.`,
        );
      }
      notificationsLog.push(95);
    }

    await this.prismaService.prisma.product.update({
      where: { id: updated.id },
      data: { notificationsLog },
    });

    return this.addCalculations(updated);
  }

  async addToWishlist(productId: number, userId: number) {
    const product = await this.prismaService.prisma.product.findUnique({
      where: { id: productId },
      include: { wishlistUsers: true },
    });

    if (!product) throw new BadRequestException('Product not found');

    const isAlreadyInWishlist = product.wishlistUsers.some(
      (user) => user.id === userId,
    );
    if (isAlreadyInWishlist) return this.addCalculations(product);

    const updated = await this.prismaService.prisma.product.update({
      where: { id: productId },
      data: { wishlistUsers: { connect: { id: userId } } },
      include: { wishlistUsers: true, joinedUsers: true },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:${productId}`);

    return this.addCalculations(updated);
  }

  async removeFromWishlist(productId: number, userId: number) {
    const product = await this.prismaService.prisma.product.findUnique({
      where: { id: productId },
      include: { wishlistUsers: true, joinedUsers: true },
    });

    if (!product) throw new BadRequestException('Product not found');

    const isInWishlist = product.wishlistUsers.some(
      (user) => user.id === userId,
    );
    if (!isInWishlist) return this.addCalculations(product);

    const updated = await this.prismaService.prisma.product.update({
      where: { id: productId },
      data: { wishlistUsers: { disconnect: { id: userId } } },
      include: { wishlistUsers: true, joinedUsers: true },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:${productId}`);

    return this.addCalculations(updated);
  }

  async updateStatus(id: number, status: 'ACTIVE' | 'COMPLETED' | 'FAILED') {
    const updated = await this.prismaService.prisma.product.update({
      where: { id },
      data: { status },
      include: { joinedUsers: true, wishlistUsers: true },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:${id}`);
    await this.redis.del(`products:category:${updated.category}`);

    await this.productsJsonService.addOrUpdateProduct({
      name: updated.name,
      content: updated.content,
      regularPrice: updated.regularPrice,
      discountPrice: updated.discountedPrice,
      requiredUsers: updated.targetUsersCount,
      joinUsers: updated.joinedUsers.map((u) => u.id),
      targetDate: updated.targetDate,
      supplier: updated.supplier,
      status: updated.status,
      category: updated.category,
      mainImage: updated.mainImage,
      images: updated.images,
      videos: updated.videos,
    });

    if (status === 'COMPLETED' || status === 'FAILED') {
      await this.paymentsService.finalizePayments(id, status);
    }

    return this.addCalculations(updated);
  }

  private addCalculations(productOrProducts: any) {
    const now = new Date();

    const calculate = (product) => {
      const joinedUsers = Array.isArray(product.joinedUsers)
        ? product.joinedUsers
        : [];
      const targetUsersCount =
        typeof product.targetUsersCount === 'number'
          ? product.targetUsersCount
          : 0;

      const participants = joinedUsers.length;
      const progress =
        targetUsersCount > 0
          ? Math.min(Math.round((participants / targetUsersCount) * 100), 100)
          : 0;

      let status = product.status;
      const targetDate = product.targetDate
        ? new Date(product.targetDate)
        : now;

      if (participants >= targetUsersCount) status = 'COMPLETED';
      else if (now > targetDate && status === 'ACTIVE') status = 'FAILED';

      const timeLeft = Math.max(targetDate.getTime() - now.getTime(), 0);

      return { ...product, participants, progress, status, timeLeft };
    };

    if (Array.isArray(productOrProducts)) {
      return productOrProducts.map(calculate);
    }
    return calculate(productOrProducts);
  }
}
