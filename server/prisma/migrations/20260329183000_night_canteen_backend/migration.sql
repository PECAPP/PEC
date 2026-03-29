-- CreateTable
CREATE TABLE "CanteenItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanteenItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanteenOrder" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "studentName" TEXT NOT NULL,
    "hostelRoom" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanteenOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CanteenItem_category_isAvailable_idx" ON "CanteenItem"("category", "isAvailable");

-- CreateIndex
CREATE INDEX "CanteenItem_updatedAt_idx" ON "CanteenItem"("updatedAt");

-- CreateIndex
CREATE INDEX "CanteenOrder_studentId_status_idx" ON "CanteenOrder"("studentId", "status");

-- CreateIndex
CREATE INDEX "CanteenOrder_timestamp_idx" ON "CanteenOrder"("timestamp");

-- AddForeignKey
ALTER TABLE "CanteenOrder" ADD CONSTRAINT "CanteenOrder_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
