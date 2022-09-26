import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { setCatalogs } from 'store/actions/catalog';

export const setInvoiceList = createAction('setInvoiceList');
export const setinvoiceListByContractId = createAction(
  'setinvoiceListByContractId'
);
export const setInvoiceInfo = createAction('setInvoiceInfo');
export const resetInvoiceInfo = createAction('resetInvoiceInfo');
export const setProducts = createAction('setProducts');
export const setError = createAction('setError');
export const setBarcodes = createAction('setBarcodes');
export const setProductSerialNumbers = createAction('setProductSerialNumbers');
export const setProductInvoices = createAction('setProductInvoices');
export const resetProductSerialNumbers = createAction(
  'resetProductSerialNumbers'
);

export const resetAllSalesData = createAction('resetAllSalesData');

export const searchHandle = createAction('searchHandle');

export function createDraft(data, callback) {
  return apiAction({
    url: '/sales/invoices/draft',
    onSuccess: callback,
    onFailure: error => dispatch => {
      dispatch(setError({ error }));
    },
    method: 'POST',
    data,
    label: 'action',
  });
}

// invoice list by invoice type (alish, satish ..)
export function fetchInvoiceList({ attribute } = {}) {
  return apiAction({
    url: `/sales/invoices/invoiceType/${attribute.invoiceType}?${attribute.query}`,
    onSuccess: setInvoiceList,
    label: 'invoiceList',
    attribute,
  });
}

// invoice list by contract id
export function fetchInvoiceListByContractId(contractId = '') {
  return apiAction({
    url: `/sales/invoices/contract/${contractId}`,
    onSuccess: setinvoiceListByContractId,
    label: 'invoiceListByContractId',
    attribute: contractId,
  });
}

export function fetchInvoiceInfo(id) {
  return apiAction({
    url: `/sales/invoices/invoice/${id}`,
    onSuccess: setInvoiceInfo,
    label: 'operationsInfo',
  });
}

export function deleteInvoice({ id, attribute, onSuccess, onFailure }) {
  return apiAction({
    url: `/sales/invoices/${id}`,
    method: 'DELETE',
    onSuccess,
    onFailure,
    showToast: true,
    showErrorToast: false,
    attribute,
    label: 'action',
  });
}

// purchase operations
export function createPurchase(data, callback, onFailure = () => {}) {
  return apiAction({
    url: '/sales/invoices/purchase',
    onSuccess: callback,
    method: 'POST',
    onFailure,
    data,
    label: 'action',
  });
}

export function editPurchase(data, id, callback, onFailure = () => {}) {
  return apiAction({
    url: `/sales/invoices/purchase/${id}`,
    onSuccess: callback,
    onFailure,
    method: 'PUT',
    data,
    label: 'action',
  });
}

// Catalogs
export function fetchPurchaseCatalogs() {
  return apiAction({
    url: `/sales/invoices/purchase/catalogs`,
    onSuccess: setCatalogs,
    label: 'catalogs',
  });
}

export function fetchSalesCatalogs(stockId, onSuccessCallback = () => {}) {
  return apiAction({
    url: `/sales/invoices/sales/catalogs/${stockId}`,
    onSuccess: data => dispatch => {
      dispatch(setCatalogs(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'catalogs',
  });
}

export function fetchClientCatalogs(clientId) {
  return apiAction({
    url: `/sales/invoices/returnFromCustomer/catalogs/${clientId}`,
    onSuccess: setCatalogs,
    label: 'catalogs',
  });
}

export function fetchReturnToSupplierCatalogs(
  stockId,
  supplierId,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `sales/invoices/returnToSupplier/catalogs/${stockId}/${supplierId}`,
    onSuccess: data => dispatch => {
      dispatch(setCatalogs(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'catalogs',
  });
}

export function fetchTransferCatalogs(stockId) {
  return apiAction({
    url: `/sales/invoices/transfer/catalogs/${stockId}`,
    onSuccess: setCatalogs,
    label: 'catalogs',
  });
}

export function fetchRemoveCatalogs(stockId) {
  return apiAction({
    url: `/sales/invoices/remove/catalogs/${stockId}`,
    onSuccess: setCatalogs,
    label: 'catalogs',
  });
}

// Barcode
export function fetchPurchaseBarcodesByName(
  query,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `/sales/invoices/purchase/search/barcode?q=${query}`,
    onSuccess: data => dispatch => {
      dispatch(setBarcodes(data));
      onSuccessCallback(data);
    },
    label: 'barcode',
  });
}

export function fetchSalesBarcodesSearch(
  stockId,
  query,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `/sales/invoices/sales/search/barcode/${stockId}?q=${query}`,
    onSuccess: data => dispatch => {
      dispatch(setBarcodes(data));
      onSuccessCallback(data);
    },
    label: 'barcode',
  });
}

