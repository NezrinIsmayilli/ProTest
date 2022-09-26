import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setAllReceivables, setAllTransactionList } from 'store/actions/export-to-excel/financeModule';

const initialState = {
  exTransactionIsLoading: false,
  exTransaction: [],
  exReceivablesIsLoading: false,
  exReceivables: [],
};

export const allTransactionListReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'all-transactions') {
      return {
        ...state,
        exTransactionIsLoading: true,
      };
    }
    if (action.payload === 'all-recievables') {
      return {
        ...state,
        exReceivablesIsLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'all-transactions') {
      return {
        ...state,
        exTransactionIsLoading: false,
      };
    }
    if (action.payload === 'all-recievables') {
      return {
        ...state,
        exReceivablesIsLoading: false,
      };
    }
  },

  [setAllTransactionList]: (state, action) => ({
    ...state,
    exTransaction: action.payload.data,
  }),
  [setAllReceivables]: (state, action) => ({
    ...state,
    exTransaction: action.payload.data,
  }),
});
