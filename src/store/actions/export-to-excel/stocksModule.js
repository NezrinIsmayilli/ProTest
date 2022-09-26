import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setAllStocks = createAction('setAllProducts');
export const setAllProducts = createAction('setAllProducts');
export const setAllStockStatisc = createAction('setAllProducts');

export function fetchAllProducts({ filters, onSuccessCallback }) {
  let query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/products?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setAllProducts(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'all-products',
  });
}

export function fetchAllStocks({ filters, onSuccessCallback }) {
  let query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/stocks?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setAllStocks(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'all-stocks',
  });
}

export function fetchAllStockStatics({ attribute, filters,onSuccessCallback } = {}) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);

  return apiAction({
    url: `/sales/stocks/statistic?${query}`,
    onSuccess:data => dispatch => {
      dispatch(setAllStockStatisc(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    attribute,
    label: 'all-stockStatistic',
  });
};

export function fetchAllSalesInvoiceList({
  filters: { ...filters },
  attribute = {},
  onSuccessCallback,
  onSuccess,
  label = 'AllSalesInvoiceList',
}) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/sales/invoices?${query}`,
    onSuccess:data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    attribute,
    label,
  });
}