import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { ChatRoom } from "@/types/chat";

export async function fetchChatRooms(user: {
  uid: string;
  role: string;
  semester?: number;
  department?: string;
  organizationId: string;
}) {
  if (!user.organizationId) {
    return [];
  }

  const roomsRef = collection(db, "chatRooms");
  const isAdmin = user.role === "admin" || user.role === "super_admin" || user.role === "college_admin";

  // Fetch all rooms in the organization (not DM type)
  const orgQuery = query(
    roomsRef,
    where("organizationId", "==", user.organizationId)
  );
  const orgSnap = await getDocs(orgQuery);
  const orgRooms = orgSnap.docs.map(d => ({ id: d.id, ...d.data() }) as ChatRoom);

  // Fetch DM rooms where this user is a participant
  const dmQuery = query(
    roomsRef,
    where("type", "==", "dm"),
    where("participants", "array-contains", user.uid)
  );
  const dmSnap = await getDocs(dmQuery);
  const dmRooms = dmSnap.docs.map(d => ({ id: d.id, ...d.data() }) as ChatRoom);

  // Deduplicate DMs based on participants configuration
  // This prevents showing multiple chats for same pair of users if they exist
  const uniqueDmRooms = dmRooms.reduce((acc, current) => {
    // specific check: if we already have a room with same participants, skip
    const isDuplicate = acc.find(room => {
      const participants1 = room.participants?.sort().join(',') || '';
      const participants2 = current.participants?.sort().join(',') || '';
      return participants1 === participants2;
    });
    
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, [] as ChatRoom[]);

  // Admin sees everything in their org + their DMs
  if (isAdmin) {
    // Filter out DMs from orgRooms to avoid confusion/duplication
    const nonDMOrgRooms = orgRooms.filter(room => room.type !== "dm");
    return [...nonDMOrgRooms, ...uniqueDmRooms];
  }

  // Students see filtered org rooms + their DMs + groups they are members of
  const filteredRooms = orgRooms.filter(room => {
    if (room.type === "dm") return false; // DMs handled separately
    if (room.type === "general") return true;
    if (room.type === "semester") return room.semester === user.semester;
    if (room.type === "department") return room.department === user.department;
    if (room.type === "group") return room.members?.includes(user.uid);
    return false;
  });

  return [...filteredRooms, ...uniqueDmRooms];
}

// Find user by email
export async function findUserByEmail(email: string) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email.toLowerCase()));
  const snap = await getDocs(q);
  
  if (snap.empty) return null;
  
  const userDoc = snap.docs[0];
  return {
    uid: userDoc.id,
    ...userDoc.data()
  };
}

// Create or find existing DM room between two users
export async function createOrFindDMRoom(currentUserId: string, otherUserId: string, orgId: string) {
  const roomsRef = collection(db, "chatRooms");
  
  // Check if DM room already exists between these two users
  const q = query(
    roomsRef,
    where("type", "==", "dm"),
    where("participants", "array-contains", currentUserId)
  );
  
  const snap = await getDocs(q);
  
  // Check if any existing room has both users
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.participants?.includes(otherUserId)) {
      return { id: docSnap.id, ...data } as ChatRoom;
    }
  }
  
  // Get user names for the room title
  const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
  const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
  
  const currentUserName = currentUserDoc.data()?.fullName || "User";
  const otherUserName = otherUserDoc.data()?.fullName || "User";
  
  // Create new DM room
  const newRoom = await addDoc(roomsRef, {
    type: "dm",
    title: `${currentUserName} & ${otherUserName}`,
    organizationId: orgId,
    participants: [currentUserId, otherUserId],
    participantNames: {
      [currentUserId]: currentUserName,
      [otherUserId]: otherUserName
    },
    createdAt: serverTimestamp()
  });
  
  return {
    id: newRoom.id,
    type: "dm",
    title: `${currentUserName} & ${otherUserName}`,
    organizationId: orgId,
    participants: [currentUserId, otherUserId],
    participantNames: {
      [currentUserId]: currentUserName,
      [otherUserId]: otherUserName
    }
  } as ChatRoom;
}

// Create custom group room
export async function createGroupRoom(options: {
  title: string;
  description?: string;
  organizationId: string;
  creatorId: string;
  members: string[];
  admins: string[];
}) {
  const roomsRef = collection(db, "chatRooms");
  
  const newRoom = await addDoc(roomsRef, {
    type: "group",
    title: options.title,
    description: options.description || "",
    organizationId: options.organizationId,
    members: options.members,
    admins: options.admins,
    createdBy: options.creatorId,
    createdAt: serverTimestamp()
  });
  
  return {
    id: newRoom.id,
    ...options,
    type: "group",
    createdAt: new Date()
  } as any as ChatRoom;
}

// Update group members/admins
export async function updateGroupRoom(roomId: string, updates: Partial<ChatRoom>) {
  const roomRef = doc(db, "chatRooms", roomId);
  await updateDoc(roomRef, updates);
}

// Delete group room
export async function deleteGroupRoom(roomId: string) {
  const roomRef = doc(db, "chatRooms", roomId);
  await deleteDoc(roomRef);
}