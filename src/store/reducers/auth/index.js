import { createReducer } from 'redux-starter-kit';
import { apiError, apiStart, apiEnd } from 'store/actions/api';
import {
  resetUserInfo,
  setLoggedStatus,
  setProJobsLogin,
} from 'store/actions/auth';

const initialState = {
  data: undefined,
  apiError: undefined,
  isLoading: false,
  logged: false,
  actionLoading: false,
  loginProJobsData: [],
};

export const authReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'checkPartner') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'jobsAuth') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },
  [apiEnd]: (state, action) => {
    if (action.payload === 'checkPartner') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'jobsAuth') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [apiError]: (state, action) => ({
    ...state,
    apiError: action.payload.message,
  }),

  [setLoggedStatus]: (state, action) => ({
    ...initialState,
    logged: action.payload,
  }),
  [setProJobsLogin]: (state, action) => ({
    ...state,
    loginProJobsData: action.payload.data,
  }),

  [resetUserInfo]: () => initialState,
});