export function fetchReturnFromCustomerBarcodeSearch(
  clientId,
  query,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `/sales/invoices/returnFromCustomer/search/barcode/${clientId}?q=${query}`,
    onSuccess: data => dispatch => {
      dispatch(setBarcodes(data));
      onSuccessCallback(data);
    },
    label: 'barcode',
  });
}

export function fetchReturnToSupplierBarcodeSearch(
  stockId,
  catalogId,
  supplierId,
  query,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `/sales/invoices/returnToSupplier/search/barcode/${stockId}/${catalogId}/${supplierId}?q=${query}`,
    onSuccess: data => dispatch => {
      dispatch(setBarcodes(data));
      onSuccessCallback(data);
    },
    label: 'barcode',
  });
}
export function fetchPurchseProducts(catalogId) {
  return apiAction({
    url: `/sales/invoices/purchase/catalogs/${catalogId}/products`,
    onSuccess: setProducts,
    label: 'products',
  });
}

export function checkDublicateSerialNumbers(data, callback) {
  return apiAction({
    url: `/sales/invoices/purchase/check/serial-number`,
    onSuccess: params => () => {
      callback(params.data);
    },
    label: 'serial',
    method: 'POST',
    data,
  });
}

//  sales operations
export function createSales(data, callback) {
  return apiAction({
    url: '/sales/invoices/sales/',
    onSuccess: callback,
    onFailure: error => dispatch => {
      dispatch(setError({ error }));
    },
    method: 'POST',
    data,
    label: 'action',
  });
}

export function editSales(data, id, callback, onFailure = () => {}) {
  return apiAction({
    url: `/sales/invoices/sales/${id}`,
    onSuccess: callback,
    onFailure,
    method: 'PUT',
    data,
    label: 'action',
  });
}

export function createCashboxInvoiceTransaction(data, callback) {
  return apiAction({
    url: '/transaction/cashbox/invoices',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure: error => dispatch => {
      dispatch(setError({ error }));
    },
    label: 'action',
  });
}

export function fetchProductsSales(
  catalogId,
  stockId,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `/sales/invoices/sales/products/${catalogId}/${stockId}`,
    onSuccess: data => dispatch => {
      dispatch(setProducts(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'products',
  });
}

// Invoices
export function fetchSalesProductsInvoices(
  productId,
  stockId,
  callback = () => {},
  invoiceId = null
) {
  const url = invoiceId
    ? `/sales/invoices/sales/invoices/${stockId}/${productId}?invoiceId=${invoiceId}`
    : `/sales/invoices/sales/invoices/${stockId}/${productId}`;
  return apiAction({
    url: url,
    onSuccess: data => dispatch => {
      dispatch(setProductInvoices(data));
      callback();
    },
    label: 'invoices',
  });
}

export function fetchReturnFromProductsInvoices(
  productId,
  stockId,
  clientId,
  callback = () => {},
  id = null
) {
  const url = id
    ? `/sales/invoices/returnFromCustomer/invoices/${stockId}/${productId}/${clientId}?invoiceId=${id}`
    : `/sales/invoices/returnFromCustomer/invoices/${stockId}/${productId}/${clientId}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setProductInvoices(data));
      callback();
    },
    label: 'invoices',
  });
}
export function fetchReturnToProductsInvoices(
  productId,
  stockId,
  supplierId,
  callback = () => {},
  id
) {
  const url = id
    ? `/sales/invoices/returnToSupplier/invoices/${stockId}/${productId}/${supplierId}?invoiceId=${id}`
    : `/sales/invoices/returnToSupplier/invoices/${stockId}/${productId}/${supplierId}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setProductInvoices(data));
      callback();
    },
    label: 'invoices',
  });
}

export function fetchProductsSalesByName(stockId, query) {
  return apiAction({
    url: `/sales/invoices/sales/search/products/${stockId}?q=${query}`,
    onSuccess: setProducts,
    label: 'invoices',
  });
}

export function fetchSerialNumbersSales(stockId, productId) {
  return apiAction({
    url: `/sales/invoices/sales/products/${stockId}/${productId}/serialNumbers`,
    onSuccess: setProductSerialNumbers,
    label: 'serial',
    attribute: productId,
  });
}

