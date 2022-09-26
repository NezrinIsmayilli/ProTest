import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const onNewNotification = createAction('onNewNotification');
export const resetNotifications = createAction('resetNotifications');

export const onReadNotificationById = createAction('onReadNotificationById');
export const setNotifications = createAction('setNotifications');

export function fetchNotifications() {
  return apiAction({
    url: '/notifications?filter[isRead]=false',
    onSuccess: setNotifications,
    label: 'fetchingNotifications',
    showErrorToast: false,
  });
}

export function readNotificationById(id) {
  return apiAction({
    url: `/notifications/${id}`,
    method: 'PUT',
    data: { isRead: true },
    onSuccess: () => dispatch => dispatch(onReadNotificationById(id)),
    label: 'readNotificationById',
    showErrorToast: false,
  });
}
