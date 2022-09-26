import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setOperatorReports,
  setSupervisorReports,
  setStatusHistoryReports,
  setOperators,
  setStatusHistoryCount,
  setMainIndicatorsReport,
  setCalls,
  setCallsInternal,
  setCallInternalCount,
  setCallCount,
} from 'store/actions/calls/reports';

const initialState = {
  operatorReports: [],
  supervisorReports: [],
  statusHistoryReports: [],
  operatorsList: [],
  mainIndicatorsData: [],
  calls: [],
  internalCalls: [],
  internalCallsCount: [],
  callCount: [],
  isLoading: false,
  actionLoading: false,
  total: 0,
};

export const callReportsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'operatorReports') {
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
    if (action.payload === 'fetchCalls') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },
  [apiEnd]: (state, action) => {
    if (action.payload === 'operatorReports') {
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
    if (action.payload === 'fetchCalls') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },
  [setOperatorReports]: (state, action) => ({
    ...state,
    operatorReports: action.payload.data,
  }),
  [setSupervisorReports]: (state, action) => ({
    ...state,
    supervisorReports: action.payload.data,
  }),
  [setStatusHistoryReports]: (state, action) => ({
    ...state,
    statusHistoryReports: action.payload.data,
  }),
  [setOperators]: (state, action) => ({
    ...state,
    operatorsList: action.payload.data,
  }),
  [setStatusHistoryCount]: (state, action) => ({
    ...state,
    total: action.payload,
  }),
  [setMainIndicatorsReport]: (state, action) => ({
    ...state,
    mainIndicatorsData: action.payload.data,
  }),
  [setCalls]: (state, action) => ({
    ...state,
    calls: action.payload.data,
  }),
  [setCallsInternal]: (state, action) => ({
    ...state,
    internalCalls: action.payload.data,
  }),
  [setCallInternalCount]: (state, action) => ({
    ...state,
    internalCallsCount: action.payload,
  }),
  [setCallCount]: (state, action) => ({
    ...state,
    callCount: action.payload,
  }),
});
