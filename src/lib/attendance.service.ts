import { authClient } from "@/lib/auth-client";
import { UserRole } from "@/types";

const API_BASE_URL = "http://localhost:3000";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${authClient.getAccessToken() || ""}`,
});

export const fetchAttendanceRecords = async (userId: string) => {
    // Stub
    return [];
};
