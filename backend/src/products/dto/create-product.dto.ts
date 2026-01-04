export class CreateProductDto {
  name: string;
  regularPrice: number;
  discountPrice: number;
  content: string;
  mainImage: string;
  images?: string[];
  videos?: string[];
  requiredUsers: number;
  joinUsers?: number[];
  targetDate: Date;
  supplier: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  category: string;
}
