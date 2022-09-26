import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setGoodsTurnovers,
  setGoodsTurnoversCount,
  setSelectedGoodsTurnoversDetails,
} from 'store/actions/operations/goods-turnovers';

const initialState = {
  goodsTurnovers: [],
  total: null,
  selectedGoodsTurnoversDetails: {},
  isLoading: false,
  actionLoading: false,
};

export const goodsTurnoversReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'goods-turnovers') {
      return {
        ...state, 
        isLoading: true,
      };
    }

    if (action.payload === 'goods-turnovers-actions') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'goods-turnovers') {
      return {
        ...state,
        isLoading: false,
      };
    }

    if (action.payload === 'goods-turnovers-actions') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setGoodsTurnovers]: (state, action) => ({
    ...state,
    goodsTurnovers: Object.values(action.payload.data),
  }),

  [setGoodsTurnoversCount]: (state, action) => ({
    ...state,
    total: action.payload.data,
  }),

  [setSelectedGoodsTurnoversDetails]: (state, action) => ({
    ...state,
    selectedGoodsTurnoversDetails: action.payload.data,
  }),
});
