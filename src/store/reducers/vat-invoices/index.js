import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setVatInvoices,
  setVatOperations,
  setFinOperations,
  setInvoiceContent,
  setVatInvoicesCount,
} from 'store/actions/vat-invoices';

const initialState = {
  isLoading: false,
  finLoading: false,
  contentLoading: false,
  actionLoading: false,
  vatInvoices: [],
  vatOperations: [],
  finOperations: [],
  invoiceContent: {},
  vatInvoicesCount: 0,
};

export const vatInvoicesReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'vat-invoices') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'vat-invoices-action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
    if (action.payload === 'fin-invoices') {
      return {
        ...state,
        finLoading: true,
      };
    }
    if (action.payload === 'content-invoices') {
      return {
        ...state,
        contentLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'vat-invoices') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'vat-invoices-action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
    if (action.payload === 'fin-invoices') {
      return {
        ...state,
        finLoading: false,
      };
    }
    if (action.payload === 'content-invoices') {
      return {
        ...state,
        contentLoading: false,
      };
    }
  },
  [setVatInvoices]: (state, action) => {
    console.log(action);
    return ({
      ...state,
      vatInvoices: action.payload.data,
    })
  },
  [setVatInvoicesCount]: (state, action) => {
    console.log(action);
    return ({
      ...state,
      vatInvoicesCount: action.payload.data,
    })
  },
  [setVatOperations]: (state, action) => ({
    ...state,
    vatOperations: action.payload.data,
  }),
  [setFinOperations]: (state, action) => ({
    ...state,
    finOperations: action.payload.data,
  }),
  [setInvoiceContent]: (state, action) => ({
    ...state,
    invoiceContent: action.payload.data,
  }),
});
