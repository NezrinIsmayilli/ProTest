import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const set_balance_sheet = createAction(
  'reports/balance-sheet/set_balance_sheet'
);
export const set_balance = createAction('reports/balance-sheet/set_balance');
export const clearBalance = createAction('finance/balance-sheet/clearBalance');

// Balance Sheet
export const getBalanceSheet = (props = {}) => {
  const {
    filters,
    onSuccessCallback,
    onFailureCallback,
    label = 'balance-sheet',
  } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/balance-sheet?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(set_balance_sheet(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
};
export const createBalance = props => {
  const {
    data,
    onSuccessCallback,
    onFailureCallback,
    label = 'createBalance',
  } = props;
  return apiAction({
    data,
    label,
    url: `/transaction/report/balance-sheet-report-data`,
    method: 'POST',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};
export const fetchBalance = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/balance-sheet-report-data?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(set_balance(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'balance',
  });
};
export function deleteBalance({ id, onSuccess }) {
  console.log(id);
  return apiAction({
    url: `/transaction/report/balance-sheet-report-data/${id}`,
    method: 'DELETE',
    onSuccess,
    showToast: true,
    label: 'deleteBalance',
  });
}
export function editBalance(id, data, callback) {
  return apiAction({
    url: `/transaction/report/balance-sheet-report-data/${id}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    attribute: 'edited',
    label: 'editBalance',
  });
}
