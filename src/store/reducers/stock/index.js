import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
    setStocks,
    setStockInfo,
    deleteStockAction,
    setReminders,
    setMovements,
    resetStockInfo,
    setStockStatics,
    setStockStaticsCount,
    setStockStaticsInfo,
    setStocksCount,
} from 'store/actions/stock';

const initialState = {
    stocks: [],
    stocksCount: undefined,
    stocksStatics: [],
    stockStaticsCount: undefined,
    mainCurrencyCode: undefined,
    reminders: [],
    movements: [],
    stockInfo: undefined,
    added: false,
    edited: false,
    isLoading: false,
    actionLoading: false,
};

export const stockReducer = createReducer(initialState, {
    [apiStart]: (state, action) => {
        if (action.payload === 'stock') {
            return {
                ...state,
                isLoading: true,
            };
        }
        if (action.payload === 'action') {
            return {
                ...state,
                actionLoading: true,
            };
        }
    },

    [apiEnd]: (state, action) => {
        if (action.payload === 'stock') {
            return {
                ...state,
                isLoading: false,
            };
        }
        if (action.payload === 'action') {
            return {
                ...state,
                actionLoading: false,
            };
        }
    },

    [setStockInfo]: (state, action) => ({
        ...state,
        stockInfo: action.payload.data,
    }),

    [setStocks]: (state, action) => ({
        ...state,
        stocks: action.payload.data,
        mainCurrencyCode: action.payload.mainCurrencyCode,
        added: action.payload.attribute === 'added',
        edited: action.payload.attribute === 'edited',
    }),

    [setStockStatics]: (state, action) => ({
        ...state,
        stocksStatics: action.payload.data,
        mainCurrencyCode: action.payload.mainCurrencyCode,
    }),
    [setStocksCount]: (state, action) => ({
        ...state,
        stocksCount: action.payload.data,
    }),
    [setStockStaticsCount]: (state, action) => ({
        ...state,
        stockStaticsCount: action.payload.data,
    }),

    [deleteStockAction]: (state, action) => ({
        ...state,
        stocks: state.stocks.filter(
            item => item.id !== action.payload.attribute
        ),
        stockInfo: undefined,
    }),
    [setStockStaticsInfo]: (state, action) => ({
        ...state,
        stockStaticsInfo: action.payload.data,
    }),
    [setReminders]: (state, action) => ({
        ...state,
        reminders: action.payload.data,
    }),

    [setMovements]: (state, action) => ({
        ...state,
        movements: action.payload.data,
    }),

    [resetStockInfo]: state => ({
        ...state,
        stockInfo: undefined,
    }),
});
