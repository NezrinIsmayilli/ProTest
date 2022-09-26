import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setProductsFromCatalog = createAction('setProductsFromCatalog');
export const setProductsByName = createAction('setProductsByName');
export const setBarcodes = createAction('setBarcodes');
export const clearProductsByName = createAction('clearProductsByName');
export const clearProductsFromCatalog = createAction(
  'clearProductsFromCatalog'
);

// const invoiceTypes = {
//   draft: 'draft',
//   purchase: 'purchase',
//   sales: 'sales',
//   returnFromCustomer: 'returnFromCustomer',
//   returnToSupplier: 'returnToSupplier',
//   transfer: 'transfer',
//   writingOff: 'remove',
// };

const baseUrl = '/sales/invoices';

/*  
            ***************************
            FETCH PRODUCTS FROM CATALOG 
            ***************************
*/

// Purchase
export function fetchPurchaseProductsFromCatalog(props) {
  const {
    label = 'fetchPurchaseProductsFromCatalog',
    catalogId,
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/purchase/catalogs/${catalogId}/extended/products?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsFromCatalog(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

// Sales
export function fetchSalesProductsFromCatalog(props) {
  const {
    label = 'fetchSalesProductsFromCatalog',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
    setState = true,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/sales/products/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      if (setState) dispatch(setProductsFromCatalog(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

// Return from customer
export function fetchReturnFromCustomerProductsFromCatalog(props) {
  const {
    label = 'fetchReturnFromCustomerProductsFromCatalog',
    filters,
    clientId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/returnFromCustomer/products/${clientId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsFromCatalog(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

// Return to supplier
export function fetchReturnToSupplierProductsFromCatalog(props) {
  const {
    label = 'fetchReturnToSupplierProductsFromCatalog',
    filters,
    stockId,
    supplierId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/returnToSupplier/products/${stockId}/${supplierId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsFromCatalog(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

// Transfer
export function fetchTransferProductsFromCatalog(props) {
  const {
    label = 'fetchTransferProductsFromCatalog',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/sales/products/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsFromCatalog(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

// Writing off
export function fetchWritingOffProductsFromCatalog(props) {
  const {
    label = 'fetchWritingOffProductsFromCatalog',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/sales/products/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsFromCatalog(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

/*  
            ***************************
            FETCH PRODUCTS BY NAME
            ***************************
*/

// Purchase
export function fetchPurchaseProductsByName(props) {
  const {
    label = 'fetchPurchaseProductsByName',
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/purchase/search/products?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsByName(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchPurchaseBarcodesByName(props) {
  const {
    label = 'fetchPurchaseBarcodesByName',
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/invoices/purchase/search/barcode?${query}`,
    onSuccess: data => dispatch => {
      // dispatch(setBarcodes(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}
// Sales
export function fetchSalesProductsByName(props) {
  const {
    label = 'fetchSalesProductsByName',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/sales/search/products/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      if (data.data.length > 0) {
        if (onSuccessCallback) onSuccessCallback(data);
      } else {
        dispatch(setProductsByName(data));
      }
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchSalesBarcodesByName(props) {
  const {
    label = 'fetchSalesBarcodesByName',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/invoices/sales/search/barcode/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}
// Return from customer
export function fetchReturnFromCustomerProductsByName(props) {
  const {
    label = 'fetchReturnFromCustomerProductsByName',
    filters,
    clientId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/returnFromCustomer/search/products/${clientId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsByName(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchReturnFromCustomerBarcodesByName(props) {
  const {
    label = 'fetchReturnFromCustomerBarcodesByName',
    filters,
    clientId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${baseUrl}/returnFromCustomer/search/barcode/${clientId}?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}
// Return to supplier
export function fetchReturnToSupplierProductsByName(props) {
  const {
    label = 'fetchReturnToSupplierProductsByName',
    filters,
    stockId,
    supplierId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/returnToSupplier/search/products/${stockId}/${supplierId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsByName(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchReturnToSupplierBarcodesByName(props) {
  const {
    label = 'fetchReturnToSupplierBarcodesByName',
    filters,
    stockId,
    supplierId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${baseUrl}/returnToSupplier/search/barcode/${stockId}/${supplierId}?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}

// Transfer
export function fetchTransferProductsByName(props) {
  const {
    label = 'fetchTransferProductsByName',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/sales/search/products/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsByName(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchTransferBarcodesByName(props) {
  const {
    label = 'fetchTransferBarcodesByName',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${baseUrl}/sales/search/barcode/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}
// Writing off
export function fetchWritingOffProductsByName(props) {
  const {
    label = 'fetchWritingOffProductsByName',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label,
    url: `${baseUrl}/sales/search/products/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setProductsByName(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchWritingOffBarcodesByName(props) {
  const {
    label = 'fetchWritingOffBarcodesByName',
    filters,
    stockId,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${baseUrl}/sales/search/barcode/${stockId}?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}
