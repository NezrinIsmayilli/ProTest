import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setApplyTypes = createAction('setApplyTypes');
export const setRootEditMode = createAction('setRootEditMode');
export const setCallApplyTypes = createAction('setCallApplyTypes');

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchApplyTypes(props = {}) {
  const { onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/appeal-types`,
    onSuccess: data => dispatch => {
      dispatch(setApplyTypes(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'applyTypes',
  });
}

export function createApplyType(
  data,
  onSuccess = () => {},
  onFailure = () => {}
) {
  return apiAction({
    url: `${url}/appeal-types`,
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

export function editApplyType(
  id,
  data,
  onSuccess = () => {},
  onFailure = () => {}
) {
  return apiAction({
    url: `${url}/appeal-types/${id}`,
    onSuccess: params => dispatch => {
      dispatch(fetchApplyTypes(params));
      dispatch(onSuccess(data));
    },
    onFailure,
    method: 'PUT',
    data,
    showToast: true,
    attribute: 'edited',
    label: 'action',
  });
}

export function deleteApplyType(
  id,
  onSuccess = () => {},
  onFailure = () => {}
) {
  return apiAction({
    url: `${url}/appeal-types/${id}`,
    method: 'DELETE',
    onFailure,
    onSuccess,
    showErrorToast: false,
    showToast: true,
    label: 'applyTypes',
  });
}
export function fetchCallApplyTypes(props = {}) {
  const { onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/calls/appeal-types`,
    onSuccess: data => dispatch => {
      dispatch(setCallApplyTypes(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'callApplyTypes',
  });
}
