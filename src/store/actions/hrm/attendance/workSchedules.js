import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setWorkSchedules = createAction('setWorkSchedules');
export const setSelectedSchedule = createAction('setSelectedSchedule');

export function fetchWorkSchedules() {
  return apiAction({
    url: '/hrm/work-schedules',
    onSuccess: setWorkSchedules,
    label: 'fetchWorkSchedules',
  });
}

export function createWorkSchedule(name, successCallback = () => {}) {
  return apiAction({
    url: '/hrm/work-schedules',
    method: 'POST',
    data: { name },
    onSuccess: params => dispatch => {
      successCallback();
      dispatch(fetchWorkSchedules(params));
    },
    showToast: true,
    label: 'createWorkSchedule',
  });
}

export function editWorkSchedule(id, name, successCallback = () => {}) {
  return apiAction({
    url: `/hrm/work-schedules/${id}`,
    method: 'PUT',
    data: name,
    onSuccess: params => dispatch => {
      successCallback();
      dispatch(fetchWorkSchedules(params));
    },
    showToast: true,
    label: 'editWorkSchedule',
  });
}

export function deleteWorkSchedule(
  id,
  successCallback = () => {},
  failureCallback = () => {}
) {
  return apiAction({
    url: `/hrm/work-schedules/${id}`,
    method: 'DELETE',
    onSuccess: () => () => {
      successCallback();
    },
    onFailure: () => () => {
      failureCallback();
    },
    showToast: true,
    label: 'deleteWorkSchedule',
  });
}
