import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setOrderReports,
  setOrderReportsCount,
  setSalesInvoiceList,
} from 'store/actions/reports/order-report';

const initialState = {
  isLoading: false,
  actionIsLoading: false,
  orderReports: [],
  orderReportsCount: 0,
  mainCurrencyCode: undefined,
  invoices: [],
};

export const orderReportReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'order-report') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'order-report-action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'order-report') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'order-report-action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setOrderReports]: (state, action) => ({
    ...state,
    orderReports: action.payload.data,
    mainCurrencyCode: action.payload.mainCurrencyCode,
  }),
  [setOrderReportsCount]: (state, action) => ({
    ...state,
    orderReportsCount: action.payload.data,
  }),
  [setSalesInvoiceList]: (state, action) => ({
    ...state,
    invoices: action.payload.data,
  }),
});
