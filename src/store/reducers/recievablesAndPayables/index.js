import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setRecievables,
  setPayables,
  setRecievablesCount,
  setPayablesCount,
} from 'store/actions/recievablesAndPayables';

const initialState = {
  recievables: [],
  payables: [],
  payablesCount: 0,
  recievablesCount: 0,
  isLoading: false,
};

export const recievablesAndPayablesReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'payables' || action.payload === 'recievables') {
      return {
        ...state,
        isLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'payables' || action.payload === 'recievables') {
      return {
        ...state,
        isLoading: false,
      };
    }
  },

  [setRecievables]: (state, action) => ({
    ...state,
    recievables: action.payload.data,
  }),
  [setPayables]: (state, action) => ({
    ...state,
    payables: action.payload.data,
  }), 
  [setRecievablesCount]: (state, action) => ({
    ...state,
    recievablesCount: action.payload.data,
  }),
  [setPayablesCount]: (state, action) => ({
    ...state,
    payablesCount: action.payload.data,
  }),
});
