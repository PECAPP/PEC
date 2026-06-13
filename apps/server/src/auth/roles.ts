export const APP_ROLES = [
  'student',
  'faculty',
  'college_admin',
] as const;

export type AppRole = (typeof APP_ROLES)[number];
