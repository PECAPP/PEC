export const APP_ROLES = [
  'student',
  'faculty',
  'college_admin',
  'admin',
  'moderator',
  'user',
  'super_admin',
] as const;

export type AppRole = (typeof APP_ROLES)[number];
