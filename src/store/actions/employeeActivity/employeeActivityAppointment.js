import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setActivityAppointmentInfo = createAction(
  'setActivityAppointmentInfo'
);

export function createEmployeeActivityAppointment(data, callback) {
  return apiAction({
    url: 'hrm/employee-activity/appointments',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'employeeActivityAppointments',
  });
}

export function infoEmployeeActivityAppointment(id) {
  return apiAction({
    url: `hrm/employee-activity/appointments/${id}`,
    method: 'GET',
    onSuccess: setActivityAppointmentInfo,
    attribute: 'info',
    label: 'employeeActivityAppointments',
  });
}

export function editEmployeeActivityAppointment(id, data, callback) {
  return apiAction({
    url: `hrm/employee-activity/appointments/${id}`,
    onSuccess: callback,
    method: 'PUT',
    data,
    attribute: 'added',
    label: 'employeeActivityAppointments',
  });
}
