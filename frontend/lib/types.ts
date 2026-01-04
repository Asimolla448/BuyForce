// src/lib/types.ts

export type UserRole = 'USER' | 'ADMIN';

export type User = {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  birthDate?: string;
  profileImage?: string;
};

export type ProductStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export type Product = {
  id: number;
  name: string;
  content: string;
  regularPrice: number;
  discountedPrice: number;
  targetUsersCount: number;
  joinedUsers: { id: number }[];
  wishlistUsers: { id: number }[];
  targetDate: string;
  supplier: string;
  status: ProductStatus;
  category: string;
  mainImage: string;
  images: string[];
  videos: string[];
};

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export type Payment = {
  id: number;
  userId: number;
  productId: number;
  paypalOrderId: string;
  amount: number;
  status: PaymentStatus;
};
