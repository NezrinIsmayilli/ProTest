import { createReducer } from 'redux-starter-kit';
import {
  setSerialNumberPrefixes,
  setSalesBuysForms,
  setForms,
} from 'store/actions/settings/serialNumberPrefix';
import { apiStart, apiEnd } from 'store/actions/api';

export const serialNumberPrefixReducer = createReducer(
  {
    serialNumberPrefixes: [],
    salesBuysForms: [],
    contractsForms: [],
    forms: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'serialNumberPrefixes') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'serialNumberPrefixes') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setSerialNumberPrefixes]: (state, action) => ({
      ...state,
      serialNumberPrefixes: action.payload.data,
    }),
    [setSalesBuysForms]: (state, action) => ({
      ...state,
      salesBuysForms: [
        ...Object.values(action.payload.data).filter(({ type }) => type !== 9),
      ],
      contractsForms: [
        ...Object.values(action.payload.data).filter(({ type }) => type === 9),
      ],
    }),
    [setForms]: (state, action) => ({
      ...state,
      forms: action.payload.data,
    }),
  }
);
