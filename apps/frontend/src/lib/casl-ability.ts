import { AbilityBuilder, createMongoAbility, MongoAbility, Subject } from '@casl/ability';

export type AppAbility = MongoAbility<[string, Subject]>;

export interface CaslPermission {
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
}

export function buildAbilityFor(permissions?: CaslPermission[], role?: string | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (permissions && permissions.length > 0) {
    // Use DB-driven permissions for ALL roles (including college_admin)
    permissions.forEach((perm) => {
      can(perm.action, perm.subject, perm.conditions || undefined);
    });
  } else if (role) {
    // Fallback frontend permissions only when backend provides NO CASL rules
    if (role === 'college_admin') {
      can('manage', 'all');
    } else if (role === 'faculty') {
      can('read', 'User');
      can('read', 'Course');
      can('read', 'Timetable');
      can('manage', 'Course');
    } else if (role === 'student') {
      can('read', 'Course');
      can('read', 'Timetable');
    }
  }

  return build();
}
