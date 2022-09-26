import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setActivityFireInfo = createAction('setActivityFireInfo');

export function createEmployeeActivityFire(data, callback) {
  return apiAction({
    url: 'hrm/employee-activity/fire',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'employeeActivityFires',
  });
}

export function infoEmployeeActivityFire(id) {
  return apiAction({
    url: `hrm/employee-activity/fire/${id}`,
    method: 'GET',
    onSuccess: setActivityFireInfo,
    attribute: 'info',
    label: 'employeeActivityFires',
  });
}

export function editEmployeeActivityFire(id, data, callback) {
  return apiAction({
    url: `hrm/employee-activity/fire/${id}`,
    onSuccess: callback,
    method: 'PUT',
    data,
    attribute: 'added',
    label: 'employeeActivityFires',
  });
}
