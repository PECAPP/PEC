export async function sendMessage(roomId: string, text: string) {
  if (!auth.currentUser) return;

  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
  const userName = userDoc.exists() ? userDoc.data()?.fullName || "Unknown User" : "Unknown User";

  const messagesRef = collection(db, "chatRooms", roomId, "messages");

  await addDoc(messagesRef, {
    senderId: auth.currentUser.uid,
    senderName: userName,
    text,
    type: "text",
    createdAt: serverTimestamp()
  });
}

// Send message with media
export async function sendMediaMessage(
  roomId: string,
  mediaUrl: string,
  type: "image" | "video" | "file",
  options?: {
    text?: string;
    fileName?: string;
    fileSize?: number;
    thumbnailUrl?: string;
  }
) {
  if (!auth.currentUser) return;

  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
  const userName = userDoc.exists() ? userDoc.data()?.fullName || "Unknown User" : "Unknown User";

  const messagesRef = collection(db, "chatRooms", roomId, "messages");

  await addDoc(messagesRef, {
    senderId: auth.currentUser.uid,
    senderName: userName,
    text: options?.text || "",
    type,
    mediaUrl,
    fileName: options?.fileName,
    fileSize: options?.fileSize,
    thumbnailUrl: options?.thumbnailUrl,
    createdAt: serverTimestamp()
  });
}

// Delete message
export async function deleteMessage(roomId: string, messageId: string, hardDelete = false) {
  const messageRef = doc(db, "chatRooms", roomId, "messages", messageId);
  
  if (hardDelete) {
    await deleteDoc(messageRef);
  } else {
    await updateDoc(messageRef, {
      deletedAt: serverTimestamp()
    });
  }
}

// Star/unstar message
export async function toggleStarMessage(roomId: string, messageId: string, userId: string, starred: boolean) {
  const messageRef = doc(db, "chatRooms", roomId, "messages", messageId);
  
  if (starred) {
    await updateDoc(messageRef, {
      starredBy: arrayUnion(userId)
    });
  } else {
    await updateDoc(messageRef, {
      starredBy: arrayRemove(userId)
    });
  }
}
