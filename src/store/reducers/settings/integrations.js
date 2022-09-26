import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';

import {
  ftcFbChannelInfo,
  ftcFbPagesList,
} from 'store/actions/settings/integrations';

const initialState = {
  fbIntegrationLoading: false,
  fbChannelInfo: [],
  fbPagesList: [],
  actionLoading: false,
  fbPageChangeLoading: false,
  fbPagedeactivateLoading: false,
};

export const IntegrationReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
    if (action.payload === 'fbPageChange') {
      return {
        ...state,
        fbPageChangeLoading: true,
      };
    }
    if (action.payload === 'fbPageDeactive') {
      return {
        ...state,
        fbPagedeactivateLoading: true,
      };
    }
  },
  [apiEnd]: (state, action) => {
    if (action.payload === 'action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
    if (action.payload === 'fbPageChange') {
      return {
        ...state,
        fbPageChangeLoading: false,
      };
    }
    if (action.payload === 'fbPageDeactive') {
      return {
        ...state,
        fbPagedeactivateLoading: false,
      };
    }
  },
  [ftcFbChannelInfo]: (state, action) => ({
    ...state,
    fbChannelInfo: action.payload.data,
  }),
  [ftcFbPagesList]: (state, action) => ({
    ...state,
    fbPagesList: action.payload.data,
  }),
});
