import { createReducer } from 'redux-starter-kit';
import { setSickLeaveInfo } from 'store/actions/employeeActivity/employeeActivitySickLeave';
import { apiStart, apiEnd } from 'store/actions/api';

export const sickLeaveReducer = createReducer(
  {
    data: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'employeeActivitySickLeave') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'employeeActivitySickLeave') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setSickLeaveInfo]: (state, action) => ({
      ...state,
      data: action.payload.data,
    }),
  }
);
