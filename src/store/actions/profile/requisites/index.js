import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setRequisitesData = createAction('setRequisitesData');

export function editRequisites(data) {
  return apiAction({
    url: '/tenant-requisites',
    method: 'PUT',
    data,
    onSuccess: fetchRequisites,
    showToast: true,
    label: 'editRequisites',
  });
}

export function fetchRequisites() {
  return apiAction({
    url: '/tenant-requisites',
    onSuccess: setRequisitesData,
    label: 'requisites',
  });
}
