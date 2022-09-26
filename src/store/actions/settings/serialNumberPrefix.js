import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setSerialNumberPrefixes = createAction('setSerialNumberPrefixes');
export const setSalesBuysForms = createAction('setSalesBuysForms');
export const setForms = createAction('setForms');

export function fetchSerialNumberPrefixes() {
  return apiAction({
    url: '/hrm/activity/serial-number-prefixes',
    onSuccess: setSerialNumberPrefixes,
    label: 'serialNumberPrefixes',
  });
}
export function createOrEditSerialNumberPrefix(data) {
  return apiAction({
    url: '/hrm/activity/serial-number-prefixes',
    method: 'POST',
    data,
    onSuccess: fetchSerialNumberPrefixes,
    showToast: true,
    label: 'serialNumberPrefixes',
  });
}
export function fetchSalesBuysForms() {
  return apiAction({
    url: '/data-export/sample-documents',
    onSuccess: setSalesBuysForms,
    label: 'salesBuysForms',
  });
}
export function createForms(form, onSuccessCallback = () => {}) {
  return apiAction({
    url: '/data-export/sample-documents',
    method: 'POST',
    data: form,
    onSuccess: data => dispatch => {
      onSuccessCallback(data);
    },
    showToast: true,
    label: 'forms',
  });
}
export function deleteForms(id, onSuccessCallback = () => {}) {
  return apiAction({
    url: `/data-export/sample-documents/${id}`,
    method: 'DELETE',
    showToast: true,
    onSuccess: onSuccessCallback,
    attribute: id,
    label: 'deleteForms',
  });
}
export function updateForms(props) {
  const {
    id,
    data,
    onSuccessCallback,
    onFailureCallback,
    label = 'updateForms',
  } = props;
  return apiAction({
    data,
    label,
    method: 'PUT',
    url: `/data-export/sample-documents/${id}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
