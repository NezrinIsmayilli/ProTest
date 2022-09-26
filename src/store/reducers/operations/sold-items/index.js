import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setSoldItems,
  setSoldItemsCount,
  setSalesInvoices,
  setSelectedSoldItemDetails,
} from 'store/actions/operations/sold-items';

const initialState = {
  soldItems: [],
  mainCurrencyCode: null,
  total: 0,
  salesInvoices: [],
  selectedSoldItemDetails: {},
  isLoading: false,
  actionLoading: false,
};

export const soldItemsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'sold-items') {
      return {
        ...state,
        isLoading: true,
      };
    }

    if (action.payload === 'sold-items-actions') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'sold-items') {
      return {
        ...state,
        isLoading: false,
      };
    }

    if (action.payload === 'sold-items-actions') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setSoldItems]: (state, action) => ({
    ...state,
    soldItems: action.payload.data,
    mainCurrencyCode: action.payload.mainCurrencyCode,
  }),

  [setSoldItemsCount]: (state, action) => ({
    ...state,
    total: action.payload.data,
  }),

  [setSalesInvoices]: (state, action) => ({
    ...state,
    salesInvoices: action.payload.data,
  }),

  [setSelectedSoldItemDetails]: (state, action) => ({
    ...state,
    selectedSoldItemDetails: action.payload.data,
  }),
});
