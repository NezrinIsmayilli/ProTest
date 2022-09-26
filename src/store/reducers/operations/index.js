import { createReducer } from 'redux-starter-kit';
import {
  setInvoiceList,
  setInvoiceInfo,
  setProducts,
  setProductInvoices,
  setProductSerialNumbers,
  resetProductSerialNumbers,
  setError,
  setBarcodes,
  setinvoiceListByContractId,
  resetInvoiceInfo,
  searchHandle,
  resetAllSalesData,
} from 'store/actions/operations/index';

const initialState = {
  invoiceList: {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  },
  invoiceListNotFiltered: {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  },
  invoiceListByContractId: [],
  productInvoices: {},
  invoiceInfo: undefined,
  isLoading: false,
  actionLoading: false,
  isCatalogsLoading: false,
  isProductsLoading: false,
  isSerialLoading: false,
  isBarcodeLoading: false,
  barcodes: [],
  products: [],
  error: {},
  productSerialNumbers: {},
  searchQuery: '',
};

export const salesOperationsReducer = createReducer(initialState, {
  [setInvoiceInfo]: (state, action) => ({
    ...state,
    invoiceInfo: action.payload.data,
  }),

  [resetInvoiceInfo]: state => ({
    ...state,
    invoiceInfo: undefined,
  }),

  [setInvoiceList]: (state, action) => {
    const { searchQuery, invoiceList, invoiceListNotFiltered } = state;
    const { attribute, data } = action.payload;

    if (!String(searchQuery).trim()) {
      return {
        ...state,
        invoiceInfo: undefined,
        invoiceId: null,
        invoiceList: {
          ...invoiceList,
          [attribute.invoiceType]: data,
        },
        invoiceListNotFiltered: {
          ...invoiceListNotFiltered,
          [attribute.invoiceType]: data,
        },
      };
    }

    const result = data.filter(item =>
      item.invoiceNumber.includes(searchQuery)
    );

    return {
      ...state,
      invoiceInfo: undefined,
      invoiceId: null,
      invoiceList: {
        ...invoiceList,
        [attribute.invoiceType]: result,
      },
      invoiceListNotFiltered: {
        ...invoiceListNotFiltered,
        [attribute.invoiceType]: data,
      },
    };
  },

  [setinvoiceListByContractId]: (state, action) => ({
    ...state,
    invoiceInfo: undefined,
    invoiceId: null,
    invoiceListByContractId: action.payload.data,
  }),

  [setProducts]: (state, action) => ({
    ...state,
    products: action.payload.data,
  }),

  [setError]: (state, action) => ({
    ...state,
    error: action.payload.error,
  }),

  [setProductSerialNumbers]: (state, action) => ({
    ...state,
    productSerialNumbers: {
      ...state.productSerialNumbers,
      [action.payload.attribute]: action.payload.data.serialNumbers,
    },
  }),

  [resetProductSerialNumbers]: state => ({
    ...state,
    productSerialNumbers: {},
  }),

  [setBarcodes]: (state, action) => ({
    ...state,
    barcodes: action.payload.data,
  }),
  [setProductInvoices]: (state, action) => ({
    ...state,
    productInvoices: action.payload.data,
  }),

  [searchHandle]: (state, action) => {
    const { searchQuery, tab } = action.payload;
    const { invoiceList, invoiceListNotFiltered } = state;

    if (!searchQuery) {
      return {
        ...state,
        invoiceList: {
          ...invoiceList,
          [tab]: invoiceListNotFiltered[tab],
        },
        searchQuery,
      };
    }

    const result = state.invoiceListNotFiltered[tab].filter(item =>
      item.invoiceNumber.includes(searchQuery)
    );

    return {
      ...state,
      invoiceList: {
        ...state.invoiceList,
        [tab]: result,
      },
      searchQuery,
    };
  },

  [resetAllSalesData]: () => initialState,
});
