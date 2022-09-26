/* eslint-disable prefer-destructuring */
import { createReducer } from 'redux-starter-kit';

import {
  setFinesSettings,
  setHrmPenalties,
  setSelectedPerson,
  resetHrmFinesData,
} from 'store/actions/hrm/fines';

const initialState = {
  settings: undefined,
  penalties: [],
  selectedPerson: undefined,
};

export const hrmFinesReducer = createReducer(initialState, {
  [setFinesSettings]: (state, action) => ({
    ...state,
    settings: action.payload.data,
  }),

  [setHrmPenalties]: (state, action) => ({
    ...state,
    penalties: action.payload.data,
  }),

  [setSelectedPerson]: (state, action) => ({
    ...state,
    selectedPerson: action.payload.data,
  }),

  [resetHrmFinesData]: () => initialState,
});
