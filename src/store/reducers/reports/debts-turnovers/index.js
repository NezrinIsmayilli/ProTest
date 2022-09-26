import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';

import {
    setDebtsTurnovers,
    setDebtsTurnoversCount,
} from 'store/actions/reports/debts-turnovers';

const initialState = {
  isLoading: false,
  actionIsLoading: false,
  debtsTurnovers: undefined,
  debtsTurnoversCount: 0,
};

export const debtsTurnoversReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'debts-turnovers') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'debts-turnovers-action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'debts-turnovers') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'debts-turnovers-action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setDebtsTurnovers]: (state, action) => {
    console.log(action);

    return {
      ...state,
      debtsTurnovers: Object.values(action.payload.data),
    };
  },
  [setDebtsTurnoversCount]: (state, action) => {
    return {
      ...state,
      debtsTurnoversCount: action.payload.data,
    };
  },
});
