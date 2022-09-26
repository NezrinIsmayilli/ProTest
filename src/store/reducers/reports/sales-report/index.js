import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setSalesReports,
  setSalesReportsCount,
} from 'store/actions/reports/sales-report';

const initialState = {
  isLoading: false,
  actionIsLoading: false,
  salesReports: [],
  salesReportsCount: 0,
  mainCurrencyCode: undefined,
};

export const salesReportReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'sales-report') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'sales-report-action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'sales-report') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'sales-report-action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setSalesReports]: (state, action) => ({
    ...state,
    salesReports: action.payload.data,
    mainCurrencyCode: action.payload.mainCurrencyCode,
  }),

  [setSalesReportsCount]: (state, action) => ({
    ...state,
    salesReportsCount: action.payload.data,
  }),
});
