import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';
import { getPurchasedItemsCount } from '../operations/purchased-items';
import { getSoldItemsCount } from '../operations/sold-items';

export const setAllInvoices = createAction('setAllInvoices');
export const setAllSoldItems = createAction('setAllSoldItems');
export const setAllPurchasedItems = createAction('setAllSoldItems');
export const setAllGoodTurnOvers = createAction('setAllGoodTurnOvers');

export function fetchAllSalesIvoices({ filters, onSuccessCallback }) {
  let query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/invoices?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setAllInvoices(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'all-invoices',
  });
}

export function fetchAllSoldItems({filters ,onSuccessCallback }) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/sold-items?${query}`;
  return apiAction({
    url,
    label: 'all-soldItems',
    onSuccess: data => dispatch => {
      dispatch(setAllSoldItems(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
      dispatch(getSoldItemsCount(query));
     
    },
  });
}

export function fetchAllPurchasedItems({ filters: { ...filters },onSuccessCallback }) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/purchased-items?${query}`;
  return apiAction({
    url,
    label: 'all-purchasedItems',
    onSuccess: data => async dispatch => {
      dispatch(setAllPurchasedItems(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
      dispatch(getPurchasedItemsCount(query));
    },
    attribute: {},
  });
}

export function fetchAllGoodsTurnovers({ filters: { ...filters },onSuccessCallback }) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/goods-turnover?${query}`;
  return apiAction({
    url,
    label: 'all-goods-turnovers',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
      dispatch(setAllGoodTurnOvers(data));
    },
    attribute: {},
  });
}

export function fetchAllFilteredContracts({filters, onSuccessCallback}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/contracts?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'fetchAllFilteredContracts',
  });
}

export function fetchAllSalesInvoiceList({
  filters: { ...filters },
  attribute = {},
  onSuccessCallback,
  label = 'setSalesInvoiceList',
}) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/sales/invoices?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    attribute,
    label,
  });
}