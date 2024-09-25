/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "status" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_productId_key" ON "Order"("userId", "productId");
