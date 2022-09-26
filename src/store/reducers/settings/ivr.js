import { createReducer } from 'redux-starter-kit';
import { setIvr, setCallIvr } from 'store/actions/settings/ivr';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
  ivr: [],
  callIvr: [],
  isLoading: false,
  actionLoading: false,
  // unused
  added: false,
  edited: false,
};

export const IVRReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'fetchIvr') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },
  [apiEnd]: (state, action) => {
    if (action.payload === 'fetchIvr') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },
  [setIvr]: (state, action) => ({
    ...initialState,
    ivr: action.payload.data,
    added: action.payload.attribute === 'added',
    edited: action.payload.attribute === 'edited',
  }),
  [setCallIvr]: (state, action) => ({
    ...initialState,
    callIvr: action.payload.data,
    added: action.payload.attribute === 'added',
    edited: action.payload.attribute === 'edited',
  }),
});
