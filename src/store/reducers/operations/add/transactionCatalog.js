import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setTransactionCatalog } from 'store/actions/finance/operations';

export const transactionCatalog = createReducer(
  {
    catalog: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'transactionCatalogs') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'transactionCatalogs') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setTransactionCatalog]: (state, action) => ({
      ...state,
      catalog: action.payload.data,
    }),
  }
);