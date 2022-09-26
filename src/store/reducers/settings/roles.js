import { createReducer } from 'redux-starter-kit';
import { permissionsList } from 'config/permissions';
import {
  setFeatures,
  setRoles,
  resetRolesFeaturesData,
} from 'store/actions/settings/roles';

const initialState = {
  roles: [],
  features: [],
};

export const rolesReducer = createReducer(initialState, {
  [setRoles]: (state, action) => ({
    ...state,
    roles: action.payload.data,
  }),

  [setFeatures]: (state, action) => {
    const groupedPermissions = action.payload.data.map(permission => ({
      ...permission,
      ...permissionsList[permission.key],
    }));
    return {
      ...state,
      features: groupedPermissions,
    };
  },

  [resetRolesFeaturesData]: () => initialState,
});
