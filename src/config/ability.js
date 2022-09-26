/**
 * Roles & permissions define and update methods
 * more info at: https://github.com/stalniy/casl
 */
import { AbilityBuilder, Ability } from '@casl/ability';
import { accessTypes } from 'config/permissions';

// intial abilities
export const abilities = new Ability([]);

const { read, manage } = accessTypes;

export function updateAbilities({ permissions = [] }, callback = () => { }) {
  const { rules, can, cannot } = AbilityBuilder.extract();

  // Object.keys(groups).forEach(key => {
  //   if (key !== 'msk' && key !== 'contact') {
  //     const permission = groups[key];

  //     if (permission) {
  //       can('read', key);
  //     } else {
  //       cannot('read', key);
  //     }
  //   }
  // });

  permissions.forEach(({ key, permission }) => {
    switch (permission) {
      case null:
        cannot(read, key);
        break;
      case 0:
        cannot(read, key);
        break;
      case 1:
        can(read, key);
        break;
      case 2:
        can(manage, key);
        break;

      default:
        cannot(read, key);
        break;
    }
  });

  abilities.update(rules);

  callback();
}

export function resetAbilities() {
  return abilities.update([]);
}
