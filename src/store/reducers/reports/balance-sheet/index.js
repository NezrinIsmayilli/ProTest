import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';

import {
  set_balance_sheet,
  set_balance,
  clearBalance,
} from 'store/actions/reports/balance-sheet';

const initialState = {
  balanceSheet: [],
  balance: [],
  isLoading: false,
  actionIsLoading: false,
};

export const balanceSheetReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'balance-sheet') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'balance-sheet-action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'balance-sheet') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'balance-sheet-action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [set_balance_sheet]: (state, action) => ({
    ...state,
    balanceSheet: action.payload.data,
  }),
  [set_balance]: (state, action) => ({
    ...state,
    balance: action.payload.data,
  }),
  [clearBalance]: () => {
    return {
      balance: [],
    };
  },
});
