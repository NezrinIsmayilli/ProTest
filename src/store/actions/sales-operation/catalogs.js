import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setSearchedCatalogs = createAction('setSearchedCatalogs');
export const clearSearchedCatalogs = createAction('clearSearchedCatalogs');

export const fetchPurchaseCatalogs = props => {
  const {
    filters = {},
    label = 'fetchPurchaseCatalogs',
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `/sales/invoices/purchase/catalogs?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setSearchedCatalogs(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};
export const fetchSalesCatalogs = props => {
  const {
    stockId,
    filters = {},
    label = 'fetchSalesCatalogs',
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

export const fetchReturnToSupplierCatalogs = props => {
  const {
    stockId,
    supplierId,
    filters = {},
    label = 'fetchReturnToSupplierCatalogs',
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `/sales/invoices/returnToSupplier/catalogs/${stockId}/${supplierId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setSearchedCatalogs(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};
export const fetchReturnFromCustomerCatalogs = props => {
  const {
    clientId,
    filters = {},
    label = 'fetchReturnFromCustomerCatalogs',
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `/sales/invoices/returnFromCustomer/catalogs/${clientId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setSearchedCatalogs(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};

export const fetchTransferCatalogs = props => {
  const {
    stockId,
    filters = {},
    label = 'fetchTransferCatalogs',
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
export const fetchWritingOffCatalogs = props => {
  const {
    stockId,
    filters = {},
    label = 'fetchWritingOffCatalogs',
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
