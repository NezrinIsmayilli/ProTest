import { createReducer } from 'redux-starter-kit';
import { setStockTypes } from 'store/actions/settings/anbar';
import { apiStart, apiEnd } from 'store/actions/api';

export const anbarReducer = createReducer(
  {
    data: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'stockTypes') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'stockTypes') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setStockTypes]: (state, action) => ({
      ...state,
      data: action.payload.data,
    }),
  }
);
