import { createReducer } from 'redux-starter-kit';
import { setOfflineReason } from 'store/actions/settings/offlineReason';
import { apiStart, apiEnd } from 'store/actions/api';

export const offlineReasonReducer = createReducer(
  {
    offlineReason: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'offlineReason') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'offlineReason') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setOfflineReason]: (state, action) => ({
      ...state,
      offlineReason: action.payload.data,
    }),
  }
);
