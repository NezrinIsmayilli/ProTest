import { createReducer } from 'redux-starter-kit';
import { setWorkScheduleDays } from 'store/actions/hrm/attendance/workScheduleDays';

export const workScheduleDaysReducer = createReducer(
  {
    workScheduleDays: [],
  },
  {
    [setWorkScheduleDays]: (state, action) => ({
      ...state,
      workScheduleDays: action.payload.data,
    }),
  }
);
