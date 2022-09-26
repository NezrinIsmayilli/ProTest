import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setSalesInvoiceList = createAction('setSalesInvoiceList');
export const setSalesInvoiceCount = createAction('setSalesInvoiceCount');
export const setInitialDebtList = createAction('setInitialDebtList');
export const setInitialDebteCount = createAction('setInitialDebteCount');

export function fetchSalesInvoiceList({
  filters: { ...filters },
  attribute = {},
  onSuccess,
  label = 'setSalesInvoiceList',
}) {
  if (onSuccess === undefined) {
    onSuccess = setSalesInvoiceList;
  }
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/sales/invoices?${query}`,
    onSuccess,
    attribute,
    label,
  });
}
export function fetchSalesInvoiceSearch({
  filters,
  onSuccess,
  attribute = {},
}) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/sales/invoices/search?${query}`,
    onSuccess,
    attribute,
    label: 'setSalesInvoiceSearch',
  });
}
export function fetchSalesInvoiceInfo({ id, onSuccess, attribute = {}, withoutProducts = 0 }) {
  return apiAction({
    url: `/sales/invoices/invoice/${id}${withoutProducts===1? '?withoutProducts=1': ''}`,
    onSuccess,
    attribute,
    label: 'invoicesInfo',
  });
}

export function fetchSalesInvoiceCount({
  filters: { ...filters },
  attribute = {},
}) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/sales/invoices/count?${query}`,
    onSuccess: setSalesInvoiceCount,
    attribute,
    label: 'setSalesInvoiceCount',
  });
}

export function fetchSalesInvoiceProducts({ id, onSuccess, attribute = {}, filters }) {
  let query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/invoices/invoice-products/${id}?${query}`,
    onSuccess,
    attribute,
    label: 'invoicesInfo',
  });
}

export function fetchSalesInvoiceProductsCount({ id, onSuccess, attribute = {}, filters }) {
  let query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/invoices/invoice-products/count/${id}?${query}`,
    onSuccess,
    attribute,
    label: 'invoicesInfo',
  });
}

export function fetchInitialDebtList({
  filters: { ...filters },
  attribute = {},
  onSuccess,
  label = 'setInitialDebtList',
}) {
  if (onSuccess === undefined) {
    onSuccess = setInitialDebtList;
  }
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/sales/invoices/initial-debts?${query}`,
    onSuccess,
    attribute,
    label,
  });
}
export function fetchInitialDebtCount({
  filters: { ...filters },
  attribute = {},
}) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/sales/invoices/initial-debts/count?${query}`,
    onSuccess: setInitialDebteCount,
    attribute,
    label: 'setInitialDebtCount',
  });
}
export const createInitialDebt = (
  data,
  successCallback,
  onFailureCallback
) =>
  apiAction({
    url: '/sales/invoices/initial-debts',
    method: 'POST',
    data,
    onSuccess: data => dispatch => {
      dispatch(successCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    showErrorToast: false,
    label: 'createProductConfiguration',
  });

  export function deleteIninitialDebts(props = {}) {
    const { id, onSuccess, onFailure, label = 'deleteIninitialDebts' } = props;
    return apiAction({
        label,
        method: 'DELETE',
        url: `/sales/invoices/initial-debts/${id}`,
        showErrorToast: false,
        onSuccess: data => dispatch => {
            if (onSuccess) dispatch(onSuccess(data));
        },
        onFailure: error => dispatch => {
            if (onFailure) dispatch(onFailure(error));
        },
    });
}