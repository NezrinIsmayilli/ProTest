import { createReducer } from 'redux-starter-kit';
import {
  setWorkers,
  setDismissedWorkers,
  dismissedWorkesSearch,
  workersSearchHandle,
  setWorker,
} from 'store/actions/hrm/workers';
import { apiStart, apiEnd } from 'store/actions/api';

export const workersReducer = createReducer(
  {
    workers: [],
    dismissedWorkers: [],
    workersFilteredData: [],
    dismissedWorkersFiltered: [],
    isLoading: false,
    query: '',
    worker: null,
    workerRequestQuery: '',
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'workers') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },

    [apiEnd]: (state, action) => {
      if (action.payload === 'workers') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },

    [setWorkers]: (state, action) => {
      const { query } = state;
      const { data, workerRequestQuery } = action.payload;

      if (!query) {
        return {
          ...state,
          workers: data,
          workersFilteredData: data,
          workerRequestQuery,
        };
      }
    },
    [setDismissedWorkers]: (state, action) => {
      const { query } = state;
      const { data } = action.payload;

      if (!query) {
        return {
          ...state,
          dismissedWorkers: data,
          dismissedWorkersFiltered: data,
        };
      }
    },
    [dismissedWorkesSearch]: (state, action) => {
      const query = action.payload;

      const { dismissedWorkers } = state;

      if (!query) {
        return {
          ...state,
          dismissedWorkersFiltered: dismissedWorkers,
          query: '',
        };
      }

      const result = dismissedWorkers.filter(item =>
        String(item.name)
          .replace('İ', 'I')
          .toLowerCase()
          .includes(
            String(query)
              .replace('İ', 'I')
              .toLowerCase()
          )
      );

      return {
        ...state,
        dismissedWorkersFiltered: result,
        query,
      };
    },

    [workersSearchHandle]: (state, action) => {
      const query = action.payload;

      const { workers } = state;

      if (!query) {
        return {
          ...state,
          workersFilteredData: workers,
          query: '',
        };
      }

      const result = workers.filter(item =>
        String(item.name)
          .replace('İ', 'I')
          .toLowerCase()
          .includes(
            String(query)
              .replace('İ', 'I')
              .toLowerCase()
          )
      );

      return {
        ...state,
        workersFilteredData: result,
        query,
      };
    },

    [setWorker]: (state, action) => ({
      ...state,
      worker: action.payload.data,
    }),
  }
);
