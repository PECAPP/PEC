export const APP_ROLES = [
  'student',
  'faculty',
  'admin',
] as const;

export type AppRole = (typeof APP_ROLES)[number];
