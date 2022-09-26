import { createReducer } from 'redux-starter-kit';
import { setBusinessTripInfo } from 'store/actions/employeeActivity/employeeActivityBusinessTrip';
import { apiStart, apiEnd } from 'store/actions/api';

export const businessTripReducer = createReducer(
  {
    data: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'employeeActivityBusinessTrips') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'employeeActivityBusinessTrips') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setBusinessTripInfo]: (state, action) => ({
      ...state,
      data: action.payload.data,
    }),
  }
);
