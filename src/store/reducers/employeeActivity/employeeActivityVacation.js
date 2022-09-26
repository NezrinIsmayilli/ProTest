import { createReducer } from 'redux-starter-kit';
import { setVacationInfo } from 'store/actions/employeeActivity/employeeActivityVacation';
import { apiStart, apiEnd } from 'store/actions/api';

export const vacationReducer = createReducer(
  {
    data: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'employeeActivityVacation') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'employeeActivityVacation') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setVacationInfo]: (state, action) => ({
      ...state,
      data: action.payload.data,
    }),
  }
);
