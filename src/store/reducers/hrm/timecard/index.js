/* eslint-disable prefer-destructuring */
import { createReducer } from 'redux-starter-kit';
import { currentYear, currentMonth } from 'utils';

import {
  setTimecardReportArchive,
  setArchiveEmployees,
  setSelectedArchive,
  setSelectedYear,
  setSelectedMonth,
  setSelectedEmployee,
  resetTimecardData,
} from 'store/actions/hrm/timecard';

export const defaultArchiveData = {
  id: 0,
  name: 'Uçot cədvəli',
  month: currentMonth,
  year: currentYear,
};

const initialState = {
  timecardReportArchive: [],
  archiveEmployees: [],
  selectedArchive: defaultArchiveData,
  selectedEmployee: null,
  selectedYear: currentYear,
  selectedMonth: currentMonth,
  isDefaultSelected: true,
};

export const hrmTimecardReducer = createReducer(initialState, {
  [setTimecardReportArchive]: (state, action) => ({
    ...state,
    timecardReportArchive: [defaultArchiveData, ...action.payload.data],
  }),

  [setArchiveEmployees]: (state, action) => ({
    ...state,
    archiveEmployees: action.payload.data,
  }),

  [setSelectedArchive]: (state, action) => ({
    ...state,
    selectedEmployee: null,
    selectedArchive: action.payload.attribute,
    isDefaultSelected: action.payload.attribute.id === 0,
  }),

  [setSelectedYear]: (state, action) => ({
    ...state,
    selectedYear: action.payload.attribute,
    selectedArchive: defaultArchiveData,
  }),

  [setSelectedMonth]: (state, action) => ({
    ...state,
    selectedMonth: action.payload.attribute,
    selectedArchive: defaultArchiveData,
  }),

  [setSelectedEmployee]: (state, action) => ({
    ...state,
    selectedEmployee: action.payload.attribute,
  }),

  [resetTimecardData]: () => initialState,
});
