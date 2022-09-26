import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setAllDebtsTurnovers, setAllSalesReports } from 'store/actions/export-to-excel/reportsModule';


const initialState = {
  exSalesReportsIsLoading: false,
  exSalesReports: [],
  exDebstTurnoverIsLoading: false,
  exDebtsTurnOver: [],
};

export const allReportsModuleReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'all-salesReports') {
      return {
        ...state,
        exStocksIsLoading: true,
      };
    }
    if (action.payload === 'all-debts-turnovers') {
      return {
        ...state,
        exDebstTurnoverIsLoading: true,
      };
    }

  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'all-salesReports') {
      return {
        ...state,
        exStocksIsLoading: false,
      };
    }
    if (action.payload === 'all-debts-turnovers') {
      return {
        ...state,
        exDebstTurnoverIsLoading: false,
      };
    }

  },

  [setAllSalesReports]: (state, action) => ({
    ...state,
    exStocks: action.payload.data,
  }),
  [setAllDebtsTurnovers]: (state, action) => ({
    ...state,
    exDebtsTurnOver: action.payload.data,
  })
});
