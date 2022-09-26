import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setAccountBalance } from 'store/actions/finance/operations';

export const cashBoxBalanceReducer = createReducer(
  {
    cashBoxBalance: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'accountBalance') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'accountBalance') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setAccountBalance]: (state, action) => ({
      ...state,
      cashBoxBalance: action.payload.data,
    }),
  }
);