import { apiAction } from 'store/actions';

export const createBalanceTransaction = (data, callback) =>
  apiAction({
    url: '/transactions/balance-creation',
    method: 'POST',
    data,
    onSuccess: callback,
    label: 'BalanceTransaction',
  });

export function editBalanceTransaction(id, data, callback) {
  return apiAction({
    url: `/transactions/balance-creation/${id}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    label: 'BalanceTransaction',
  });
}

export const createOperationInvoice = (
  data,
  callback,
  onFailure,
  label = 'createInvoicePayment'
) =>
  apiAction({
    url: '/transaction/invoices',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label,
  });

  export const editOperationInvoice = (id, data, callback, onFailure, label = 'createInvoicePayment') =>
    apiAction({
      url: `/transaction/invoices/${id}`,
      method: 'PUT',
      data,
      onSuccess: callback,
      onFailure,
      showErrorToast: false,
      label,
  });

export const createOperationPayment = (data, callback, onFailure) =>
  apiAction({
    url: '/transactions/payment',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    label: 'action',
  });
export const createExpensePayment = (data, callback, onFailure) =>
  apiAction({
    url: '/transactions/multiple-payment',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'createExpensePayment',
  });

  export const createMultipleExpensePayment = (data, callback, onFailure) =>
  apiAction({
    url: '/transactions/multiple-cashbox-payment',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'createExpensePayment',
  });

  export function deleteExpensesByInvoiceId(props = {}) {
    const {
        id,
        onSuccessCallback,
        onFailureCallback,
        label = 'deleteExpensesByInvoiceId',
    } = props;
    return apiAction({
        label,
        method: 'DELETE',
        url: `sales/invoices/expenses/${id}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
    });
}

  export const createImportExpensePayment = (data, callback, onFailure) =>
  apiAction({
    url: '/sales/invoices/expenses',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'createImportExpensePayment',
  });

  export const getImportExpensePayment = (id, callback, onFailure) =>
  apiAction({
    url: `/sales/invoices/expenses/${id}`,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'getImportExpensePayment',
  });

  export const editExpensePayment = (id, data, callback, onFailure) =>
    apiAction({
      url: `/transactions/multiple-payment/${id}`,
      method: 'PUT',
      data,
      onSuccess: callback,
      onFailure,
      showErrorToast: false,
      label: 'createExpensePayment',
  });

export const createAdvancePayment = (
  data,
  callback = () => {},
  onFailure = () => {}
) =>
  apiAction({
    url: '/transactions/advance-payment',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'createAdvancePayment',
  });

  export const editAdvancePayment = (
    editId,
    data,
    callback = () => {},
    onFailure = () => {}
  ) =>
    apiAction({
      url: `/transactions/advance-payment/${editId}`,
      method: 'PUT',
      data,
      onSuccess: callback,
      onFailure,
      showErrorToast: false,
      label: 'createAdvancePayment',
    });
export const createTenantPayment = (
  data,
  callback = () => {},
  onFailure = () => {}
) =>
  apiAction({
    url: '/transactions/employee-payment',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'createTenantPayment',
  });

  export const editTenantPayment = (
    editId,
    data,
    callback = () => {},
    onFailure = () => {}
  ) =>
    apiAction({
      url: `/transactions/employee-payment/${editId}`,
      method: 'PUT',
      data,
      onSuccess: callback,
      onFailure,
      showErrorToast: false,
      label: 'createTenantPayment',
    });

export const createBalancePayment = (
  data,
  callback = () => {},
  onFailure = () => {}
) =>
  apiAction({
    url: '/transactions/balance-creation-payment',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    label: 'balance-payment',
  });

  export const editBalancePayment = (
    editId,
    data,
    callback = () => {},
    onFailure = () => {}
  ) =>
    apiAction({
      url: `/transactions/balance-creation-payment/${editId}`,
      method: 'PUT',
      data,
      onSuccess: callback,
      onFailure,
      showErrorToast: false,
      label: 'balance-payment',
    });

export const createOperationTransfer = (data, callback, onFailure) =>
  apiAction({
    url: '/transactions/moneyTransfer/',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'CreateOperationPayment',
  });

  export const editOperationTransfer = (editId, data, callback, onFailure) =>
  apiAction({
    url: `/transactions/moneyTransfer/${editId}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'CreateOperationPayment',
  });
export const createOperationSalaryPayment = (data, callback, onFailure) =>
  apiAction({
    url: '/transactions/salary-payment',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    showErrorToast: false,
    label: 'createSalaryPayment',
  });

  export const editOperationSalaryPayment = (id, data, callback, onFailure) =>
  apiAction({
    url: `/transactions/salary-payment/${id}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    showErrorToast: false,
    onFailure,
    label: 'createSalaryPayment',
  });

export const createOperationExchange = (data, callback, onFailure) =>
  apiAction({
    url: '/transactions/exchange',
    method: 'POST',
    data,
    onSuccess: callback,
    onFailure,
    label: 'createOperationExchange',
  });

  export const editOperationExchange = (id, data, callback, onFailure) =>
  apiAction({
    url: `/transactions/exchange/${id}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    showErrorToast: false,
    onFailure,
    label: 'createOperationExchange',
  });