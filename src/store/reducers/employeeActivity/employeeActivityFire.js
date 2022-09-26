import { createReducer } from 'redux-starter-kit';
import { setActivityFireInfo } from 'store/actions/employeeActivity/employeeActivityFire';
import { apiStart, apiEnd } from 'store/actions/api';

export const fireReducer = createReducer(
  {
    data: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'employeeActivityFires') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'employeeActivityFires') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setActivityFireInfo]: (state, action) => ({
      ...state,
      data: action.payload.data,
    }),
  }
);
