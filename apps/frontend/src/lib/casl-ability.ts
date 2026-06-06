import { AbilityBuilder, createMongoAbility, MongoAbility, Subject } from '@casl/ability';

export type AppAbility = MongoAbility<[string, Subject]>;

export function buildAbilityFor(permissions: any[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  permissions.forEach((perm) => {
    can(perm.action, perm.subject, perm.conditions || undefined);
  });

  return build();
}
