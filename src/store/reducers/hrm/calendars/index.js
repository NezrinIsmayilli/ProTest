import { createReducer } from 'redux-starter-kit';
import { currentYear } from 'utils';

import {
  resetCalendarData,
  setCalendars,
  setIsEditible,
  setCalendarNonWorkingDays,
  setSelectedCaledar,
  setSelectedCalendarDay,
  changeCalendarSelectedYear,
} from 'store/actions/hrm/calendars';

const initialState = {
  calendars: [],
  selectedCalendar: undefined,

  calendarSelectedYear: currentYear,

  calendarNonWorkingDays: [],
  selectedCalendarDay: undefined,
};

export const hrmCalendarReducer = createReducer(initialState, {
  [setCalendars]: (state, action) => ({
    ...state,
    calendars: action.payload.data,
    selectedCalendar: state.selectedCalendar || action.payload.data[0],
  }),

  [changeCalendarSelectedYear]: (state, action) => ({
    ...state,
    calendarSelectedYear: action.payload.data,
  }),

  [setCalendarNonWorkingDays]: (state, action) => ({
    ...state,
    calendarNonWorkingDays: action.payload.data,
    selectedCalendarDay: undefined,
  }),

  [setSelectedCaledar]: (state, action) => ({
    ...state,
    selectedCalendar: action.payload.attribute,
  }),

  [setSelectedCalendarDay]: (state, action) => ({
    ...state,
    selectedCalendarDay: action.payload.attribute,
  }),

  [setIsEditible]: (state, action) => ({
    ...state,
    isEditible: action.payload.attribute,
  }),
  
  [resetCalendarData]: () => initialState,
});
