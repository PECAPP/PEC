import { Hash, Users, Building2, ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatRoom } from "@/types/chat";
import { UserRole } from "@/types";

interface Props {
  rooms: ChatRoom[];
  selectedRoom: string;
  onRoomChange: (id: string) => void;
  loading?: boolean;
  userRole: UserRole;
}

export function ChatRoomSelector({
  rooms,
  selectedRoom,
  onRoomChange,
  loading,
  userRole,
}: Props) {
  const isStudent = userRole === "student";

  const generalRooms = rooms.filter((r) => r.type === "general");
  const semesterRooms = rooms.filter((r) => r.type === "semester");
  const departmentRooms = rooms.filter((r) => r.type === "department");
  const groupRooms = rooms.filter((r: any) => r.type === "group");

  // Logic to find selected data or fallback to the general room data
  const selectedRoomData = 
    rooms.find((r) => r.id === selectedRoom) || 
    rooms.find((r) => r.id === "general");

  return (
    <Select 
      // Ensure value is "general" if selectedRoom is empty
      value={selectedRoom || "general"} 
      onValueChange={onRoomChange}
    >
      <SelectTrigger className="w-[260px] bg-secondary border-border">
        <div className="flex items-center gap-2">
          {!isStudent ? (
            <ShieldCheck className="w-4 h-4 text-primary" />
          ) : (
            <Hash className="w-4 h-4 text-muted-foreground" />
          )}
          <SelectValue placeholder={loading ? "Loading…" : "General Chat"}>
            {selectedRoomData?.title}
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="bg-card border-border z-50 max-h-[400px]">
        {/* SECTION 1: GENERAL */}
        {generalRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider px-2 py-1.5">
              Community
            </SelectLabel>
            {generalRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>{room.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {/* SECTION 2: DEPARTMENTS */}
        {departmentRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider px-2 py-1.5 mt-2">
              {isStudent ? "Your Department" : "All Departments"}
            </SelectLabel>
            {departmentRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[190px]">
                    {room.department || room.title}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {/* SECTION 3: SEMESTERS */}
        {semesterRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider px-2 py-1.5 mt-2">
              {isStudent ? "Your Semester" : "All Semesters"}
            </SelectLabel>
            {semesterRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" />
                  <span>{room.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {/* SECTION 4: GROUPS */}
        {groupRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider px-2 py-1.5 mt-2">
              Groups
            </SelectLabel>
            {groupRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate max-w-[190px]">{room.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
