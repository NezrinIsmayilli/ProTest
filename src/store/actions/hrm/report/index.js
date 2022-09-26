import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setReports = createAction('setReports');
export const setReportsHistory = createAction('setReportsHistory');
export const resetFilters = createAction('resetFilters');
export const reportsSalaryFilter = createAction('reportsSalaryFilter');
export const reportsSearchHandle = createAction('reportsSearchHandle');

export function fetchHRMReports(year, month) {
  return apiAction({
    url: `/hrm/report/payroll/${year}/${month}`,
    onSuccess: setReports,
    label: 'reports',
  });
}

export function fetchFilteredReports(
  year,
  month,
  { filters } = {},
  callback = () => {}
) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/hrm/report/payroll/${year}/${month}?${query}`,
    onSuccess: params => dispatch => {
      const mergedObject = {
        workerRequestQuery: query,
        data: params.data,
      };
      dispatch(setReports(mergedObject));
      callback();
    },
    label: 'reports',
  });
}

export function createSalaryPayment(data, callback) {
  return apiAction({
    url: '/hrm/salary-payment',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'createSalaryPayment',
  });
}

export function createSalaryAddition(data, callback) {
  return apiAction({
    url: '/hrm/salary-addition',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'createSalaryAddition',
  });
}

export function createSalaryDeduction(data, callback) {
  return apiAction({
    url: '/hrm/salary-deduction',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'createSalaryDeduction',
  });
}

export function saveSalary(data, callback) {
  return apiAction({
    url: '/hrm/salary',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'reports',
  });
}

export function fetchHRMReportsHistory({
  year,
  month,
  deleted,
  onSuccessCallback,
  label = 'reportsHistory',
}) {
  return apiAction({
    url: `/hrm/report/payroll/history/${year}/${month}?deleted=${deleted}`,
    onSuccess: data => dispatch => {
      dispatch(setReportsHistory(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label,
  });
}

export function deleteHRMReportsHistoryItem(type, id, callback, failureCallback) {
  return apiAction({
    url: `/hrm/${type}/${id}`,
    onSuccess: callback,
    onFailure: failureCallback,
    method: 'DELETE',
    attribute: 'delete',
    label: 'reportsHistory',
    showErrorToast: false,
  });
}
export function changeArchive(data, callback) {
  return apiAction({
    url: `/hrm/report/payroll-archive`,
    onSuccess: callback,
    method: 'POST',
    data,
    label: 'payrollArchive',
  });
}
