import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setCreditTypes = createAction('setCreditTypes');

export function fetchCreditTypes() {
  return apiAction({
    url: '/transaction/credit/credit-types',
    onSuccess: setCreditTypes,
    label: 'creditTypes',
  });
}

export function fetchCreditType(props = {}) {
  const { id, onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `/transaction/credit/credit-types/months/${id}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchCreditType',
  });
}

export function createCreditType(
  data,
  onSuccess = () => {},
  onFailure = () => {}
) {
  return apiAction({
    url: `/transaction/credit/credit-types`,
    onSuccess,
    onFailure,
    method: 'POST',
    data,
    showToast: false,
    showErrorToast: false,
    attribute: 'added',
    label: 'action',
  });
}

export function editCreditType(
  id,
  data,
  onSuccess = () => {},
  onFailure = () => {}
) {
  return apiAction({
    url: `/transaction/credit/credit-types/${id}`,
    onSuccess: params => dispatch => {
      dispatch(onSuccess(data));
    },
    onFailure,
    method: 'PUT',
    data,
    showToast: false,
    showErrorToast: false,
    attribute: 'edited',
    label: 'action',
  });
}

export function deleteCreditTypes(id) {
  return apiAction({
    url: `/transaction/credit/credit-types/${id}`,
    method: 'DELETE',
    onSuccess: fetchCreditTypes,
    showToast: true,
    label: 'creditTypes',
  });
}
