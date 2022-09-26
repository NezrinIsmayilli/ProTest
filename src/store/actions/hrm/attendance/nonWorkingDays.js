import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setNonWorkingDays = createAction('setNonWorkingDays');

export function fetchNonWorkingDays() {
  return apiAction({
    url: '/hrm/non-working-days',
    onSuccess: setNonWorkingDays,
    label: 'nonWorkingDays',
  });
}

export function createNonWorkingDay(data) {
  return apiAction({
    url: '/hrm/non-working-days',
    method: 'POST',
    data,
    onSuccess: fetchNonWorkingDays,
    label: 'createNonWorkingDay',
  });
}

export function deleteNonWorkingDay(id) {
  return apiAction({
    url: `/hrm/non-working-days/${id}`,
    method: 'DELETE',
    onSuccess: fetchNonWorkingDays,
    label: 'nonWorkingDays',
  });
}
