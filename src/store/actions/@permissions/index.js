import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { updateAbilities } from 'config/ability';

export const setPermissions = createAction('setPermissions');

export function fetchPermissions(callback = () => {}) {
  return apiAction({
    url: '/authorization/roles/permissions',
    onSuccess: ({ data }) => dispatch => {
      updateAbilities(
        { permissions: data.permissions, groups: data.groups },
        callback
      );

      return dispatch(setPermissions({ data }));
    },
    onFailure: () => () => callback(),
    label: 'fetchPermissions',
  });
}
