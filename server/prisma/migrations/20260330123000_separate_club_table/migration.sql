-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Club_name_key" ON "Club"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Club_chatRoomId_key" ON "Club"("chatRoomId");

-- CreateIndex
CREATE INDEX "Club_createdById_idx" ON "Club"("createdById");

-- Seed clubs from existing chat rooms
INSERT INTO "Club" ("id", "name", "chatRoomId", "createdAt", "updatedAt")
SELECT
  "id",
  regexp_replace("name", '^CLUB::', ''),
  "id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ChatRoom"
WHERE "isGroup" = true
  AND "name" LIKE 'CLUB::%'
ON CONFLICT ("chatRoomId") DO NOTHING;

-- Add clubId to existing requests
ALTER TABLE "ClubJoinRequest" ADD COLUMN "clubId" TEXT;

UPDATE "ClubJoinRequest" cjr
SET "clubId" = c."id"
FROM "Club" c
WHERE c."chatRoomId" = cjr."chatRoomId";

-- Backfill clubs for any orphaned join requests
INSERT INTO "Club" ("id", "name", "chatRoomId", "createdAt", "updatedAt")
SELECT
  cr."id",
  regexp_replace(cr."name", '^CLUB::', ''),
  cr."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ClubJoinRequest" cjr
JOIN "ChatRoom" cr ON cr."id" = cjr."chatRoomId"
LEFT JOIN "Club" c ON c."chatRoomId" = cjr."chatRoomId"
WHERE c."id" IS NULL
ON CONFLICT ("chatRoomId") DO NOTHING;

UPDATE "ClubJoinRequest" cjr
SET "clubId" = c."id"
FROM "Club" c
WHERE c."chatRoomId" = cjr."chatRoomId"
  AND cjr."clubId" IS NULL;

ALTER TABLE "ClubJoinRequest" ALTER COLUMN "clubId" SET NOT NULL;

-- Drop old chatRoom-based constraints/indexes if present
DROP INDEX IF EXISTS "ClubJoinRequest_chatRoomId_status_idx";
DROP INDEX IF EXISTS "ClubJoinRequest_chatRoomId_requesterId_key";
ALTER TABLE "ClubJoinRequest" DROP CONSTRAINT IF EXISTS "ClubJoinRequest_chatRoomId_fkey";

-- Remove old chatRoom link column
ALTER TABLE "ClubJoinRequest" DROP COLUMN "chatRoomId";

-- New indexes/constraints
CREATE UNIQUE INDEX "ClubJoinRequest_clubId_requesterId_key" ON "ClubJoinRequest"("clubId", "requesterId");
CREATE INDEX "ClubJoinRequest_clubId_status_idx" ON "ClubJoinRequest"("clubId", "status");

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Club" ADD CONSTRAINT "Club_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClubJoinRequest" ADD CONSTRAINT "ClubJoinRequest_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
