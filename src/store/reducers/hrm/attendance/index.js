/* eslint-disable prefer-destructuring */
import { createReducer } from 'redux-starter-kit';

import {
  setTimeCard,
  setFilters,
  setDate,
  setIntialState,
} from 'store/actions/hrm/attendance';

import { today } from 'utils';

const initialState = {
  timeCard: [],
  filteredTimeCard: [],
  searchQuery: '',
  filterStatus: null,
  date: today,
};

export const attendanceReducer = createReducer(initialState, {
  [setTimeCard]: handleFilter,

  [setFilters]: handleFilter,

  [setDate]: (state, action) => ({
    ...state,
    date: action.payload.date,
    timeCard: [],
    filteredTimeCard: [],
  }),

  [setIntialState]: () => initialState,
});

function handleFilter(state, action) {
  let queryString;
  let status;
  let data;

  // check if action is from api not component
  if ('data' in action.payload) {
    queryString = state.searchQuery;
    status = state.filterStatus;
    data = action.payload.data;
  } else {
    queryString = action.payload.searchQuery;
    status = action.payload.filterStatus;
    data = state.timeCard;
  }

  const query = String(queryString)
    .trim()
    .replace('İ', 'I')
    .toLowerCase();
  let filteredData = null;

  if (status && !query) {
    filteredData = data.filter(item => item.employeeActivityType === status);
  }

  if (!status && query) {
    filteredData = data.filter(
      item =>
        item.employeeName
          .replace('İ', 'I')
          .toLowerCase()
          .includes(query) ||
        item.employeeSurname
          .replace('İ', 'I')
          .toLowerCase()
          .includes(query)
    );
  }

  if (status && query) {
    filteredData = data.filter(function(item) {
      const { employeeActivityType, employeeName, employeeSurname } = item;

      return (
        employeeActivityType === status &&
        (employeeName
          .replace('İ', 'I')
          .toLowerCase()
          .includes(query) ||
          employeeSurname
            .replace('İ', 'I')
            .toLowerCase()
            .includes(query))
      );
    });
  }

  return {
    ...state,
    timeCard: data,
    filteredTimeCard: !status && !query ? data : filteredData,
    searchQuery: query,
    filterStatus: status,
  };
}
