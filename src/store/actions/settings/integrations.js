import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const ftcFbChannelInfo = createAction('fetchFbChannelInfo');
export const ftcFbPagesList = createAction('fetchFbPagesList');

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;

export function createFBIntegration(props = {}) {
  const {
    accessToken,
    dataAccessExpirationTime,
    grantedScopes,
    userId,
    onSuccessCallback,
  } = props;

  return apiAction({
    url: `${url}/omni/channels/facebook`,
    method: 'POST',
    data: {
      accessToken,
      dataAccessExpirationTime,
      grantedScopes,
      userId,
    },
    onSuccess: () => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback());
    },
    showToast: true,
    showErrorToast: false,
    label: 'action',
  });
}

export function fetchFbChannelInfo(props = {}) {
  const { onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/omni/channels/facebook`,
    onSuccess: data => dispatch => {
      dispatch(ftcFbChannelInfo(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'action',
  });
}

export function fetchFbPagesList(props = {}) {
  const { onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/omni/channels/facebook/pages`,
    onSuccess: data => dispatch => {
      dispatch(ftcFbPagesList(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'action',
  });
}

export function changeFbPage(props = {}) {
  const { pageId, onFailureCallback, onSuccessCallback } = props;

  return apiAction({
    url: `${url}/omni/channels/facebook/activate`,
    onSuccess: () => dispatch => {
      fetchFbChannelInfo();
      fetchFbPagesList();

      if (onSuccessCallback) dispatch(onSuccessCallback());
    },
    method: 'PUT',
    data: { pageId },
    showToast: true,
    showErrorToast: false,
    label: 'fbPageChange',
  });
}

export function deactiveFbPage(props = {}) {
  const { onSuccessCallback } = props;
  return apiAction({
    url: `${url}/omni/channels/facebook/deactivate`,
    onSuccess: () => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback());
    },
    method: 'PUT',
    showToast: true,
    showErrorToast: false,
    label: 'fbPageDeactive',
  });
}
