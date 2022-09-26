import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { ErrorMessage } from 'utils';
import { toast } from 'react-toastify';

export const setVacationTypes = createAction('setVacationTypes');

export function fetchVacationTypes() {
  return apiAction({
    url: '/hrm/vacation-types',
    onSuccess: setVacationTypes,
    label: 'vacationTypes',
  });
}

export function createVacationType(index, name) {
  return apiAction({
    url: '/hrm/vacation-types',
    method: 'POST',
    data: { name },
    onSuccess: fetchVacationTypes,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'vacationTypes',
  });
}

export function editVacationType(id, name) {
  return apiAction({
    url: `/hrm/vacation-types/${id}`,
    method: 'PUT',
    data: { name },
    onSuccess: fetchVacationTypes,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'vacationTypes',
  });
}

export function deleteVacationType(id) {
  return apiAction({
    url: `/hrm/vacation-types/${id}`,
    method: 'DELETE',
    onSuccess: fetchVacationTypes,
    showToast: true,
    label: 'vacationTypes',
  });
}

export const setBusinessTripReasons = createAction('setBusinessTripReasons');

export function fetchBusinessTripReasons() {
  return apiAction({
    url: '/hrm/business-trip-reasons',
    onSuccess: setBusinessTripReasons,
    label: 'vacationTypes',
  });
}

export function createBusinessTripReason(index, name) {
  return apiAction({
    url: '/hrm/business-trip-reasons',
    method: 'POST',
    data: { name },
    onSuccess: fetchBusinessTripReasons,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'vacationTypes',
  });
}

export function editBusinessTripReason(id, name) {
  return apiAction({
    url: `/hrm/business-trip-reasons/${id}`,
    method: 'PUT',
    data: { name },
    onSuccess: fetchBusinessTripReasons,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'vacationTypes',
  });
}

export function deleteBusinessTripReason(id) {
  return apiAction({
    url: `/hrm/business-trip-reasons/${id}`,
    method: 'DELETE',
    onSuccess: fetchBusinessTripReasons,
    showToast: true,
    label: 'vacationTypes',
  });
}

export const setTimeOffReasons = createAction('setTimeOffReasons');

export function fetchTimeOffReasons() {
  return apiAction({
    url: '/hrm/time-off-reasons',
    onSuccess: setTimeOffReasons,
    label: 'vacationTypes',
  });
}

export function createTimeOffReason(index, name) {
  return apiAction({
    url: '/hrm/time-off-reasons',
    method: 'POST',
    data: { name },
    onSuccess: fetchTimeOffReasons,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'vacationTypes',
  });
}

export function editTimeOffReason(id, name) {
  return apiAction({
    url: `/hrm/time-off-reasons/${id}`,
    method: 'PUT',
    data: { name },
    onSuccess: fetchTimeOffReasons,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'vacationTypes',
  });
}

export function deleteTimeOffReason(id) {
  return apiAction({
    url: `/hrm/time-off-reasons/${id}`,
    method: 'DELETE',
    onSuccess: fetchTimeOffReasons,
    showToast: true,
    label: 'vacationTypes',
  });
}

export const setFireReasons = createAction('setFireReasons');

export function fetchFireReasons() {
  return apiAction({
    url: '/hrm/fire/fire-reasons',
    onSuccess: setFireReasons,
    label: 'vacationTypes',
  });
}

export function createFireReason(index, name) {
  return apiAction({
    url: '/hrm/fire/fire-reasons',
    method: 'POST',
    data: { name },
    onSuccess: fetchFireReasons,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'vacationTypes',
  });
}

export function editFireReason(id, name) {
  return apiAction({
    url: `/hrm/fire/fire-reasons/${id}`,
    method: 'PUT',
    data: { name },
    onSuccess: fetchFireReasons,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'vacationTypes',
  });
}

export function deleteFireReason(id) {
  return apiAction({
    url: `/hrm/fire/fire-reasons/${id}`,
    method: 'DELETE',
    onSuccess: fetchFireReasons,
    showToast: true,
    label: 'vacationTypes',
  });
}
