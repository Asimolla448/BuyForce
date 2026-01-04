import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../guards/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor({ storage: multer.memoryStorage() }))
  async createWithFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductDto,
  ) {
    return this.productsService.createWithFiles(files, body);
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get('active')
  findActive() {
    return this.productsService.findActive();
  }

  @Public()
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.productsService.joinProduct(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/wishlist')
  addToWishlist(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.productsService.addToWishlist(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/wishlist')
  removeFromWishlist(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.productsService.removeFromWishlist(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({ storage: multer.memoryStorage() }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'ACTIVE' | 'COMPLETED' | 'FAILED',
  ) {
    return this.productsService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Public()
  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.productsService.findByCategory(category);
  }
}
