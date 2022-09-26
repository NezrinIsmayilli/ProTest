import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setSalesInvoiceList,
  setSalesInvoiceCount,
  setInitialDebtList,
  setInitialDebteCount,
} from 'store/actions/salesAndBuys';

const initialState = {
  invoices: [],
  initialDebt: [],
  isLoading: false,
  actionLoading: false,

  // invoiceCount:undefined
};

export const salesAndBuysReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'setSalesInvoiceList' || action.payload === 'setInitialDebtList') {
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
    if (action.payload === 'setSalesInvoiceList' || action.payload === 'setInitialDebtList') {
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
  [setSalesInvoiceList]: (state, action) => ({
    ...state,
    invoices: action.payload.data,
  }),
  [setSalesInvoiceCount]: (state, action) => ({
    ...state,
    invoicesCount: action.payload.data,
  }),
  [setInitialDebtList]: (state, action) => ({
    ...state,
    initialDebt: action.payload.data,
  }),
  [setInitialDebteCount]: (state, action) => ({
    ...state,
    debtsCount: action.payload.data,
  }),
  // [setEditMode]: (state, action) => ({
  //   ...state,
  //   editMode: action.payload,
  // }),
  //
  // [setCatalogId]: (state, action) => ({
  //   ...state,
  //   catalogId: action.payload,
  //   products: [],
  // }),
  //
  // [setProduct]: (state, action) => ({
  //   ...state,
  //   editMode: action.payload.attribute.editMode,
  //   product: action.payload.data,
  //   selectedProductId: action.payload.attribute.id,
  // }),
  //
  // [setSalesInvoiceCount]:(state, action) => ({
  //   ...state,
  //   invoiceCount:action.payload.data
  // }),
  // [setProductsExtended]: (state, action) => ({
  //   ...state,
  //   productsExtended: action.payload.data,
  //   editMode: false,
  //   product: {},
  //   catalogId: action.payload.attribute,
  // }),
});
