import { createReducer } from 'redux-starter-kit';
import {
  set_profit_and_lose_report_by_month,
  set_profit_and_lose_report_by_quarter,
  set_profit_and_lose_report_by_year,
  setProfitAndLossInvoices,
  setProfitAndLossExpenses,
  setProfitAndLossSalary,
  clearProfitAndLoss,
  clearExpenses,
} from 'store/actions/reports/profit-and-loss';

const initialState = {
  profitByMonth: [],
  profitByQuarter: [],
  profitByYear: [],
  profitAndLossSalary: [],
  invoices: [],
  expenses: [],
};

export const profitAndLossReducer = createReducer(initialState, {
  [set_profit_and_lose_report_by_month]: (state, action) => ({
    ...state,
    profitByMonth: action.payload.data,
  }),
  [set_profit_and_lose_report_by_quarter]: (state, action) => ({
    ...state,
    profitByQuarter: action.payload.data,
  }),
  [set_profit_and_lose_report_by_year]: (state, action) => ({
    ...state,
    profitByYear: action.payload.data,
  }),
  [setProfitAndLossSalary]: (state, action) => ({
    ...state,
    profitAndLossSalary: action.payload.data,
  }),
  [setProfitAndLossInvoices]: (state, action) => ({
    ...state,
    invoices: action.payload.data,
  }),
  [setProfitAndLossExpenses]: (state, action) => ({
    ...state,
    expenses: action.payload.data,
  }),
  [clearProfitAndLoss]: () => ({
    ...initialState,
  }),
  [clearExpenses]: state => ({
    ...state,
    expenses: [],
  }),
});
