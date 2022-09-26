import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setReportCashFlow = createAction('setReportCashFlow');
export const setCashBoxBalancePeriod = createAction('setCashBoxBalancePeriod');

export const setAdvanceReport = createAction('finance/reports/advance');
export const setEmployeeReport = createAction('finance/reports/employee');
export const setBalanceReport = createAction('finance/reports/balance');
export const setCurrencies = createAction('finance/reports/currencies');
export const clearReports = createAction('finance/reports/clearReports');
export const setCurrencyReport = createAction(
    'finance/reports/setCurrencyReport'
);
export const setCashboxBalanceReport = createAction(
    'finance/reports/setCashboxBalanceReport'
);
export const setCashboxInitialBalance = createAction(
    'finance/reports/setCashboxInitialBalance'
);

const currenciesURL = {
    advance: 'advance',
    balance: 'balance-creation',
    employee: 'employee-payment',
};

export function fetchReportCashFlow(
    { filters: { ...filters }, attribute = { ...filters } },
    callBack = setReportCashFlow
) {
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/transaction/report/cash-flow?${query}`,
        onSuccess: callBack,
        attribute,
        label: 'financeReportCashFlow',
    });
}

export function fetchCashBoxBalanceForPeriod(
    { dateFrom, dateTo, filters: { ...filters }, attribute = { ...filters } },
    callBack = setCashBoxBalancePeriod
) {
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/transaction/cashbox/balance-converted-to-main-currency-for-period/${dateFrom}/${dateTo}?${query}`,
        onSuccess: callBack,
        attribute,
        label: 'financeReportCashBoxBalanceForPeriod',
    });
}

export function fetchAdvanceReport(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/transaction/report/advance?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setAdvanceReport(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchAdvanceReport',
    });
}

export function fetchEmployeeReport(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/transaction/report/employee-payment?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setEmployeeReport(data));

            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchEmployeeReport',
    });
}
export function fetchBalanceReport(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/transaction/report/balance-creation?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setBalanceReport(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchBalanceReport',
    });
}

export function fetchTransactions(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/transactions?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchTransactions',
    });
}

export function fetchReportCurrencies(props = {}) {
    const { filters, type, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/transaction/report/${currenciesURL[type]}/currencies?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setCurrencies(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchReportCurrencies',
    });
}
export function fetchCurrencyReport(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/currency/history?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setCurrencyReport(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchCurrencyReport',
    });
}
export function fetchCashboxBalanceReport(props = {}) {
    const { filters, onSuccessCallback, forInitial = false } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/transaction/report/cashbox-balance?${query}`,
        onSuccess: data => dispatch => {
            if (forInitial) {
                dispatch(setCashboxInitialBalance(data));
            } else {
                dispatch(setCashboxBalanceReport(data));
            }
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        label: 'fetchCashboxBalanceReport',
    });
}

export function createCashboxBalance(data, callback, failure) {
    return apiAction({
        url: '/transactions/initial-balance',
        method: 'POST',
        data,
        onSuccess: callback,
        onFailure: failure,
        showErrorToast: false,
        showToast: true,
        label: 'createCashboxBalance',
    });
}

export function deleteCashboxBalance({ id, onSuccess, onFailure }) {
    return apiAction({
        url: `/transaction/cashbox/${id}`,
        method: 'DELETE',
        onSuccess,
        onFailure,
        showErrorToast: false,
        showToast: false,
        label: 'action',
    });
}

export function deleteInvoiceHard({ id, onSuccess, onFailure }) {
    return apiAction({
        url: `/sales/invoices/hard/${id}`,
        method: 'DELETE',
        onSuccess,
        onFailure,
        showErrorToast: false,
        showToast: false,
        label: 'action',
    });
}