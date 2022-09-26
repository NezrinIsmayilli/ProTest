import { createReducer } from 'redux-starter-kit';
import {
  setVacationTypes,
  setBusinessTripReasons,
  setTimeOffReasons,
  setFireReasons,
} from 'store/actions/settings/hr';
import { apiStart, apiEnd } from 'store/actions/api';

export const hrReducer = createReducer(
  {
    vacationTypes: [],
    businessTripReasons: [],
    timeOffReasons: [],
    fireReasons: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'vacationTypes') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'vacationTypes') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setVacationTypes]: (state, action) => ({
      ...state,
      vacationTypes: action.payload.data,
    }),
    [setBusinessTripReasons]: (state, action) => ({
      ...state,
      businessTripReasons: action.payload.data,
    }),
    [setTimeOffReasons]: (state, action) => ({
      ...state,
      timeOffReasons: action.payload.data,
    }),
    [setFireReasons]: (state, action) => ({
      ...state,
      fireReasons: action.payload.data,
    }),
  }
);
