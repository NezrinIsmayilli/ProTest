import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver, ErrorMessage } from 'utils';
import { toast } from 'react-toastify';

// accounts - hesablar
export const setCashBoxNames = createAction('setCashBoxNames');
export const setAllCashBoxNames = createAction('setAllCashBoxNames');
export const setCashBoxBalance = createAction('setCashBoxBalance');

export function fetchAllCashboxNames(filters = {}, callBack) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transaction/cashboxNames?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setAllCashBoxNames(data));
      if (callBack) dispatch(callBack(data));
    },
    label: 'cashbox',
  });
}
export function fetchFilteredCashboxes(props = {}) {
  const { filters = {}, onSuccessCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transaction/cashboxNames?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'filteredCashboxes',
  });
}
export function fetchCashboxNamesByType(type, onSuccessCallback = () => {}) {
  return apiAction({
    url: `/transaction/cashboxNames?type=${type}`,
    onSuccess: data => dispatch => {
      dispatch(setAllCashBoxNames(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'cashbox',
  });
}

export function fetchCashboxNames(
  { attribute, label = 'cashbox', filters },
  callback = () => {}
) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transaction/cashboxNames/${attribute}?${query}`,
    onSuccess: params => dispatch => {
      dispatch(setCashBoxNames(params));
      callback(params);
    },
    attribute,
    label,
  });
}

export function fetchCashboxBalance({ attribute }, callback = () => {}) {
  let url = '/transaction/cashbox/balance';

  if (attribute) {
    url = `${url}/${attribute}`;
  }

  return apiAction({
    url,
    onSuccess: params => dispatch => {
      dispatch(setCashBoxBalance(params));
      callback(params.data);
    },
    onFailure: () => () => {
      callback();
    },
    attribute,
    label: 'balance',
  });
}

export function createCashboxNames(type, name) {
  return apiAction({
    url: '/transaction/cashboxNames',
    method: 'POST',
    data: { type, name },
    onSuccess: fetchCashboxNames,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showToast: true,
    showErrorToast: false,
    attribute: type,
    label: 'cashbox',
  });
}

export function editCashboxNames(id, name, type) {
  return apiAction({
    url: `/transaction/cashboxNames/${id}`,
    method: 'PUT',
    data: { name, type },
    onSuccess: fetchCashboxNames,
    showToast: true,
    showErrorToast: false,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    attribute: type,
    label: 'cashbox',
  });
}

export function deleteCashboxNames(id, type) {
  return apiAction({
    url: `/transaction/cashboxNames/${id}`,
    method: 'DELETE',
    onSuccess: fetchCashboxNames,
    showToast: true,
    attribute: type,
    label: 'cashbox',
  });
}

// export function createCashboxInvoiceTransaction(data) {
//   return apiAction({
//     url: '/transaction/cashbox/invoices',
//     method: 'POST',
//     data,
//     // onSuccess: fetchCashboxNames,
//     showToast: true,
//     // attribute: type,
//     label: 'cashbox',
//   });
// }

// Currencies
export const setCurrencies = createAction('setCurrencies');
export const setActiveCurrencies = createAction('setActiveCurrencies');
export const setGeneralCurrencies = createAction('setGeneralCurrencies');
export const setCurrenciesLoading = createAction('setCurrenciesLoading');
export const setMainCurrency = createAction('setMainCurrency');
export const setUsedCurrencies = createAction('setUsedCurrencies');

export function fetchMainCurrency() {
  return apiAction({
    url: '/currencies/main',
    onSuccess: setMainCurrency,
    label: 'mainCurrency',
  });
}

export function fetchGeneralCurrencies(filters = {}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/currencies/general?${query}`,
    onSuccess: setGeneralCurrencies,
    label: 'cashbox',
  });
}

export function fetchCurrencies(filters = {}, callback) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/currencies?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setCurrencies(data));
      if (callback) dispatch(callback(data));
    },
    label: 'fetchCurrencies',
  });
}

export function fetchUsedCurrencies(filters, onSuccess = () => {}) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/currencies?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setUsedCurrencies(data));
      dispatch(onSuccess(data));
    },
    label: 'balance',
  });
}

// if label defined will set in reducer 'label': true
export function fetchActiveCurrencies(label = false) {
  return apiAction({
    url: '/currencies?filter[isActive]=1',
    onSuccess: setActiveCurrencies,
    label,
  });
}

// add/edit currencies in one function
export function createCurrencies(data) {
  return apiAction({
    url: '/currencies',
    method: 'POST',
    data,
    label: 'cashbox',
    onSuccess: params => dispatch => {
      dispatch(fetchActiveCurrencies(params));
      dispatch(fetchCurrencies(params));
      dispatch(fetchMainCurrency(params));
    },
  });
}
export function switchCurrenciesActiveStatus(id) {
  return apiAction({
    url: `/currencies/active/${id}`,
    method: 'PUT',
    label: 'cashbox',
    onSuccess: params => dispatch => {
      dispatch(fetchActiveCurrencies(params));
      dispatch(fetchCurrencies(params));
    },
  });
}
export function switchMainCurrency(id) {
  return apiAction({
    url: `/currencies/main/${id}`,
    method: 'PUT',
    label: 'cashbox',
    onSuccess: params => dispatch => {
      dispatch(fetchCurrencies(params));
      dispatch(fetchMainCurrency(params));
    },
  });
}
export function createCurrenciesRate(data, onSuccess = () => {}) {
  return apiAction({
    url: '/currencies/rates',
    method: 'POST',
    data,
    label: 'cashbox',
    onSuccess: params => dispatch => {
      dispatch(fetchActiveCurrencies(params));
      dispatch(fetchCurrencies(params));
      dispatch(fetchMainCurrency(params));
      dispatch(onSuccess(data));
    },
  });
}

export function convertCurrency({
  params,
  onSuccessCallback,
  onFailureCallback,
}) {
  const { amount, fromCurrencyId, toCurrencyId, dateTime } = params;
  return apiAction({
    url: `/currencies/convert?amount=${amount}&fromCurrencyId=${fromCurrencyId}&toCurrencyId=${toCurrencyId}&dateTime=${dateTime}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'convertCurrency',
  });
}

export function convertMultipleCurrency({
  filters,
  onSuccessCallback,
  onFailureCallback,
}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/currencies/multiple-convert?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'convertMultipleCurrency',
  });
}