import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setExpenseItemsByCatalogId } from 'store/actions/expenseItem';

export const expenseItemsByCatalogId = createReducer(
  {
    expenseItems: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'expenseItemsByCatalogId') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'expenseItemsByCatalogId') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setExpenseItemsByCatalogId]: (state, action) => ({
      ...state,
      expenseItems: action.payload.data,
    }),
  }
);