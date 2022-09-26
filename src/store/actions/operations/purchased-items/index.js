import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setPurchasedItems = createAction('setPurchasedItems');
export const setPurchasedItemsCount = createAction('setPurchasedItemsCount');
export const setPurchasedInvoices = createAction('setPurchasedInvoices');
export const setSelectedPurchasedItemDetails = createAction(
  'setSelectedPurchasedItemDetails'
);

export function fetchPurchasedItems({ filters: { ...filters } }) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/purchased-items?${query}`;
  return apiAction({
    url,
    label: 'purchased-items',
    onSuccess: data => async dispatch => {
      dispatch(setPurchasedItems(data));
      dispatch(getPurchasedItemsCount(query));
    },
    attribute: {},
  });
}

export function getPurchasedItemsCount(query) {
  const url = `/sales/invoices/purchased-items-count?${query}`;
  return apiAction({
    url,
    label: 'purchased-items',
    onSuccess: data => dispatch => {
      dispatch(setPurchasedItemsCount(data));
    },
    attribute: {},
  });
}

export function fetchPurchasedInvoices(filters, onSuccessCallback) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices?${query}`;
  return apiAction({
    url,
    label: 'purchased-items',
    onSuccess: data => dispatch => {
      if (onSuccessCallback !== undefined) {
        onSuccessCallback(data);
      } else {
          dispatch(setPurchasedInvoices(data));
      }
    },
    attribute: {},
  });
}

export function fetchPurchasedItemDetails(invoiceId, productId, filters) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/purchased-items/${invoiceId}/${productId}?${query}`;
  return apiAction({
    url,
    label: 'purchased-items',
    onSuccess: data => dispatch => {
      dispatch(setSelectedPurchasedItemDetails(data));
    },
    attribute: {},
  });
}
