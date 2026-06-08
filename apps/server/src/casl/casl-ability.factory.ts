import { Injectable } from '@nestjs/common';
import { PureAbility, AbilityBuilder, AbilityTuple, MatchConditions, ExtractSubjectType } from '@casl/ability';
import { PrismaQuery, createPrismaAbility } from '@casl/prisma';

export type AppAbility = PureAbility<AbilityTuple, PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: any) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (user?.role === 'super_admin') {
      can('manage', 'all'); // read-write access to everything
    } else {
      // Loop over the permissions fetched from Redis or DB
      const permissions = user?.permissions || [];
      
      permissions.forEach((perm: any) => {
        // Parse conditions and replace dynamic variables
        let conditions = perm.conditions ? { ...perm.conditions } : undefined;
        
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
      // Read https://casl.js.org/v6/en/package/casl-prisma
      conditionsMatcher: () => () => true, // We will use prisma queries later, or standard object matching.
    });
  }
}
