import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setOperationsList = createAction('setOperationsList');
export const setTransactionsCount = createAction('setTransactionsCount');
export const setPaidSalaries = createAction('setPaidSalaries');
export const resetOperationsList = createAction('resetOperationsList');
export const setWorkerCurrentBalance = createAction('setWorkerCurrentBalance');
export const setContactInfo = createAction('setContactInfo');
export const setTransactionCatalog = createAction('setTransactionCatalog');
export const setReportOfEmployee = createAction('setReportOfEmployee');
export const setExportOperations = createAction('setExportOperations');
export const setTransactionAction = createAction('setTransactionAction');
export const deleteTransactionAction = createAction('deleteTransactionAction');
export const setExpenseCatalogs = createAction('setExpenseCatalogs');

export const transactionsFilterHandle = createAction(
  'transactionsFilterHandle'
);
export const setCashboxInvoiceTransactionInfo = createAction(
  'setCashboxInvoiceTransactionInfo'
);
export const setExpenseTransactionInfo = createAction(
  'setExpenseTransactionInfo'
);
export const setSalaryPaymentTransactionInfo = createAction(
  'setSalaryPaymentTransactionInfo'
);

export const setAccountBalance = createAction('setAccountBalance');
export const setOperationsListExport = createAction('setOperationsListExport');

export const setInfoCardData = createAction('setInfoCardData');

export const resetTransactionInfo = createAction('resetTransactionInfo');

export function fetchReportOfEmployee(id, callBack = setReportOfEmployee) {
  return apiAction({
    url: `/hrm/report/payroll/${id}`,
    onSuccess: callBack,
    label: 'reportOfEmployee',
    attribute: id,
  });
}

export function fetchSalaryPaymentEmployees(props = {}) {
  const {
    filters = {},
    label = 'fetchSalaryPaymentEmployees',
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/transactions/salary-payment/employees?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}

export function fetchEmployeeBalance(props) {
  const { id, filters = {}, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/hrm/report/payroll/${id}?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'reportOfEmployee',
    attribute: id,
  });
}

export function fetchCashboxInvoiceTransactionInfo(
  transactionId,
  successCallback = () => {}
) {
  return apiAction({
    url: `/transaction/cashbox/invoices/${transactionId}`,
    onSuccess: params => dispatch => {
      dispatch(setCashboxInvoiceTransactionInfo(params));
      successCallback(params.data);
    },
    label: 'financeOperations',
  });
}

// GET - transaction catalog
export function fetchTransactionCatalog({ attribute } = {}) {
  return apiAction({
    url: '/transaction/catalog',
    onSuccess: setTransactionCatalog,
    attribute,
    label: 'transactionCatalogs',
  });
}

export function fetchAccountBalance(props) {
  const {
    id,
    filters,
    callBack = setAccountBalance,
    label = 'accountBalance',
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transaction/cashbox/balance/${id}?${query}`,
    onSuccess: callBack,
    label,
    attribute: id,
  });
}

export function fetchMultipleAccountBalance(props) {
  const {
    filters,
    onSuccessCallback,
    onFailureCallback,
    label = 'accountBalance',
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transaction/cashbox/balance?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}

export function fetchTenantBalance(id, filters, callBack = () => {}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transactions/employee-payment/balance/${id}?${query}`,
    onSuccess: callBack,
    label: 'tenantBalance',
  });
}
export function fetchCreationBalance(id, filters, callBack = () => {}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transactions/balance-creation-payment/balance/${id}?${query}`,
    onSuccess: callBack,
    label: 'creationBalance',
  });
}

export function fetchWorkerCurrentBalance(employeeId) {
  return apiAction({
    url: `/transactions/salary-payment/employee-balance/${employeeId}`,
    onSuccess: setWorkerCurrentBalance,
    label: 'fetchWorkerCurrentBalance',
  });
}

export function fetchExpenseTransactionInfo(transactionId, callback) {
  return apiAction({
    url: `/transactions/expense/${transactionId}`,
    onSuccess: setExpenseTransactionInfo,
    onFailure: () => callback,
    label: 'financeOperations',
  });
}

export function fetchSalaryPaymentTransactionInfo(transactionId, callback) {
  return apiAction({
    url: `/transactions/salary-payment/${transactionId}`,
    onSuccess: setSalaryPaymentTransactionInfo,
    onFailure: () => callback,
    label: 'financeOperations',
  });
}

// export function fetchOperationsList({
//   filters: { tab, ...filters },
//   attribute = {},
// }) {
//   const query = filterQueryResolver(filters);
//
//   return apiAction({
//     url: `/transaction/cashbox/transaction/${tab}?${query}`,
//     onSuccess: setOperationsList,
//     attribute,
//     label: 'financeOperations',
//   });
// }
export function fetchOperationsList({
  filters: { ...filters },
  attribute = {},
  onSuccessCallback,
  setOperations = true,
  label = 'financeOperations',
}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transactions?${query}`,
    onSuccess: data => dispatch => {
      if (setOperations) dispatch(setOperationsList(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    attribute,
    label,
  });
}
export function fetchFinanceOperation({
  filters: { ...filters },
  onSuccessCallback,
}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transactions?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'fetchFinanceOperation',
  });
}
export function fetchTransactionsCount({
  filters: { ...filters },
  attribute = {},
}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transactions/count?${query}`,
    onSuccess: setTransactionsCount,
    attribute,
    label: 'transactionsCount',
  });
}
export function exportOperationsList(
  { filters: { ...filters }, attribute = {} },
  callBack = setOperationsListExport
) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/transactions/export?${query}`,
    onSuccess: callBack,
    attribute,
    label: 'operationListExport',
  });
}

