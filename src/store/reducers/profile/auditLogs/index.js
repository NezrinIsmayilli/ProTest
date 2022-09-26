import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setFilteredLogs, setLogsCount } from 'store/actions/profile/auditLogs';

const initialState = {
  filteredLogs: [],
  logsCount: 0,
  isLoading: false,
  actionLoading: false,
};

export const logsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'logs') {
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
    if (action.payload === 'logs') {
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

  [setFilteredLogs]: (state, action) => ({
    ...state,
    filteredLogs: action.payload.data,
  }),

  [setLogsCount]: (state, action) => ({
    ...state,
    logsCount: action.payload.data,
  }),
});
