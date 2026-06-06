import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  // Professional error handling for production
  handleServerError(e) {
    console.error("[Action Error]:", e.message);
    if (e instanceof Error) {
      return e.message;
    }
    return "An unexpected server error occurred.";
  },
});
