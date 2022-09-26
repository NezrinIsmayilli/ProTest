import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { cookies } from 'utils/cookies';

export const setTenant = createAction('setTenant');
export const setTenants = createAction('setTenants');
export const setCallTokenExpired = createAction('setCallTokenExpired');

const saveData = data => {
  cookies.set('_TKN_CALL_', data?.data?.accessToken);
  localStorage.setItem('expiredAt', data?.data?.expiredAt);
};

export function fetchNewCallToken(props = {}) {
  const { onSuccessCallback } = props;
  return apiAction({
    url: '/call-center/integration/new-token',
    onSuccess: data => dispatch => {
      dispatch(saveData(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'fetchNewCallToken',
  });
}

export function fetchTenantInfo(onSuccess = () => {}) {
  return apiAction({
    url: '/tenants/info',
    onSuccess: data => dispatch => {
      dispatch(setTenant(data));
      dispatch(onSuccess(data));
    },
    // onSuccess: data => dispatch => {
    //   if (typeof callback === 'function') {
    //     callback();
    //   }
    //   dispatch(setTenant(data));
    // },
    // onFailure: () => dispath => {
    //   if (typeof callback === 'function') {
    //     callback();
    //   }
    // },
    label: 'tenant',
  });
}

export function editTenantInfo(data) {
  return apiAction({
    url: '/tenants',
    method: 'PUT',
    data,
    onSuccess: fetchTenantInfo,
    showToast: true,
    label: 'editTenantInfo',
  });
}

export function fetchTenants() {
  return apiAction({
    url: '/tenants',
    onSuccess: setTenants,
    // showLoading: true,
    label: 'tenants',
  });
}
