import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setInvoicesByProduct = createAction('setInvoicesByProduct');
export const clearInvoicesByProduct = createAction('clearInvoicesByProduct');

/*  
            ***************************
            FETCH PRODUCTS INVOICES
            ***************************
*/

// Sales
export function fetchSalesInvoicesByProduct(props) {
  const {
    label = 'fetchSalesInvoicesByProduct',
    productId,
    stockId,
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/sales/invoices/${stockId}/${productId}?${query}`;
  return apiAction({
    url,
    label,
    onSuccess: data => dispatch => {
      dispatch(setInvoicesByProduct(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

// Return from customer
export function fetchReturnFromCustomerInvoicesByProduct(props) {
  const {
    label = 'fetchReturnFromCustomerInvoicesByProduct',
    clientId,
    productId,
    stockId,
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/returnFromCustomer/invoices/${stockId}/${productId}/${clientId}?${query}`;
  return apiAction({
    url,
    label,
    onSuccess: data => dispatch => {
      dispatch(setInvoicesByProduct(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

// Return to supplier
export function fetchReturnToSupplierInvoicesByProduct(props) {
  const {
    label = 'fetchReturnToSupplierInvoicesByProduct',
    supplierId,
    productId,
    stockId,
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/returnToSupplier/invoices/${stockId}/${productId}/${supplierId}?${query}`;
  return apiAction({
    url,
    label,
    onSuccess: data => dispatch => {
      dispatch(setInvoicesByProduct(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
// Transfer
export function fetchTransferInvoicesByProduct(props) {
  const {
    label = 'fetchTransferInvoicesByProduct',
    productId,
    stockId,
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/sales/invoices/${stockId}/${productId}?${query}`;
  return apiAction({
    url,
    label,
    onSuccess: data => dispatch => {
      dispatch(setInvoicesByProduct(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

// WritingOff
export function fetchWritingOffInvoicesByProduct(props) {
  const {
    label = 'fetchWritingOffInvoicesByProduct',
    productId,
    stockId,
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/sales/invoices/${stockId}/${productId}?${query}`;
  return apiAction({
    url,
    label,
    onSuccess: data => dispatch => {
      dispatch(setInvoicesByProduct(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
