import { createReducer } from 'redux-starter-kit';
import { setEmployeeActivityTimeOff } from 'store/actions/employeeActivity/employeeActivityTimeOff';
import { apiStart, apiEnd } from 'store/actions/api';

export const timeOffReducer = createReducer(
  {
    data: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'employeeActivityTimeOffs') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'employeeActivityTimeOffs') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setEmployeeActivityTimeOff]: (state, action) => ({
      ...state,
      data: action.payload.data,
    }),
  }
);
