import api from "@/lib/api";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  type?: "text" | "image" | "video" | "file";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  mentions?: string[];
  replyTo?: { text: string; senderName: string };
  parentId?: string;
  starredBy?: string[];
  deletedAt?: string | null;
  createdAt: { toDate: () => Date };
}

type ApiMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: { id: string; name?: string | null };
};

const toChatMessage = (message: ApiMessage): ChatMessage => {
  const parsedPayload = (() => {
    try {
      if (
        typeof message.content === "string" &&
        message.content.startsWith("{")
      ) {
        return JSON.parse(message.content);
      }
    } catch {
      return null;
    }
    return null;
  })();

  const content = parsedPayload?.text ?? message.content;

  return {
    id: message.id,
    senderId: message.senderId,
    senderName: message.sender?.name || undefined,
    text: content,
    type: parsedPayload?.type || "text",
    mediaUrl: parsedPayload?.mediaUrl,
    fileName: parsedPayload?.fileName,
    fileSize: parsedPayload?.fileSize,
    mentions: parsedPayload?.mentions,
    replyTo: parsedPayload?.replyTo,
    parentId: parsedPayload?.parentId,
    starredBy: [],
    deletedAt: null,
    createdAt: {
      toDate: () => new Date(message.createdAt),
    },
  };
};

export function subscribeToMessages(
  roomId: string,
  onChange: (messages: ChatMessage[]) => void,
  limit = 20,
) {
  let active = true;

  const load = async () => {
    try {
      const res = await api.get<ApiMessage[]>(`/chat/messages/${roomId}`, {
        params: { limit },
      });
      if (!active) return;
      const mapped = Array.isArray(res.data) ? res.data.map(toChatMessage) : [];
      onChange(mapped);
    } catch {
      if (!active) return;
      onChange([]);
    }
  };

  void load();
  const timer = window.setInterval(load, 4000);

  return () => {
    active = false;
    window.clearInterval(timer);
  };
}

export async function sendMessage(
  roomId: string,
  text: string,
  metadata?: {
    mentions?: string[];
    parentId?: string;
    replyTo?: { text: string; senderName: string };
  },
) {
  const normalizedText = text.trim();
  if (!normalizedText) return;

  const payload =
    metadata &&
    (metadata.mentions?.length || metadata.parentId || metadata.replyTo)
      ? JSON.stringify({ text: normalizedText, type: "text", ...metadata })
      : normalizedText;

  await api.post("/chat/message", {
    chatRoomId: roomId,
    content: payload,
  });
}

export async function deleteMessage(
  roomId: string,
  messageId: string,
  hardDelete = false,
) {
  await api.delete(`/chat/message/${messageId}`);
}

export async function toggleStarMessage(
  roomId: string,
  messageId: string,
  userId: string,
  starred: boolean,
) {
  return;
}

export async function sendMediaMessage(
  roomId: string,
  mediaUrl: string,
  type: "image" | "video" | "file",
  options?: {
    text?: string;
    fileName?: string;
    fileSize?: number;
    thumbnailUrl?: string;
  },
) {
  const payload = JSON.stringify({
    text: options?.text || "",
    type,
    mediaUrl,
    fileName: options?.fileName,
    fileSize: options?.fileSize,
  });

  await api.post("/chat/message", {
    chatRoomId: roomId,
    content: payload,
  });
}
