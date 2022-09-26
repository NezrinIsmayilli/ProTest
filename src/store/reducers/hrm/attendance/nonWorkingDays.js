import { createReducer } from 'redux-starter-kit';
import { setNonWorkingDays } from 'store/actions/hrm/attendance/nonWorkingDays';
import { apiStart, apiEnd } from 'store/actions/api';

export const nonWorkingDaysReducer = createReducer(
  {
    nonWorkingDays: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'nonWorkingDays') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'nonWorkingDays') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setNonWorkingDays]: (state, action) => ({
      nonWorkingDays: action.payload.data,
    }),
  }
);
