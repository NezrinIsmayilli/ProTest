import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const set_profit_and_lose_report_by_month = createAction(
  'reports/payments/setProfitAndLoseReportByMonth'
);
export const set_profit_and_lose_report_by_quarter = createAction(
  'reports/payments/setProfitAndLoseReportByQuarter'
);
export const set_profit_and_lose_report_by_year = createAction(
  'reports/payments/setProfitAndLoseReportByYear'
);
export const setProfitAndLossInvoices = createAction(
  'reports/payments/setProfitAndLossInvoices'
);
export const setProfitAndLossExpenses = createAction(
  'reports/payments/setProfitAndLossExpenses'
);
export const setProfitAndLossSalary = createAction(
  'reports/payments/setProfitAndLossSalary'
);
export const clearProfitAndLoss = createAction(
  'reports/payments/clearProfitAndLoss'
);
export const clearExpenses = createAction(
  'reports/payments/clearExpenses'
);

export const fetchProfitByMonth = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/payments?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(set_profit_and_lose_report_by_month(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchProfitByMonth',
  });
};

export const fetchProfitByQuarter = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/payments?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(set_profit_and_lose_report_by_quarter(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchProfitByQuarter',
  });
};
export const fetchProfitByYear = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/payments?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(set_profit_and_lose_report_by_year(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchProfitByYear',
  });
};

export const fetchProfitAndLossInvoices = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `sales/invoices?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setProfitAndLossInvoices(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchProfitAndLossInvoices',
  });
};
export function fetchProfitAndLossExpenses(props = {}) {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transactions?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProfitAndLossExpenses(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchProfitAndLossExpenses',
  });
}
export function fetchProfitAndLossSalary(props = {}) {
  const { year, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: `/transaction/report/payments/${year}`,
    onSuccess: data => dispatch => {
      dispatch(setProfitAndLossSalary(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchProfitAndLossSalary',
  });
}
