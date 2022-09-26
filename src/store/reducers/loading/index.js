import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';

export const loadingReducer = createReducer(
  // initial state
  {},
  // action type handlers
  {
    [apiStart]: (state, action) => ({
      ...state,
      [action.payload]: true,
    }),
    [apiEnd]: (state, action) => ({
      ...state,
      [action.payload]: false,
    }),
  }
);
