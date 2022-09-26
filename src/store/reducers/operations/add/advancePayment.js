import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setAdvancePaymentByContactId } from 'store/actions/contact';

export const advancePaymentReducer = createReducer(
  {
    advancePayment: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'advancePaymentByContactId') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'advancePaymentByContactId') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setAdvancePaymentByContactId]: (state, action) => ({
      ...state,
      advancePayment: action.payload.data,
    }),
  }
);
