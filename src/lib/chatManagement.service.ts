import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/config/firebase";

// Add member to group
export async function addMemberToGroup(roomId: string, userEmail: string) {
  // Find user by email
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", userEmail.toLowerCase()));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    throw new Error("User not found");
  }
  
  const userDoc = snap.docs[0];
  const userId = userDoc.id;
  const userName = userDoc.data()?.fullName || "User";
  
  // Add to members array
  const roomRef = doc(db, "chatRooms", roomId);
  await updateDoc(roomRef, {
    members: arrayUnion(userId),
    [`participantNames.${userId}`]: userName
  });
  
  return { userId, userName };
}

// Remove member from group
export async function removeMemberFromGroup(roomId: string, userId: string) {
  const roomRef = doc(db, "chatRooms", roomId);
  await updateDoc(roomRef, {
    members: arrayRemove(userId),
    admins: arrayRemove(userId) // Also remove from admins if they were one
  });
}

// Make user admin
export async function makeUserAdmin(roomId: string, userId: string) {
  const roomRef = doc(db, "chatRooms", roomId);
  await updateDoc(roomRef, {
    admins: arrayUnion(userId)
  });
}

// Remove admin privileges
export async function removeUserAdmin(roomId: string, userId: string) {
  const roomRef = doc(db, "chatRooms", roomId);
  await updateDoc(roomRef, {
    admins: arrayRemove(userId)
  });
}

// Update group info
export async function updateGroupInfo(roomId: string, data: { title?: string; description?: string }) {
  const roomRef = doc(db, "chatRooms", roomId);
  await updateDoc(roomRef, data);
}

// Get member details
export async function getMemberDetails(userIds: string[]) {
  if (!userIds || userIds.length === 0) {
    return [];
  }
  
  const members = [];
  
  for (const uid of userIds) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        members.push({
          uid,
          ...userDoc.data()
        });
      }
    } catch (error) {
      console.error(`Error fetching user ${uid}:`, error);
    }
  }
  
  return members;
}

// Get members for semester/department groups by querying users
export async function getMembersForGroup(room: { 
  type: string; 
  semester?: number; 
  department?: string;
  organizationId: string;
  members?: string[];
  participants?: string[];
}) {
  // If it's a DM or has explicit members/participants, use those
  if (room.members) {
    return getMemberDetails(room.members);
  }
  if (room.participants) {
    return getMemberDetails(room.participants);
  }
  
  // For semester/department groups, query users
  const usersRef = collection(db, "users");
  let q;
  
  if (room.type === "semester" && room.semester) {
    q = query(
      usersRef,
      where("organizationId", "==", room.organizationId),
      where("semester", "==", room.semester),
      where("role", "==", "student")
    );
  } else if (room.type === "department" && room.department) {
    q = query(
      usersRef,
      where("organizationId", "==", room.organizationId),
      where("department", "==", room.department)
    );
  } else if (room.type === "general") {
    q = query(
      usersRef,
      where("organizationId", "==", room.organizationId)
    );
  } else {
    return [];
  }
  
  const snap = await getDocs(q);
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      ...data
    };
  });
}
