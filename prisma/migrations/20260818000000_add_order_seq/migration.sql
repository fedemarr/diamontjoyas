-- AlterTable
ALTER TABLE "Order" ADD COLUMN "orderSeq" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderSeq_key" ON "Order"("orderSeq");
