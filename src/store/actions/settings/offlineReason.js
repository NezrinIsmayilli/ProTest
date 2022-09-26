import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setOfflineReason = createAction('setOfflineReason');
const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchOfflineReason() {
  return apiAction({
    url: `${url}/offline-reasons`,
    onSuccess: setOfflineReason,
    label: 'offlineReason',
  });
}

export function createOfflineReason(index, name, onFailureCallback) {
  return apiAction({
    url: `${url}/offline-reasons`,
    method: 'POST',
    data: { name },
    onSuccess: fetchOfflineReason,
    onFailure: error => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    showErrorToast: false,
    showToast: true,
    label: 'offlineReason',
  });
}

export function editOfflineReason(id, name, onFailureCallback) {
  return apiAction({
    url: `${url}/offline-reasons/${id}`,
    method: 'PUT',
    data: { name },
    onSuccess: fetchOfflineReason,
    onFailure: error => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    showErrorToast: false,
    showToast: true,
    label: 'offlineReason',
  });
}

export function deleteOfflineReason(id) {
  return apiAction({
    url: `${url}/offline-reasons/${id}`,
    method: 'DELETE',
    onSuccess: fetchOfflineReason,
    showToast: true,
    label: 'offlineReason',
  });
}
