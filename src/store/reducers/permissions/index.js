import { createReducer } from 'redux-starter-kit';
import { setPermissions } from 'store/actions/@permissions';
import { apiStart, apiEnd } from 'store/actions/api';
import { permissionsList } from 'config/permissions';

const initialState = {
  permissions: [],
  permissionsByKeyValue: {},
  groups: undefined,
  isLoading: false,
};

export const permissionsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'fetchPermissions') {
      return {
        ...state,
        isLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'fetchPermissions') {
      return {
        ...state,
        isLoading: false,
      };
    }
  },

  [setPermissions]: (state, action) => {
    const groupedPermissions = action.payload.data.permissions.map(
      permission => ({
        ...permission,
        ...permissionsList[permission.key],
      })
    );
    const permissions = {};

    groupedPermissions.forEach(
      permission => (permissions[permission.key] = permission)
    );

    return {
      permissions: groupedPermissions,
      permissionsByKeyValue: permissions,
      groups: action.payload.data.groups,
    };
  },
});
