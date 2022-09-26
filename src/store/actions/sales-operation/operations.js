import { apiAction } from 'store/actions';

const invoiceTypes = {
    draft: 'draft',
    purchase: 'purchase',
    sales: 'sales',
    returnFromCustomer: 'returnFromCustomer',
    returnToSupplier: 'returnToSupplier',
    transfer: 'transfer',
    writingOff: 'remove',
    production: 'production',
    init: 'init',
};

// Create invoice
export const createInvoice = props => {
    const {
        data,
        type = 'draft',
        onSuccessCallback,
        onFailureCallback,
        label = 'createInvoiceOperation',
        showError = true,
    } = props;
    return apiAction({
        data,
        label,
        url: `/sales/invoices/${invoiceTypes[type]}`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: showError,
    });
};

export const editInvoice = props => {
    const {
        id,
        data,
        type = 'draft',
        onSuccessCallback,
        onFailureCallback,
        label = 'editInvoiceOperation',
    } = props;
    return apiAction({
        data,
        label,
        method: 'PUT',
        url: `/sales/invoices/${invoiceTypes[type]}/${id}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
    });
};

// Delete invoice (all invoice types)
export function deleteInvoice(props = {}) {
    const {
        id,
        onSuccessCallback,
        onFailureCallback,
        label = 'deleteInvoice',
    } = props;
    return apiAction({
        label,
        method: 'DELETE',
        url: `/sales/invoices/${id}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
    });
}
