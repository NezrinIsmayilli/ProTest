import { createReducer } from 'redux-starter-kit';
import {
  setApplyTypes,
  setRootEditMode,
  setCallApplyTypes,
} from 'store/actions/settings/applyTypes';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
  applyTypes: [],
  callApplyTypes: [],
  editingRootId: undefined,
  isLoading: false,
  actionLoading: false,
  // unused
  added: false,
  edited: false,
};

export const applyTypesReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'applyTypes') {
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
    if (action.payload === 'applyTypes') {
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
  [setApplyTypes]: (state, action) => ({
    ...initialState,
    applyTypes: action.payload.data,
    added: action.payload.attribute === 'added',
    edited: action.payload.attribute === 'edited',
  }),

  [setRootEditMode]: (state, action) => ({
    ...state,
    editingRootId: action.payload,
    added: false,
    edited: false,
    catalog: {},
  }),
  [setCallApplyTypes]: (state, action) => ({
    ...initialState,
    callApplyTypes: action.payload.data,
  }),
});
