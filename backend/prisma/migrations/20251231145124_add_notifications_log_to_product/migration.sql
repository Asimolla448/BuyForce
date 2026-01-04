-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "notificationsLog" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
