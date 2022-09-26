import { createReducer } from 'redux-starter-kit';
import {
  setProfileInfo,
  setMe,
  setCredentials,
} from 'store/actions/profile/main';

const initialState = {
  profile: {},
  credential: {},
  me: {},
};

export const profileReducer = createReducer(initialState, {
  [setProfileInfo]: (state, action) => ({
    ...state,
    profile: action.payload.data,
  }),
  [setCredentials]: (state, action) => ({
    ...state,
    credential: action.payload.data,
  }),
  [setMe]: (state, action) => ({
    ...state,
    me: action.payload.data,
  }),
});
