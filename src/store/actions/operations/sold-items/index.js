import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setSoldItems = createAction('setSoldItems');
export const setSoldItemsCount = createAction('setSoldItemsCount');
export const setSalesInvoices = createAction('setSalesInvoices');
export const setSelectedSoldItemDetails = createAction(
  'setSelectedSoldItemDetails'
);

export function fetchSoldItems({ filters: { ...filters } }) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/sold-items?${query}`;
  return apiAction({
    url,
    label: 'sold-items',
    onSuccess: data => dispatch => {
      dispatch(setSoldItems(data));
      dispatch(getSoldItemsCount(query));
    },
    attribute: {},
  });
}

export function getSoldItemsCount(query) {
  const url = `/sales/invoices/sold-items-count?${query}`;
  return apiAction({
    url,
    label: 'sold-items',
    onSuccess: data => dispatch => {
      dispatch(setSoldItemsCount(data));
    },
    attribute: {},
  });
}

export function fetchSalesInvoices(filters, onSuccessCallback) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices?${query}`;
  return apiAction({
    url,
    label: 'sold-items',
    onSuccess: data => dispatch => {
      if (onSuccessCallback !== undefined) {
        onSuccessCallback(data);
      } else {
          dispatch(setSalesInvoices(data));
      }
    },
    attribute: {},
  });
}
export function fetchSoldItemDetails(invoiceId, productId, filters) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/sold-items/${invoiceId}/${productId}?${query}`;
  return apiAction({
    url,
    label: 'sold-items',
    onSuccess: data => dispatch => {
      dispatch(setSelectedSoldItemDetails(data));
    },
    attribute: {},
  });
}
