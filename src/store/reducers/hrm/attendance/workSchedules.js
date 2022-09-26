import { createReducer } from 'redux-starter-kit';
import {
  setWorkSchedules,
  setSelectedSchedule,
} from 'store/actions/hrm/attendance/workSchedules';

const initialState = {
  workSchedules: [],
  selectedSchedule: undefined,
};

export const workSchedulesReducer = createReducer(initialState, {
  [setWorkSchedules]: (state, action) => ({
    ...state,
    workSchedules: action.payload.data,
    selectedSchedule: state.selectedSchedule || action.payload.data[0],
  }),

  [setSelectedSchedule]: (state, action) => ({
    ...state,
    selectedSchedule: action.payload.attribute,
  }),
});
