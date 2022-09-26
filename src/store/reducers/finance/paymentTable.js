import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setCreditPayments,
  setCreditCounts,
} from 'store/actions/finance/paymentTable';

const initialState = {
  creditPayments: [],
  creditCount: 0,
  isLoading: false,
  actionLoading: false,
  added: false,
  edited: false,
};

export const paymentTableReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'paymentTable') {
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
    if (action.payload === 'paymentTable') {
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

  [setCreditPayments]: (state, action) => ({
    ...state,
    creditPayments: action.payload.data,
  }),
  [setCreditCounts]: (state, action) => ({
    ...state,
    creditCount: action.payload.data,
  }),
});