export function fetchContactInfo(contactId, type, transactionId) {
  let query = '';
  if (transactionId) {
    query += `?except_cashbox_transaction_id=${transactionId}`;
  }

  return apiAction({
    url: `/transaction/cashbox/invoices/contactInfo/${contactId}/${type}${query}`,
    onSuccess: setContactInfo,
    label: 'financeOperations',
  });
}

/**
 * Edit cashbox invoice transaction
 * @type {Object} parameters - tabIndex, data
 * @property {number} tabIndex - tabIndex
 * @property {Array.<{
 * type: Number,
 * contact: Number,
 * cashbox: Number,
 * amount: Number,
 * currency: Number,
 * description: String,
 * invoices_ul: Object[]
 * }>} - data object (CashboxTransaction)
 * @property {number} transactionId - TransactionId
 */

export function editCashboxInvoiceTransaction(
  { tabIndex, data, transactionId } = {},
  callback
) {
  return apiAction({
    url: `/transaction/cashbox/invoices/${transactionId}`,
    method: 'PUT',
    onSuccess: callback,
    attribute: { action: 'edited', tab: tabIndex },
    data,
    label: 'action',
  });
}

/**
 * Create cashbox invoice transaction
 * @type {Object} parameters - tabIndex, data
 * @property {number} tabIndex - tabIndex
 * @property {Array.<{
 * type: Number,
 * contact: Number,
 * cashbox: Number,
 * amount: Number,
 * currency: Number,
 * description: String,
 * invoices_ul: Object[],
 * }>} - data object (CashboxTransaction)
 */

export function createCashboxInvoiceTransaction(
  { tabIndex, data } = {},
  callback
) {
  return apiAction({
    url: '/transaction/cashbox/invoices',
    method: 'POST',
    onSuccess: callback,
    attribute: { action: 'added', tab: tabIndex },
    data,
    label: 'action',
  });
}

export function createMoneyTransfer(data, tabIndex, callback) {
  return apiAction({
    url: '/transactions/moneyTransfer/',
    method: 'POST',
    onSuccess: callback,
    data,
    attribute: { action: 'added', tab: tabIndex },
    label: 'action',
  });
}

export function editMoneyTransfer(data, tabIndex, id, callback) {
  return apiAction({
    url: `/transactions/moneyTransfer/${id}`,
    method: 'PUT',
    onSuccess: callback,
    data,
    attribute: { action: 'edited', tab: tabIndex },
    label: 'action',
  });
}

export function deleteTransaction(id, deletionReason, callBack, onFailureCallback) {
  return apiAction({
    url: `/transaction/cashbox/${id}?deletionReason=${deletionReason}`,
    method: 'DELETE',
    // data,
    onSuccess: callBack,
    onFailure: onFailureCallback,
    showErrorToast: false,
    showToast: true,
    label: 'deleteFinanceOperations',
  });
}

export function getTransaction(id) {
  return apiAction({
    url: `/transaction/cashbox/${id}`,
    onSuccess: setTransactionAction,
    attribute: id,
    label: 'financeOperations',
  });
}

export function getPaidSalaries(id, filters) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/transactions/salary-payment/employee-unpaid-or-partially-paid-salaries/${id}?${query}`,
    onSuccess: setPaidSalaries,
    attribute: id,
    label: 'financeOperations',
  });
}

export function createExpenseTransaction(data, callback) {
  return apiAction({
    url: '/transactions/expense',
    method: 'POST',
    onSuccess: callback,
    data,
    label: 'action',
  });
}

export function editExpenseTransaction(data, id, callback) {
  return apiAction({
    url: `/transactions/expense/${id}`,
    method: 'PUT',
    onSuccess: callback,
    data,
    label: 'action',
  });
}

export function createSalaryPaymentTransaction(data, callback) {
  return apiAction({
    url: '/transactions/salary-payment',
    method: 'POST',
    onSuccess: callback,
    data,
    label: 'action',
  });
}

export function editSalaryPaymentTransaction(data, id, callback) {
  return apiAction({
    url: `/transactions/salary-payment/${id}`,
    method: 'PUT',
    onSuccess: callback,
    data,
    label: 'action',
  });
}

export function fetchReportCashFlow({
  filters: { tab, ...filters },
  attribute = {},
}) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/transaction/report/cash-flow/${tab}?${query}`,
    onSuccess: setOperationsList,
    attribute,
    label: 'financeOperations',
  });
}

export function exportOperations(callBack = setExportOperations) {
  return apiAction({
    url: '/transaction/export',
    onSuccess: callBack,
    label: 'exportOperations',
  });
}
