import { createReducer } from 'redux-starter-kit';
import { setApps } from 'store/actions/apps';

const initialState = {
  apps: [],
};

export const appsReducer = createReducer(initialState, {
  [setApps]: (state, action) => ({
    ...state,
    apps: action.payload.data,
  }),
});
