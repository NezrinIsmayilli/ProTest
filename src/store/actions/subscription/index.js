import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setPayments = createAction('setPayments');
export const setOverallPrice = createAction('setOverallPrice');
export const setPaymentUrlAndTotal = createAction('setPaymentUrlAndTotal');
export const resetTotalAndUrl = createAction('resetTotalAndUrl');

export const setFinance = createAction('setFinance');
export const setBalance = createAction('setBalance');
export const setPaymentsBalance = createAction('setPaymentsBalance');
export const setTenantId = createAction('setTenantId');
export const setTenantFeatue = createAction('setTenantFeatue');

export function fetchOverallPrice(data) {
  return apiAction({
    url: '/subscriptions/purchase?check',
    method: 'POST',
    data,
    onSuccess: setOverallPrice,
    label: 'overallPrice',
  });
}

export function createPaymentUrl(data) {
  return apiAction({
    url: '/subscriptions/purchase',
    method: 'POST',
    data,
    onSuccess: setPaymentUrlAndTotal,
    label: 'paymentUrl',
  });
}

export function verifiyPaymentKey(key, onSuccess, onFailure) {
  return apiAction({
    url: `/payment/verify?paymentKey=${key}`,
    onSuccess: fetchPayments,
    // onFailure,
    label: 'paymentKey',
  });
}

export function fetchPayments() {
  return apiAction({
    url: '/subscriptions/payments',
    onSuccess: setPayments,
    label: 'payments',
  });
}

export function verifyPayment(onSuccess = () => {}) {
  return apiAction({
    url: '/payment/verify',
    onSuccess,
    label: 'verifyPayment',
  });
}
// --------------------

export const fetchTenentFeatureSub = filters => {
  const query = filterQueryResolver(filters);
  const url = `/system/subscriptions?${query}`;
  return apiAction({
    url,
    label: 'registryType',
    onSuccess: data => dispatch => {
      dispatch(setFinance(data));
    },
    attribute: {},
  });
};

export const fetchTenantId = id =>
  apiAction({
    url: `/system/payments/${id}`,
    onSuccess: setTenantId,
    label: 'fetchTenantId',
  });

export const fetchTenentFeature = filters => {
  const query = filterQueryResolver(filters);
  const url = `/system/feature?${query}`;
  return apiAction({
    url,
    label: 'registryType',
    onSuccess: setTenantFeatue,
    attribute: {},
  });
};

export function getBalance() {
  return apiAction({
    url: 'system/payments/balance',
    onSuccess: setBalance,
    label: 'payments',
  });
}
export function getPaymentsBalance() {
  return apiAction({
    url: 'system/payments',
    onSuccess: setPaymentsBalance,
    label: 'payments',
  });
}