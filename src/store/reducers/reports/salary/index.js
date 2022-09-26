import { createReducer } from 'redux-starter-kit';
import {
  set_salary_by_month,
  set_salary_by_quarter,
  set_salary_by_year,
} from 'store/actions/reports/salary';

const initialState = {
  salaryByMonth: [],
  salaryByQuarter: [],
  salaryByYear: [],
};

export const salaryReducer = createReducer(initialState, {
  [set_salary_by_month]: (state, action) => ({
    ...state,
    salaryByMonth: action.payload.data,
  }),
  [set_salary_by_quarter]: (state, action) => ({
    ...state,
    salaryByQuarter: action.payload.data,
  }),
  [set_salary_by_year]: (state, action) => ({
    ...state,
    salaryByYear: action.payload.data,
  }),
});
