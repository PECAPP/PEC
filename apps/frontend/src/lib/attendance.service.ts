import {  authClient  } from "@pec/api";

const _API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const _getHeaders = () => ({
  "Content-Type": "application/json",
});

export const fetchAttendanceRecords = async (_userId: string) => {
    // Stub
    return [];
};
