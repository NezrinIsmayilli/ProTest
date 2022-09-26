import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setHrmEmployees } from 'store/actions/employees';

export const hrmEmployeesReducer = createReducer(
  {
    hrmEmployees: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'hrmEmployees') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'hrmEmployees') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setHrmEmployees]: (state, action) => ({
      ...state,
      hrmEmployees: action.payload.data,
    }),
  }
);
