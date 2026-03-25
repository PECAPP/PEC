-- Enforce single community/group room identity per (name, isGroup)
CREATE UNIQUE INDEX IF NOT EXISTS "ChatRoom_name_isGroup_key"
  ON "ChatRoom"("name", "isGroup");
