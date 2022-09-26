import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const set_salary_by_month = createAction(
  'reports/salary/setSalaryByMonth'
);
export const set_salary_by_quarter = createAction(
  'reports/salary/setSalaryByQuarter'
);
export const set_salary_by_year = createAction(
  'reports/salary/setSalaryByYear'
);  

export const fetchSalaryByMonth = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/hrm/report/salary?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(set_salary_by_month(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchSalaryByMonth',
  });
};

export const fetchSalaryByQuarter = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/hrm/report/salary?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(set_salary_by_quarter(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchSalaryByQuarter',
  });
};
export const fetchSalaryByYear = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/hrm/report/salary?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(set_salary_by_year(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchSalaryByYear',
  });
};

// export const fetchProfitAndLossInvoices = (props = {}) => {
//   const { filters, onSuccessCallback, onFailureCallback } = props;
//   const query = filterQueryResolver(filters);
//   const url = `sales/invoices?${query}`;
//   return apiAction({
//     url,
//     onSuccess: data => dispatch => {
//       dispatch(setProfitAndLossInvoices(data));
//       if (onSuccessCallback) dispatch(onSuccessCallback(data));
//     },
//     onFailure: error => dispatch => {
//       if (onFailureCallback) dispatch(onFailureCallback(error));
//     },
//     label: 'fetchProfitAndLossInvoices',
//   });
// };
// export function fetchProfitAndLossExpenses(props = {}) {
//   const { filters, onSuccessCallback, onFailureCallback } = props;
//   const query = filterQueryResolver(filters);
//   return apiAction({
//     url: `/hrm?${query}`,
//     onSuccess: data => dispatch => {
//       dispatch(setProfitAndLossExpenses(data));
//       if (onSuccessCallback) dispatch(onSuccessCallback(data));
//     },
//     onFailure: error => dispatch => {
//       if (onFailureCallback) dispatch(onFailureCallback(error));
//     },
//     label: 'fetchProfitAndLossExpenses',
//   });
// }
// export function fetchProfitAndLossSalary(props = {}) {
//   const { year, onSuccessCallback, onFailureCallback } = props;
//   return apiAction({
//     url: `/hrm/report/salary/${year}`,
//     onSuccess: data => dispatch => {
//       dispatch(setProfitAndLossSalary(data));
//       if (onSuccessCallback) dispatch(onSuccessCallback(data));
//     },
//     onFailure: error => dispatch => {
//       if (onFailureCallback) dispatch(onFailureCallback(error));
//     },
//     label: 'fetchProfitAndLossSalary',
//   });
// }
