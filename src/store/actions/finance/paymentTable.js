import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setCreditPayments = createAction('setCreditPayments');
export const setTransactionsCount = createAction('setTransactionsCount');
export const setTransactionAction = createAction('setTransactionAction');
export const setCreditCounts = createAction('setCreditCounts');

export function fetchCreditPayments({
  filters: { ...filters },
  onSuccessCallback,
  setOperations = true,
  attribute = {},
}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transaction/credit/credits?${query}`,
    onSuccess: data => dispatch => {
      if (setOperations) dispatch(setCreditPayments(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    attribute,
    label: 'fetchCreditPayments',
  });
}

export function fetchCreditCounts({
  filters: { ...filters },
  onSuccessCallback,
  setOperations = true,
  attribute = {},
}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transaction/credit/credits/count?${query}`,
    onSuccess: data => dispatch => {
      if (setOperations) dispatch(setCreditCounts(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    attribute,
    label: 'fetchCreditCounts',
  });
}

export function createCreditPayments(props) {
  const { data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: `/transaction/credit/credits`,
    method: 'POST',
    data,
    showErrorToast: false,
    label: 'createCreditPayments',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

export function createCreditTable(props) {
  const { data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: `/transaction/credit/credits/creditTable`,
    method: 'POST',
    data,
    showErrorToast: false,
    label: 'createCreditTable',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

export function editCreditPayments(props) {
  const { id, data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: `/transaction/credit/credits/${id}`,
    method: 'PUT',
    data,
    showErrorToast: false,
    label: 'editCreditPayments',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

export function deleteCreditPayment(id, deletionReason, callBack) {
  const query = filterQueryResolver({ deletionReason });
  return apiAction({
    url: `/transaction/credit/credits/${id}?${query}`,
    method: 'DELETE',
    onSuccess: callBack,
    label: 'deleteCreditPayment',
  });
}

export function fetchPaymentTransaction({
  id,
  onSuccessCallback,
  attribute = {},
}) {
  return apiAction({
    url: `/transaction/credit/credits/transactions/${id}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    attribute,
    label: 'fetchPaymentTransaction',
  });
}
export function getCreditPayment({ id, onSuccess, attribute = {} }) {
  return apiAction({
    url: `/transaction/credit/credits/${id}`,
    onSuccess,
    attribute,
    label: 'getCreditPayment',
  });
}
