import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setExpenseItem,
  setExpenseItems,
  setExpenseEditMode,
  setExpenseCatalogId,
  setExpenseCatalogsWithItems,
} from 'store/actions/expenseItem';

const initialState = {
  isLoading: false,
  actionLoading: false,
  expenseItem: undefined,
  selectedExpenseItemId: undefined,
  expenseCatalogId: null,
  expenseItems: [],
  expenseCatalogs: {},
  editMode: false,
};

export const expenseItems = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'ExpenseItems') {
      return {
        ...state,
        isLoading: true,
      };
    }

    if (action.payload === 'ExpenseItemsActions') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'ExpenseItems') {
      return {
        ...state,
        isLoading: false,
      };
    }

    if (action.payload === 'ExpenseItemsActions') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setExpenseEditMode]: (state, action) => ({
    ...state,
    editMode: action.payload,
  }),

  [setExpenseCatalogId]: (state, action) => ({
    ...state,
    expenseCatalogId: action.payload,
    expenseItems: [],
  }),
  [setExpenseCatalogsWithItems]: (state, action) => ({
    ...state,
    expenseCatalogs: action.payload.data,
  }),

  [setExpenseItem]: (state, action) => ({
    ...state,
    editMode: action.payload.attribute.editMode,
    expenseItem: action.payload.attribute.id,
    selectedExpenseItemId: action.payload.attribute.id,
  }),

  [setExpenseItems]: (state, action) => ({
    ...state,
    expenseItems: action.payload.data,
    editMode: false,
    expenseItem: undefined,
    expenseCatalogId: action.payload.attribute,
  }),
});
