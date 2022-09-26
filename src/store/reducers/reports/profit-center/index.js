import { createReducer } from 'redux-starter-kit';
import {
  setProfitContracts,
  clearProfitAndLoss,
} from 'store/actions/reports/profit-center';

const initialState = {
  profitContracts: [],
};

export const profitCenterReducer = createReducer(initialState, {
  [setProfitContracts]: (state, action) => ({
    ...state,
    profitContracts: action.payload.data,
  }),
  [clearProfitAndLoss]: () => ({
    ...initialState,
  }),
});
