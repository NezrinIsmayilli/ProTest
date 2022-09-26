import { createReducer } from 'redux-starter-kit';
import { setNotification } from 'store/actions/settings/notification';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
  notification: [],
  isLoading: false,
};

export const notificationsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'notifications') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },
  [apiEnd]: (state, action) => {
    if (action.payload === 'notifications') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },
  [setNotification]: (state, action) => ({
    ...initialState,
    notification: action.payload.data,
  }),
});
