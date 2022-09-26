import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setProfileInfo = createAction('setProfileInfo');
export const setMe = createAction('setMe');
export const setCredentials = createAction('setCredentials');
const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchProfileInfo(props = {}) {
  const { onSuccessCallback } = props;
  return apiAction({
    url: '/profiles',
    onSuccess: data => dispatch => {
      dispatch(setProfileInfo(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'fetchProfile',
  });
}

export function editProfileInfo(data) {
  return apiAction({
    url: '/profiles',
    method: 'PUT',
    data,
    onSuccess: fetchProfileInfo,
    showToast: true,
    label: 'editProfileInfo',
  });
}

export function changePassword(props = {}) {
  const { data, onSuccessCallback } = props;
  return apiAction({
    url: '/passwords',
    method: 'PUT',
    data,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    showToast: true,
    label: 'changePassword',
  });
}
export function fetchMe(props = {}) {
  const { onSuccessCallback } = props;
  return apiAction({
    url: `${url}/operators/getMe`,
    onSuccess: data => dispatch => {
      dispatch(setMe(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'fetchMe',
  });
}
export function fetchCredentials(props = {}) {
  const { id, onFailureCallback } = props;
  return apiAction({
    url: `${url}/operators/${id}/credentials`,
    onSuccess: setCredentials,
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchCredentials',
  });
}
