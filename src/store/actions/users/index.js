import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver, apiErrorMessageResolver } from 'utils';
import { toast } from 'react-toastify';

export const setUsers = createAction('setUsers');
export const filterUsers = createAction('filterUsers');

export function fetchUsers(props = {}) {
  const { filters = {}, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/employees?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setUsers(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    attribute: filters,
    label: 'fetchUsers',
  });
}

export function createUser(data, callback, inviteSend) {
  return apiAction({
    url: '/employees',
    onSuccess: user => dispatch => {
      const id = user?.data?.id;

      const { email, role } = data;

      if (id && inviteSend) {
        dispatch(inviteUser({ tenantPerson: id, email, role }, callback));
        return;
      }

      dispatch(callback());
    },
    method: 'POST',
    data,
    showToast: !inviteSend,
    label: 'userActionLoading',
  });
}

export function editUser(id, data, callback) {
  return apiAction({
    url: `/employees/${id}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    showToast: true,
    label: 'userActionLoading',
  });
}

export function deleteUserById(id, callback, onFailureCallback) {
  return apiAction({
    url: `/employees/delete/${id}`,
    method: 'DELETE',
    onSuccess: callback,
    onFailure: onFailureCallback,
    showErrorToast: false,
    label: 'fetchUsers',
  });
}

export function inviteUser(data, callback) {
  return apiAction({
    url: '/invite',
    onSuccess: callback,
    showErrorToast: false,
    onFailure: error => () => {
      const message = apiErrorMessageResolver(error);

      toast.error(message);
    },
    method: 'POST',
    data,
    label: 'fetchUsers',
  });
}
