import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setPurchasedItems,
  setPurchasedItemsCount,
  setPurchasedInvoices,
  setSelectedPurchasedItemDetails,
} from 'store/actions/operations/purchased-items';

const initialState = {
  purchasedItems: [],
  total: 0,
  purchasedInvoices: [],
  selectedPurchasedItemDetails: {},
  selectedItemMainCurrencyCode: null,
  mainCurrencyCode: null,
  isLoading: false,
  actionLoading: false,
};

export const purchasedItemsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'purchased-items') {
      return {
        ...state,
        isLoading: true,
      };
    }

    if (action.payload === 'purchased-items-actions') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'purchased-items') {
      return {
        ...state,
        isLoading: false,
      };
    }

    if (action.payload === 'purchased-items-actions') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },
  [setPurchasedItems]: (state, action) => ({
    ...state,
    purchasedItems: action.payload.data,
    mainCurrencyCode: action.payload.mainCurrencyCode,
  }),
  [setPurchasedItemsCount]: (state, action) => ({
    ...state,
    total: action.payload.data,
  }),
  [setPurchasedInvoices]: (state, action) => ({
    ...state,
    purchasedInvoices: action.payload.data,
  }),
  [setSelectedPurchasedItemDetails]: (state, action) => ({
    ...state,
    selectedPurchasedItemDetails: action.payload.data,
    selectedItemMainCurrencyCode: action.payload.mainCurrencyCode,
  }),
});
