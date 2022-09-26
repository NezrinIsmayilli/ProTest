import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setIvr = createAction('setIvr');
export const setCallIvr = createAction('setCallIvr');
export const setSelectedIvr = createAction('setSelectedIvr');
const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchIvr(props = {}) {
  const { onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/ivrs`,
    onSuccess: data => dispatch => {
      dispatch(setIvr(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchIvr',
  });
}
export function fetchCallIvr(props = {}) {
  const { onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/calls/ivrs`,
    onSuccess: data => dispatch => {
      dispatch(setCallIvr(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchCallIvr',
  });
}
export function fetchSelectedIvr(props = {}) {
  const { id, onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/ivrs/${id}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchSelectedIvr',
  });
}

export function editIvr(id, data, onSuccess = () => { }, onFailure = () => { }) {
  return apiAction({
    url: `${url}/ivrs/${id}`,
    onSuccess: params => dispatch => {
      dispatch(onSuccess(data));
    },
    onFailure,
    method: 'PUT',
    data,
    showToast: false,
    showErrorToast: false,
    attribute: 'edited',
    label: 'action',
  });
}
export function createIvr(data, onSuccess = () => { }, onFailure = () => { }) {
  return apiAction({
    url: `${url}/ivrs`,
    onSuccess,
    onFailure,
    method: 'POST',
    data,
    showToast: false,
    showErrorToast: false,
    attribute: 'added',
    label: 'action',
  });
}
export function toggleIvr(id, onSuccess = () => { }, onFailure = () => { }) {
  return apiAction({
    url: `${url}/ivrs/${id}/toggle`,
    onSuccess,
    onFailure,
    method: 'PUT',
    showToast: false,
    showErrorToast: false,
    attribute: 'added',
    label: 'toggleIvr',
  });
}
export function deleteIvr(id, onSuccess = () => { }) {
  return apiAction({
    url: `${url}/ivrs/${id}`,
    method: 'DELETE',
    onSuccess,
    showToast: true,
    label: 'ivr',
  });
}

export function fetchSelectedAttachment(props = {}) {
  const { id, onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/attachments/${id}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchSelectedAttachment',
  });
}
