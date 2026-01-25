import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  getDoc,
  doc,
  limit,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "@/config/firebase";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type?: "text" | "image" | "video" | "file";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  createdAt: any;
  deletedAt?: any;
  starredBy?: string[];
  parentId?: string; // For threaded replies
  replyTo?: {
    text: string;
    senderName: string;
  };
  mentions?: string[]; // IDs of mentioned users
}

export function subscribeToMessages(
  roomId: string,
  callback: (messages: ChatMessage[]) => void,
) {
  const messagesRef = collection(db, "chatRooms", roomId, "messages");

  const q = query(messagesRef, orderBy("createdAt", "desc"), limit(50));

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ChatMessage[];

    callback(msgs.reverse());
  });
}

export async function sendMessage(
  roomId: string,
  text: string,
  metadata?: {
    parentId?: string;
    replyTo?: { text: string; senderName: string };
    mentions?: string[];
  },
) {
  if (!auth.currentUser) return;

  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
  const userName = userDoc.exists()
    ? userDoc.data()?.fullName || "Unknown User"
    : "Unknown User";

  const messagesRef = collection(db, "chatRooms", roomId, "messages");

  // Filter out undefined values from metadata
  const cleanMetadata: Record<string, any> = {};
  if (metadata) {
    if (metadata.parentId !== undefined)
      cleanMetadata.parentId = metadata.parentId;
    if (metadata.replyTo !== undefined)
      cleanMetadata.replyTo = metadata.replyTo;
    if (metadata.mentions !== undefined && metadata.mentions.length > 0) {
      cleanMetadata.mentions = metadata.mentions;
    }
  }

  await addDoc(messagesRef, {
    senderId: auth.currentUser.uid,
    senderName: userName,
    text,
    type: "text",
    createdAt: serverTimestamp(),
    ...cleanMetadata,
  });
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
  if (!auth.currentUser) return;

  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
  const userName = userDoc.exists()
    ? userDoc.data()?.fullName || "Unknown User"
    : "Unknown User";

  const messagesRef = collection(db, "chatRooms", roomId, "messages");

  // Build message object with only defined fields
  const messageData: any = {
    senderId: auth.currentUser.uid,
    senderName: userName,
    text: options?.text || "",
    type,
    mediaUrl,
    createdAt: serverTimestamp(),
  };

  // Only add optional fields if they are defined
  if (options?.fileName) messageData.fileName = options.fileName;
  if (options?.fileSize) messageData.fileSize = options.fileSize;
  if (options?.thumbnailUrl) messageData.thumbnailUrl = options.thumbnailUrl;

  await addDoc(messagesRef, messageData);
}

export async function deleteMessage(
  roomId: string,
  messageId: string,
  hardDelete = false,
) {
  const messageRef = doc(db, "chatRooms", roomId, "messages", messageId);

  if (hardDelete) {
    await deleteDoc(messageRef);
  } else {
    await updateDoc(messageRef, {
      deletedAt: serverTimestamp(),
    });
  }
}

export async function toggleStarMessage(
  roomId: string,
  messageId: string,
  userId: string,
  starred: boolean,
) {
  const messageRef = doc(db, "chatRooms", roomId, "messages", messageId);

  if (starred) {
    await updateDoc(messageRef, {
      starredBy: arrayUnion(userId),
    });
  } else {
    await updateDoc(messageRef, {
      starredBy: arrayRemove(userId),
    });
  }
}
