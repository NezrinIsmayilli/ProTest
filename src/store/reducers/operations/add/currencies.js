import { createReducer } from 'redux-starter-kit';
import { setCurrencies, setConvertCurrency } from 'store/actions/contact';
import { apiStart, apiEnd } from 'store/actions/api';

export const currenciesReducer = createReducer(
  {
    currencies: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'currencies') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'currencies') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setCurrencies]: (state, action) => ({
      ...state,
      currencies: action.payload.data,
    }),
  }
);

export const convertCurrency = createReducer(
  {
    convertedAmount: {},
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'convertCurrencies') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'convertCurrencies') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setConvertCurrency]: (state, action) => ({
      ...state,
      convertedAmount: action.payload.data,
    }),
  }
);