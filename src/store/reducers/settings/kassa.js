import { createReducer } from 'redux-starter-kit';
import {
  setCashBoxNames,
  setCurrencies,
  setGeneralCurrencies,
  setActiveCurrencies,
  setAllCashBoxNames,
  setCashBoxBalance,
  setMainCurrency,
  setUsedCurrencies,
} from 'store/actions/settings/kassa';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
  isLoading: false,
  isBalanceLoading: false,
  currencies: [],
  activeCurrencies: [],
  usedCurrencies: [],
  mainCurrency: {},
  generalCurrencies: [],
  allCashBoxNames: [],
  cashBoxBalance: [],
  selectedCashBoxForBalance: undefined,
  cashBoxNames: {
    '1': [],
    '2': [],
    '3': [],
    '4': [],
  },

  // main currency
  currency: {},
};

export const kassaReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'cashbox') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'balance') {
      return {
        ...state,
        isBalanceLoading: true,
        cashBoxBalance: [],
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'cashbox') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'balance') {
      return {
        ...state,
        isBalanceLoading: false,
      };
    }
  },

  [setCurrencies]: (state, action) => ({
    ...state,
    currencies: action.payload.data,
  }),

  [setActiveCurrencies]: (state, action) => ({
    ...state,
    activeCurrencies: action.payload.data,
    mainCurrency: action.payload.data.find(item => item.isMain) || {},
  }),

  [setGeneralCurrencies]: (state, action) => ({
    ...state,
    generalCurrencies: action.payload.data,
  }),

  // cashbox
  [setAllCashBoxNames]: (state, action) => ({
    ...state,
    allCashBoxNames: action.payload.data,
  }),

  [setCashBoxNames]: (state, action) => ({
    ...state,
    cashBoxNames: {
      ...state.cashBoxNames,
      [action.payload.attribute]: action.payload.data,
    },
  }),

  [setCashBoxBalance]: (state, action) => ({
    ...state,
    cashBoxBalance: action.payload.data || [],
    selectedCashBoxForBalance: action.payload.attribute,
  }),

  [setMainCurrency]: (state, action) => ({
    ...state,
    currency: action.payload.data,
    mainCurrency: action.payload.data,
  }),
  [setUsedCurrencies]: (state, action) => ({
    ...state,
    usedCurrencies: action.payload.data,
  }),
});
