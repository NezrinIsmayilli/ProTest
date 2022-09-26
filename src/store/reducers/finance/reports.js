import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setReportCashFlow,
  setAdvanceReport,
  setEmployeeReport,
  setBalanceReport,
  setCurrencies,
  setCurrencyReport,
  setCashboxBalanceReport,
  setCashboxInitialBalance,
  clearReports,
} from 'store/actions/finance/reports';

const initialState = {
  filteredList: [],
  advanceReport: [],
  employeeReport: [],
  balanceReport: [],
  currencyReport: [],
  cashboxBalanceReport: [],
  cashboxInitialBalance: [],
  currencies: [],
  isLoading: false,
};

export const financeReportsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'financeReportCashFlow') {
      return {
        ...state,
        isLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'financeReportCashFlow') {
      return {
        ...state,
        isLoading: false,
      };
    }
  },

  [setReportCashFlow]: (state, action) => ({
    ...state,
    filteredList: action.payload.data,
  }),
  [setAdvanceReport]: (state, action) => ({
    ...state,
    advanceReport: action.payload.data,
  }),
  [setEmployeeReport]: (state, action) => ({
    ...state,
    employeeReport: action.payload.data,
  }),
  [setBalanceReport]: (state, action) => ({
    ...state,
    balanceReport: action.payload.data,
  }),
  [setCurrencyReport]: (state, action) => ({
    ...state,
    currencyReport: action.payload.data,
  }),
  [setCashboxBalanceReport]: (state, action) => ({
    ...state,
    cashboxBalanceReport: Object.values(action.payload.data),
  }),
  [setCashboxInitialBalance]: (state, action) => ({
    ...state,
    cashboxInitialBalance: Object.values(action.payload.data),
  }),
  [setCurrencies]: (state, action) => ({
    ...state,
    currencies: action.payload.data,
  }),
  [clearReports]: () => initialState,
});
