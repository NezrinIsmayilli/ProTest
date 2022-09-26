import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setOrderRoles = createAction('settings/order-roles');
export const setOrderRegulations = createAction('settings/order-regulations');

export function fetchTenantPersonRoles(props = {}) {
  const { onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: '/orders/tenant-person-roles',
    onSuccess: data => dispatch => {
      dispatch(setOrderRoles(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onSuccessCallback(error));
    },
    label: 'fetchTenantPersonRoles',
  });
}

/*
{
	"tenantPerson_ul": ["4"],
	"role": 1
}
*/
export const createTenantPersonRole = (props = {}) => {
  const { data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: '/orders/tenant-person-roles',
    method: 'POST',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    data,
    label: 'createTenantPersonRole',
  });
};

export const deleteTenantPersonRole = (props = {}) => {
  const {
    id,
    label = 'deleteTenantPersonRole',
    onSuccessCallback,
    onFailureCallback,
  } = props;

  return apiAction({
    url: `/orders/tenant-person-roles/${id}`,
    method: 'DELETE',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    showToast: true,
    label,
  });
};

export function fetchStageRoleExecutors(props = {}) {
  const { onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: '/orders/stage-role-executors',
    onSuccess: data => dispatch => {
      dispatch(setOrderRegulations(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onSuccessCallback(error));
    },
    label: 'fetchStageRoleExecutors',
  });
}

export const updateStageRoleExecutors = (props = {}) => {
  const { data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: '/orders/stage-role-executors',
    method: 'PUT',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    data,
    label: 'updateStageRoleExecutors',
  });
};
