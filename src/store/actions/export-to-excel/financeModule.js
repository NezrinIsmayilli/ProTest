import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setAllTransactionList = createAction('setAllTransactionList');
export const setAllReceivables = createAction('setAllReceivables');

export function fetchAllTransactionList({ filters, onSuccessCallback }) {
    let query = filterQueryResolver(filters);
    return apiAction({
        url: `/transactions?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setAllTransactionList(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        label: 'all-transactions',
    });
}

export function fetchAllRecievables({ filters, onSuccessCallback }) {
    let query = filterQueryResolver(filters);
    if (query.startsWith('&')) query = query.substring(1);

    return apiAction({
        url: `/transaction/report/recievables?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setAllReceivables(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        label: 'all-recievables',
    });
}

export function fetchAllSalesInvoiceList({
    filters: { ...filters },
    label = 'all-salesInvoiceList',
    onSuccessCallback,
}) {
    let query = filterQueryResolver(filters);
    if (query.startsWith('&')) query = query.substring(1);
    return apiAction({
        url: `/sales/invoices?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        label,
    });
}

export function fetchAllPayables({ filters, onSuccessCallback }) {
    let query = filterQueryResolver(filters);
    if (query.startsWith('&')) query = query.substring(1);

    return apiAction({
        url: `/transaction/report/payables?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        label: 'all-payables',
    });
}

export const fetchAllVatInvoices = ({ filters, onSuccessCallback }) => {
    let query = filterQueryResolver({ ...filters, type: undefined });
    if (query.startsWith('&')) query = query.substring(1);

    return apiAction({
        url: `/transaction/report/${filters.type}?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        label: 'all-vat-invoices',
    });
};

export function fetchAllAdvanceReport(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/transaction/report/advance?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchAllAdvanceReport',
    });
}

export function fetchAllEmployeeReport(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/transaction/report/employee-payment?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchAllEmployeeReport',
    });
}

export function fetchAllBalanceReport(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/transaction/report/balance-creation?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchAllBalanceReport',
    });
}

export function fetchAllCurrencyReport(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/currency/history?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchAllCurrencyReport',
    });
}

export function fetchAllCreditPayments({
    filters: { ...filters },
    onSuccessCallback,
    attribute = {},
  }) {
    const query = filterQueryResolver(filters);
    return apiAction({
      url: `/transaction/credit/credits?${query}`,
      onSuccess: data => dispatch => {
        if (onSuccessCallback) dispatch(onSuccessCallback(data));
      },
      attribute,
      label: 'fetchAllCreditPayments',
    });
  }

  