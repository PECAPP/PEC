import { createElement } from 'react';
import { Can as CaslCan, AbilityProvider } from '@casl/react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createMongoAbility } from '@casl/ability';

const emptyAbility = createMongoAbility();

export const Can = (props: any) => {
  const { ability } = useAuth();
  return createElement(AbilityProvider, {
    value: ability || emptyAbility,
    children: createElement(CaslCan, props),
  });
};
