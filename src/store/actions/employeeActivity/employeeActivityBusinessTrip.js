import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setBusinessTripInfo = createAction('setBusinessTripInfo');

export function createEmployeeActivityBusinessTrip(data, callback) {
  return apiAction({
    url: 'hrm/employee-activity/business-trips',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'employeeActivityBusinessTrips',
  });
}

export function infoEmployeeActivityBusinessTrip(id) {
  return apiAction({
    url: `hrm/employee-activity/business-trips/${id}`,
    method: 'GET',
    onSuccess: setBusinessTripInfo,
    attribute: 'info',
    label: 'employeeActivityBusinessTrips',
  });
}

export function editEmployeeActivityBusinessTrip(id, data, callback) {
  return apiAction({
    url: `hrm/employee-activity/business-trips/${id}`,
    onSuccess: callback,
    method: 'PUT',
    data,
    attribute: 'added',
    label: 'employeeActivityBusinessTrips',
  });
}
