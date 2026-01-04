import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CreateProductDto } from '../products/dto/create-product.dto';

@Injectable()
export class ProductsJsonService implements OnModuleInit {
  private readonly filePath = join(process.cwd(), 'src', 'seed', 'products.json');

  async onModuleInit(): Promise<void> {
    const products = await this.getProducts();
    console.log('JSON loaded:', products.length, 'products');
  }

  async getProducts(): Promise<CreateProductDto[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      if (!data.trim()) return []; 
      return JSON.parse(data) as CreateProductDto[];
    } catch (err) {
      console.warn('Failed to parse products.json, returning empty array:', err.message);
      return []; 
    }
  }

  async addOrUpdateProduct(product: CreateProductDto): Promise<void> {
    const products = await this.getProducts();

    const index = products.findIndex((p) => p.name === product.name);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }

    await fs.writeFile(this.filePath, JSON.stringify(products, null, 2), 'utf-8');
  }

  async removeProduct(productName: string): Promise<void> {
    const products = await this.getProducts();
    const updatedProducts = products.filter((p) => p.name !== productName);
    await fs.writeFile(this.filePath, JSON.stringify(updatedProducts, null, 2), 'utf-8');
  }
}
