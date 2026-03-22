import { ChatRoom } from "@/types/chat";

// ... existing functions ...

// Initialize default organization rooms
export async function initializeDefaultRooms(organizationId: string) {
  const roomsRef = collection(({} as any), "chatRooms");
  
  // 1. General Chat
  const generalQuery = query(
    roomsRef,
    where("organizationId", "==", organizationId),
    where("type", "==", "general")
  );
  const generalSnap = await getDocs(generalQuery);
  
  if (generalSnap.empty) {
    await addDoc(roomsRef, {
      type: "general",
      title: "General Chat",
      organizationId,
      createdAt: serverTimestamp(),
      description: "General discussion for everyone"
    });
  }

  // 2. Semester Chats (1-8)
  for (let i = 1; i <= 8; i++) {
    const semQuery = query(
      roomsRef,
      where("organizationId", "==", organizationId),
      where("type", "==", "semester"),
      where("semester", "==", i)
    );
    const semSnap = await getDocs(semQuery);
    
    if (semSnap.empty) {
      await addDoc(roomsRef, {
        type: "semester",
        title: `Semester ${i} Chat`,
        semester: i,
        organizationId,
        createdAt: serverTimestamp(),
        description: `Official chat for Semester ${i} students`
      });
    }
  }

  // 3. Department Chats
  const departments = [
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering"
  ];

  for (const dept of departments) {
    const deptQuery = query(
      roomsRef,
      where("organizationId", "==", organizationId),
      where("type", "==", "department"),
      where("department", "==", dept)
    );
    const deptSnap = await getDocs(deptQuery);
    
    if (deptSnap.empty) {
      await addDoc(roomsRef, {
        type: "department",
        title: `${dept} Chat`,
        department: dept,
        organizationId,
        createdAt: serverTimestamp(),
        description: `Official chat for ${dept} department`
      });
    }
  }
}