// returnFromCustomer operations
export function createReturnFromCustomer(data, callback) {
  return apiAction({
    url: '/sales/invoices/returnFromCustomer',
    onSuccess: callback,
    method: 'POST',
    data,
    label: 'action',
  });
}

export function editReturnFromCustomer(
  data,
  id,
  callback,
  onFailure = () => {}
) {
  return apiAction({
    url: `/sales/invoices/returnFromCustomer/${id}`,
    onSuccess: callback,
    onFailure,
    method: 'PUT',
    data,
    label: 'action',
  });
}

export function fetchReturnFromCustomerCatalogs(
  clientId,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `/sales/invoices/returnFromCustomer/catalogs/${clientId}`,
    onSuccess: data => dispatch => {
      dispatch(setCatalogs(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'catalogs',
  });
}

export function fetchProductsReturnFromCustomer(
  catalogId,
  clientId,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `/sales/invoices/returnFromCustomer/products/${catalogId}/${clientId}`,
    onSuccess: data => dispatch => {
      dispatch(setProducts(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'products',
  });
}

export function fetchSerialNumbersReturnFromCustomer(productId, clientId) {
  return apiAction({
    url: `/sales/invoices/returnFromCustomer/products/${productId}/${clientId}/serialNumbers`,
    onSuccess: setProductSerialNumbers,
    label: 'serial',
    attribute: productId,
  });
}

// returnToSupplier operations
export function createReturnToSupplier(data, callback) {
  return apiAction({
    url: '/sales/invoices/returnToSupplier',
    onSuccess: callback,
    method: 'POST',
    data,
    label: 'action',
  });
}

export function editReturnToSupplier(data, id, callback, onFailure = () => {}) {
  return apiAction({
    url: `/sales/invoices/returnToSupplier/${id}`,
    onSuccess: callback,
    method: 'PUT',
    onFailure,
    data,
    label: 'action',
  });
}

export function fetchProductsReturnToSupplier(
  stockId,
  catalogId,
  supplierId,
  onSuccessCallback = () => {}
) {
  return apiAction({
    url: `sales/invoices/returnToSupplier/products/${stockId}/${catalogId}/${supplierId}`,
    onSuccess: data => dispatch => {
      dispatch(setProducts(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'products',
  });
}

export function fetchSerialNumbersReturnToSupplier(
  stockId,
  productId,
  supplierId
) {
  return apiAction({
    url: `/sales/invoices/returnToSupplier/products/${stockId}/${productId}/${supplierId}/serialNumbers`,
    onSuccess: setProductSerialNumbers,
    label: 'serial',
    attribute: productId,
  });
}

// transfer operations
export function createTransferInvoice(data, callback) {
  return apiAction({
    url: '/sales/invoices/transfer',
    onSuccess: callback,
    method: 'POST',
    data,
    label: 'action',
  });
}

export function editTransferInvoice(data, id, callback, onFailure = () => {}) {
  return apiAction({
    url: `/sales/invoices/transfer/${id}`,
    onSuccess: callback,
    method: 'PUT',
    data,
    label: 'action',
    onFailure,
  });
}

export function fetchProductsTransferInvoice(catalogId, stockId) {
  return apiAction({
    url: `sales/invoices/transfer/products/${catalogId}/${stockId}`,
    onSuccess: setProducts,
    label: 'products',
  });
}

export function fetchSerialNumbersTransfer(stockId, productId) {
  return apiAction({
    url: `/sales/invoices/transfer/products/${stockId}/${productId}/serialNumbers`,
    onSuccess: setProductSerialNumbers,
    label: 'serial',
    attribute: productId,
  });
}

// remove invoice
export function createRemoveInvoice(data, callback) {
  return apiAction({
    url: '/sales/invoices/remove/',
    onSuccess: callback,
    method: 'POST',
    data,
    label: 'action',
  });
}

export function editRemoveInvoice(data, id, callback, onFailure = () => {}) {
  return apiAction({
    url: `/sales/invoices/remove/${id}`,
    onSuccess: callback,
    onFailure,
    method: 'PUT',
    data,
    label: 'action',
  });
}

export const getPriceTypes = (id, currency, callback) => {
  return apiAction({
    url: `/sales/invoices/sales/prices/${id}?currency=${currency}`,
    onSuccess: callback,
    label: 'products',
  });
};
