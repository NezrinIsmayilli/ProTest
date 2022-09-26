import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setNotification = createAction('setNotification');
export function fetchNotifications({ onSuccessCallback = () => {} } = {}) {
  return apiAction({
    url: `/notification/telegram/chat`,
    onSuccess: data => dispatch => {
      dispatch(setNotification(data));
      onSuccessCallback(data);
    },
    label: 'notifications',
  });
}
export const addNotification = props => {
  const { data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: '/notification/telegram/chat',
    onSuccess: data => dispatch => {
      dispatch(fetchNotifications);
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    method: 'POST',
    data,
    showToast: false,
    showErrorToast: false,
    attribute: 'added',
    label: 'action',
  });
};
export const editNotification = props => {
  const { id, data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: `notification/telegram/chat/${id}`,
    onSuccess: data => dispatch => {
      dispatch(fetchNotifications);
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    method: 'PUT',
    data,
    showToast: true,
    showErrorToast: false,
    attribute: 'edited',
    label: 'action',
  });
};
export function deleteNotifications(id) {
  return apiAction({
    url: `/notification/telegram/chat/${id}`,
    method: 'DELETE',
    onSuccess: fetchNotifications,
    showToast: true,
    label: 'notifications',
  });
}
