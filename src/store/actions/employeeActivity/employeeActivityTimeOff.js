import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setEmployeeActivityTimeOff = createAction(
  'setEmployeeActivityTimeOff'
);

export function createEmployeeActivityTimeOff(data, callback) {
  return apiAction({
    url: 'hrm/employee-activity/time-offs',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'employeeActivityTimeOffs',
  });
}

export function infoEmployeeActivityTimeOff(id) {
  return apiAction({
    url: `hrm/employee-activity/time-offs/${id}`,
    method: 'GET',
    onSuccess: setEmployeeActivityTimeOff,
    attribute: 'info',
    label: 'employeeActivityTimeOffs',
  });
}

export function editEmployeeActivityTimeOff(id, data, callback) {
  return apiAction({
    url: `hrm/employee-activity/time-offs/${id}`,
    onSuccess: callback,
    method: 'PUT',
    data,
    attribute: 'added',
    label: 'employeeActivityTimeOffs',
  });
}
