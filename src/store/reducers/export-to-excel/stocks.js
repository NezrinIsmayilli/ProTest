import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setAllStocks } from 'store/actions/export-to-excel/stocksModule';
import { setAllProducts } from 'store/actions/export-to-excel/stocksModule';
const initialState = {
  exStocksIsLoading: false,
  exStocks: [],
  exProductsIsLoading: false,
  exProducts: [],
};

export const allStocksModuleReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'all-stocks') {
      return {
        ...state,
        exStocksIsLoading: true,
      };
    }
    if (action.payload === 'all-products') {
      return {
        ...state,
        exProductsIsLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'all-stocks') {
      return {
        ...state,
        exStocksIsLoading: false,
      };
    }
    if (action.payload === 'all-products') {
      return {
        ...state,
        exProductsIsLoading: false,
      };
    }
  },

  [setAllStocks]: (state, action) => ({
    ...state,
    exStocks: action.payload.data,
  }),
  [setAllProducts]: (state, action) => ({
    ...state,
    exProducts: action.payload.data,
  })
});
