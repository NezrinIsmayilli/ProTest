import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setSickLeaveInfo = createAction('setSickLeaveInfo');

export function createEmployeeActivitySickLeave(data, callback) {
  return apiAction({
    url: 'hrm/employee-activity/sick-leaves',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'employeeActivitySickLeave',
  });
}

export function infoEmployeeActivitySickLeave(id) {
  return apiAction({
    url: `hrm/employee-activity/sick-leaves/${id}`,
    method: 'GET',
    onSuccess: setSickLeaveInfo,
    attribute: 'info',
    label: 'employeeActivitySickLeave',
  });
}

export function editEmployeeActivitySickLeave(id, data, callback) {
  return apiAction({
    url: `hrm/employee-activity/sick-leaves/${id}`,
    onSuccess: callback,
    method: 'PUT',
    data,
    attribute: 'added',
    label: 'employeeActivitySickLeave',
  });
}
