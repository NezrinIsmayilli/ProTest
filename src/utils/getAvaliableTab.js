import { abilities } from 'config/ability';
import { accessTypes } from 'config/permissions';

export const getAvaliableTab = (operationNamesObj, permissionsHelperObj) => {
  const tab = Object.values(operationNamesObj).forEach(key => {
    if (abilities.can(accessTypes.read, permissionsHelperObj[key])) {
      return key;
    }
  });

  return tab;
};
