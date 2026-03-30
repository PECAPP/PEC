-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'update',
    "important" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "mediaJson" TEXT,
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notice_pinned_publishedAt_idx" ON "Notice"("pinned", "publishedAt");

-- CreateIndex
CREATE INDEX "Notice_category_publishedAt_idx" ON "Notice"("category", "publishedAt");

-- CreateIndex
CREATE INDEX "Notice_authorId_idx" ON "Notice"("authorId");

-- CreateIndex
CREATE INDEX "Notice_deletedAt_publishedAt_idx" ON "Notice"("deletedAt", "publishedAt");

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
