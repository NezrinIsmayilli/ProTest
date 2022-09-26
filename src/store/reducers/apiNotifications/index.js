import { createReducer } from 'redux-starter-kit';
import {
  onNewNotification,
  resetNotifications,
  onReadNotificationById,
  setNotifications,
} from 'store/actions/apiNotifications';

const initialState = {
  notifications: [],
};

export const apiNotificationsReducer = createReducer(initialState, {
  [setNotifications]: (state, action) => ({
    notifications: action.payload.data,
  }),

  [onNewNotification]: (state, action) => ({
    notifications: [action.payload.data, ...state.notifications],
  }),

  [onReadNotificationById]: (state, action) => ({
    notifications: state.notifications.filter(
      item => item.id !== action.payload
    ),
  }),

  [resetNotifications]: () => initialState,
});
