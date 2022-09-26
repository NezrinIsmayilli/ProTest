import { createReducer } from 'redux-starter-kit';
import {
  setPayments,
  setPaymentUrlAndTotal,
  resetTotalAndUrl,
  setOverallPrice,
  setFinance,
  setBalance,
  setPaymentsBalance,
  setTenantId,
  setTenantFeatue,
} from 'store/actions/subscription';

const initialState = {
  subscription: {},
  packages: {},
  limits: {},

  payments: [],

  total: undefined,
  redirect_url: undefined,

  invoices: [],
  balance: [],
  paymentBalance: [],
  tenantIdData: [],
  tenentFeature: [],
};

export const subscriptionReducer = createReducer(initialState, {
  [setPayments]: (state, action) => ({
    ...state,
    payments: action.payload.data,
  }),

  [setPaymentUrlAndTotal]: (state, action) => ({
    ...state,
    ...action.payload.data,
  }),

  [setOverallPrice]: (state, action) => {
    return {
      ...state,
      ...action.payload.data,
    };
  },

  [resetTotalAndUrl]: state => ({
    ...state,
    // total: undefined,
    redirect_url: undefined,
  }),

  [setFinance]: (state, action) => ({
    ...state,
    invoices: action.payload.data,
  }),
  [setBalance]: (state, action) => ({
    ...state,
    balance: action.payload.data,
  }),
  [setPaymentsBalance]: (state, action) => ({
    ...state,
    paymentBalance: action.payload.data,
  }),
  [setTenantId]: (state, action) => ({
    ...state,
    tenantIdData: action.payload.data,
  }),
  [setTenantFeatue]: (state, action) => ({
    ...state,
    tenentFeature: action.payload.data,
  }),
});
