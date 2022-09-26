import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setInvoiceListByContactId } from 'store/actions/contact';

export const invoicesReducer = createReducer(
  {
    invoices: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'invoiceListByContactId') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'invoiceListByContactId') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setInvoiceListByContactId]: (state, action) => ({
      ...state,
      invoices: action.payload.data,
    }),
  }
);
