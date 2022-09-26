import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setSearchedCatalogs = createAction('setSearchedCatalogs');
export const clearSearchedCatalogs = createAction('clearSearchedCatalogs');
export const setProductsFromCatalog = createAction('setProductsFromCatalog');
export const setProductsByName = createAction('setProductsByName');
export const clearProductsByName = createAction('clearProductsByName');
export const clearProductsFromCatalog = createAction(
  'clearProductsFromCatalog'
);
export const setInvoicesByProduct = createAction('setInvoicesByProduct');
export const clearInvoicesByProduct = createAction('clearInvoicesByProduct');

export function fetchBronProductsFromCatalog(props) {
  const {
    label = 'fetchBronProductsFromCatalog',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
    setState = true,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `/sales/invoices/sales/products/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      if (setState) dispatch(setProductsFromCatalog(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export const fetchBronCatalogs = props => {
  const {
    stockId,
    filters = {},
    label = 'fetchBronCatalogs',
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `/sales/invoices/sales/catalogs/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setSearchedCatalogs(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};
export function fetchBronProductsByName(props) {
  const {
    label = 'fetchBronProductsByName',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `/sales/invoices/sales/search/products/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsByName(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchBronProductsByBarcode(props) {
  const {
    label = 'fetchBronProductsByBarcode',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `/sales/invoices/sales/search/barcode/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchBronInvoicesByProduct(props) {
  const {
    label = 'fetchBronInvoicesByProduct',
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
// Create invoice
export const createInvoice = props => {
  const {
    data,
    onSuccessCallback,
    onFailureCallback,
    label = 'createInvoiceOperation',
  } = props;
  return apiAction({
    data,
    label,
    url: `/sales/invoices/bron`,
    method: 'POST',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};

export const editInvoice = props => {
  const {
    id,
    data,
    onSuccessCallback,
    onFailureCallback,
    label = 'editInvoiceOperation',
  } = props;
  return apiAction({
    data,
    label,
    method: 'PUT',
    url: `/sales/invoices/bron/${id}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};
