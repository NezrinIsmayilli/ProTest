import { createReducer } from 'redux-starter-kit';
import { setCreditTypes } from 'store/actions/settings/credit';
import { apiStart, apiEnd } from 'store/actions/api';

export const creditReducer = createReducer(
  {
    creditTypes: [],
    isLoading: false,
    actionLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'creditTypes') {
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
      if (action.payload === 'creditTypes') {
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
    [setCreditTypes]: (state, action) => ({
      ...state,
      creditTypes: action.payload.data,
    }),
  }
);
