import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setAllInvoices, setAllSoldItems,setAllPurchasedItems, setAllGoodTurnOvers } from 'store/actions/export-to-excel/salesBuyModule';

const initialState = {
  exInovicesIsLoading: false,
  exInvoices: [],
  exSoldItemIsLoading: false,
  exSoldItems: [],
  exPurchasedItemIsLoading: false,
  exPurchasedItems: [],
  exGoodsTurnOversIsLoading: false,
  exGoodsTurnOver: [],
};

export const allSalesInovicesReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'all-invoices') {
      return {
        ...state,
        exInovicesIsLoading: true,
      };
    }
    if (action.payload === 'all-soldItems') {
      return {
        ...state,
        exSoldItemIsLoading: true,
      };
    }
    if (action.payload === 'all-purchasedItems') {
      return {
        ...state,
        exPurchasedItemIsLoading: true,
      };
    }
    if (action.payload === 'all-goods-turnovers') {
      return {
        ...state,
        exPurchasedItemIsLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'all-invoices') {
      return {
        ...state,
        exInovicesIsLoading: false,
      };
    }
    if (action.payload === 'all-soldItems') {
      return {
        ...state,
        exSoldItemIsLoading: false,
      };
    }
    if (action.payload === 'all-purchasedItems') {
      return {
        ...state,
        exPurchasedItemIsLoading: false,
      };
    }
    if (action.payload === 'all-goods-turnovers') {
      return {
        ...state,
        exPurchasedItemIsLoading: false,
      };
    }
  },

  [setAllInvoices]: (state, action) => ({
    ...state,
    exInvoices: action.payload.data,
  }),
  [setAllSoldItems]: (state, action) => ({
    ...state,
    exSoldItems: action.payload.data,
  }),
  [setAllPurchasedItems]: (state, action) => ({
    ...state,
    exPurchasedItems: action.payload.data,
  }),
  [setAllGoodTurnOvers]: (state, action) => ({
    ...state,
    exGoodsTurnOver:Object.values(action.payload.data),
  }),
});
