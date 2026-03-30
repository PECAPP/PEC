-- CreateTable
CREATE TABLE "ClubJoinRequest" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "proposalText" TEXT NOT NULL,
    "mediaJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubJoinRequest_chatRoomId_requesterId_key" ON "ClubJoinRequest"("chatRoomId", "requesterId");

-- CreateIndex
CREATE INDEX "ClubJoinRequest_chatRoomId_status_idx" ON "ClubJoinRequest"("chatRoomId", "status");

-- CreateIndex
CREATE INDEX "ClubJoinRequest_requesterId_status_idx" ON "ClubJoinRequest"("requesterId", "status");

-- CreateIndex
CREATE INDEX "ClubJoinRequest_status_createdAt_idx" ON "ClubJoinRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ClubJoinRequest" ADD CONSTRAINT "ClubJoinRequest_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubJoinRequest" ADD CONSTRAINT "ClubJoinRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubJoinRequest" ADD CONSTRAINT "ClubJoinRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
