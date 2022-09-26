import { createReducer } from 'redux-starter-kit';
import {
  setExpenseCatalogs,
  setExpenseCatalog,
  setExpenseCatalogRootEditMode,
} from 'store/actions/expenseCatalog';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
  expenseCatalogs: { root: [], children: {} },
  filteredExpenseCatalogs: { root: [], children: {} },
  expenseCatalog: undefined,
  editingRootId: undefined,
  isLoading: false,
  actionLoading: false
};

export const expenseCatalogReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'expenseCatalog') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'expenseCatalogAction') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'expenseCatalog') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'expenseCatalogAction') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setExpenseCatalogs]: (state, action) => ({
    ...initialState,
    expenseCatalogs: {
      root: action.payload.data,
      children: action.payload.data,

    },
    filteredExpenseCatalogs: {
      root: action.payload.data,
      children: action.payload.data,

    },
  }),

  [setExpenseCatalog]: (state, action) => ({
    ...state,
    //
    expenseCatalogs: {
      root: action.payload.data,
      children: action.payload.data,

    },
  }),

  [setExpenseCatalogRootEditMode]: (state, action) => ({
    ...state,

    editingRootId: action.payload,
    added: false,
    edited: false,
    catalog: {},
  }),
});
