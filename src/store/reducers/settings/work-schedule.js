import { createReducer } from 'redux-starter-kit';
import { setWorkSchedulesCall } from 'store/actions/settings/work-schedule';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
  workSchedule: [],
  isLoading: false,
  actionLoading: false,
  // unused
  added: false,
  edited: false,
};

export const WorkScheduleReducer = createReducer(initialState, {
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
  [setWorkSchedulesCall]: (state, action) => ({
    ...initialState,
    workSchedule: [action.payload.data],
    added: action.payload.attribute === 'added',
    edited: action.payload.attribute === 'edited',
  }),
});
