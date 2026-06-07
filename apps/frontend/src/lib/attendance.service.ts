import {  authClient  } from "@pec/api";
import { UserRole } from '@pec/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${authClient.getAccessToken() || ""}`,
});

export const fetchAttendanceRecords = async (userId: string) => {
    // Stub
    return [];
};
