import { AbilityBuilder, createMongoAbility, MongoAbility, Subject } from '@casl/ability';

export type AppAbility = MongoAbility<[string, Subject]>;

export interface CaslPermission {
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
}

export function buildAbilityFor(permissions?: CaslPermission[], role?: string | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // ALWAYS grant full access to admins, regardless of what the backend DB says
  // This prevents issues where the backend has stale or incorrect CASL rules.
  if (role === 'college_admin') {
    can('manage', 'all');
  } else if (permissions && permissions.length > 0) {
    permissions.forEach((perm) => {
      can(perm.action, perm.subject, perm.conditions || undefined);
    });
  } else if (role) {
    // Fallback frontend permissions for other roles if backend doesn't provide CASL rules
    if (role === 'faculty') {
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
