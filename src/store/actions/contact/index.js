import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import moment from 'moment';
import { fullDateTimeWithSecond, filterQueryResolver } from 'utils';

export const setContacts = createAction('setContacts');
export const setConvertCurrency = createAction('setConvertCurrency');
export const setCurrencies = createAction('setCurrencies');
export const setInvoiceListByContactId = createAction('invoiceListByContactId');
export const setAdvancePaymentByContactId = createAction(
    'advancePaymentByContactId'
);

// GET - Contacts
export function fetchContacts(filters, onSuccessCallback, { attribute } = {}) {
    const query = filterQueryResolver({ ...filters });
    return apiAction({
        url: `/contacts?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(data);
            } else {
                dispatch(setContacts(data));
            }
        },
        attribute,
        label: 'contacts',
    });
}

// GET - Currencies
export function fetchCurrencies(filters = {}, callBack = setCurrencies) {
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/currencies?${query}`,
        onSuccess: callBack,
        // attribute,
        label: 'currencies',
    });
}

// invoice list by contact id
export function fetchInvoiceListByContactId(
    contactId = '',
    callBack = setInvoiceListByContactId,
    invoiceId = undefined
) {
    return apiAction({
        url: invoiceId
            ? `/contacts/unpaid-or-partially-paid-invoices/${contactId}?invoiceId=${invoiceId}`
            : `/contacts/unpaid-or-partially-paid-invoices/${contactId}`,
        onSuccess: callBack,
        label: 'invoiceListByContactId',
        attribute: contactId,
    });
}

// advance payment by contact id
export function fetchAdvancePaymentByContactId(
    contactId = '',
    filters,
    callBack = setAdvancePaymentByContactId
) {
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/contacts/advance/${contactId}?${query}`,
        onSuccess: callBack,
        label: 'advancePaymentByContactId',
        attribute: contactId,
    });
}

export function fetchLastDateOfAdvanceByContactId(contactId = '', callBack) {
    return apiAction({
        url: `/transaction/invoices/last-date-of-advance-transaction/${contactId}`,
        onSuccess: callBack,
        label: 'lastDateOfAdvanceByContactId',
        attribute: contactId,
    });
}

export function fetchLastDateOfBalanceByContactId(contactId = '', callBack) {
    return apiAction({
        url: `/transactions/employee-payment/last-date-of-payment-transaction/${contactId}`,
        onSuccess: callBack,
        label: 'lastDateOfBalanceByContactId',
        attribute: contactId,
    });
}

// convert currencies
export function convertCurrency(
    amount,
    fromCurrencyId,
    toCurrencyId,
    callBack = setConvertCurrency
) {
    let tmpAmount;
    if (amount < 0) tmpAmount = amount * -1;
    else tmpAmount = amount;
    return apiAction({
        url: `/currencies/convert?amount=${tmpAmount}&fromCurrencyId=${fromCurrencyId}&toCurrencyId=${toCurrencyId}&dateTime=${moment().format(
            fullDateTimeWithSecond
        )}`,
        onSuccess: callBack,
        attribute: amount,
        label: 'convertCurrencies',
    });
}
