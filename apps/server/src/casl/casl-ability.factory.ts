import { Injectable } from '@nestjs/common';
import { PureAbility, AbilityBuilder, AbilityTuple } from '@casl/ability';
import { PrismaQuery, createPrismaAbility } from '@casl/prisma';

export type AppAbility = PureAbility<AbilityTuple, PrismaQuery>;

/**
 * ABAC ability factory — fully DB-driven for ALL roles including college_admin.
 *
 * college_admin is seeded with `manage:all` by default, giving it full access,
 * but that permission can be edited via the admin UI just like any other role.
 * There is NO hardcoded bypass here — permissions come entirely from the database.
 */
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: any): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (user && user.permissions) {
      user.permissions.forEach((perm: any) => {
        let conditions = perm.conditions;

        if (conditions && typeof conditions === 'object') {
          // Replace placeholders like "{{id}}" with actual user properties
          try {
            const conditionsString = JSON.stringify(conditions).replace(
              /\{\{id\}\}/g,
              user.uid || user.id,
            );
            conditions = JSON.parse(conditionsString);
          } catch (e) {
            console.error('Failed to parse CASL conditions', e);
            conditions = {};
          }
        }

        can(perm.action, perm.subject, conditions);
      });
    }

    return build({
      // Use proper object condition matching so conditions like { studentId: 'abc' }
      // are enforced when checking ability.can() against plain objects.
      // Prisma-level filtering is handled separately in service queries.
      conditionsMatcher: (conditions) => (object) => {
        if (!object || !conditions) return true;
        return Object.entries(conditions as Record<string, unknown>).every(
          ([key, val]) => (object as Record<string, unknown>)[key] === val,
        );
      },
    });
  }
}
