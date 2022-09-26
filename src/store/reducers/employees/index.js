import { createReducer } from 'redux-starter-kit';
import {
  setEmployees,
  filterEmployees,
  employeesSearchHandle,
} from 'store/actions/employees';
import { apiStart, apiEnd } from 'store/actions/api';

import {
  checkIsConnected,
  checkName,
  checkRoleId,
} from 'utils/userSearchFormFunctions';

const initialState = {
  employees: [],
  filteredEmployees: [],
  employeesFilteredData: [],
  query: '',
  isLoading: false,
};
export const employeesReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'employees') {
      return {
        ...state,
        isLoading: true,
      };
    }
  },
  [apiEnd]: (state, action) => {
    if (action.payload === 'employees') {
      return {
        ...state,
        isLoading: false,
      };
    }
  },
  [setEmployees]: (state, action) => {
    const { query } = state;
    const { data } = action.payload;

    if (!query) {
      return {
        ...state,
        employees: data,
        employeesFilteredData: data,
      };
    }

    const result = data.filter(function(item) {
      if (
        checkIsConnected(item.isConnected, query.filters.isConnected) &&
        checkName(item.name, query.filters.name) &&
        checkRoleId(item.roleId, query.filters.roleId)
      ) {
        return true;
      }
      return false;
    });

    return {
      ...state,
      employees: data,
      employeesFilteredData: result,
    };
  },
  [filterEmployees]: (state, action) => {
    const result = state.employees.filter(
      item => item.structureId === action.payload.structureId
    );
    return {
      ...state,
      filteredEmployees: result,
    };
  },
  [employeesSearchHandle]: (state, action) => {
    const query = action.payload;

    const { employees } = state;

    if (!query) {
      return {
        ...state,
        employeesFilteredData: employees,
        query: '',
      };
    }

    const result = employees.filter(function(item) {
      if (
        checkIsConnected(item.isConnected, query.filters.isConnected) &&
        checkName(item.name, query.filters.name) &&
        checkRoleId(item.roleId, query.filters.roleId)
      ) {
        return true;
      }
      return false;
    });

    return {
      ...state,
      employeesFilteredData: result,
      query,
    };
  },
});
