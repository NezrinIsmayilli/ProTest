import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setVacationInfo = createAction('setVacationInfo');

export function createEmployeeActivityVacation(data, callback) {
  return apiAction({
    url: 'hrm/employee-activity/vacations',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'employeeActivityVacation',
  });
}

export function infoEmployeeActivityVacation(id) {
  return apiAction({
    url: `hrm/employee-activity/vacations/${id}`,
    method: 'GET',
    onSuccess: setVacationInfo,
    attribute: 'info',
    label: 'employeeActivityVacation',
  });
}

export function editEmployeeActivityVacation(id, data, callback) {
  return apiAction({
    url: `hrm/employee-activity/vacations/${id}`,
    onSuccess: callback,
    method: 'PUT',
    data,
    attribute: 'added',
    label: 'employeeActivityVacation',
  });
}
