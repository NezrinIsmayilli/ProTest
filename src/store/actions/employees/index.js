import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const employeesSearchHandle = createAction('employeesSearchHandle');
export const setEmployees = createAction('setEmployees');
export const setHrmEmployees = createAction('setHrmEmployees');
export const filterEmployees = createAction('filterEmployees');

export function fetchEmployees({ filters } = {}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/employees?${query}`,
    onSuccess: setEmployees,
    label: 'fetchEmployees',
  });
}
export function fetchHrmEmployees({ filters } = {}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/hrm/employees?${query}`,
    onSuccess: setHrmEmployees,
    label: 'hrmEmployees',
  });
}
export function createUser(data, callback) {
  return apiAction({
    url: '/employees',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'users',
  });
}

export function editUser(id, data, callback) {
  return apiAction({
    url: `/employees/${id}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    attribute: 'edited',
    label: 'users',
  });
}

export function deleteEmployee(id, callback) {
  return apiAction({
    url: `/employees/delete/${id}`,
    method: 'DELETE',
    onSuccess: callback,
    label: 'users',
  });
}

export function inviteEmployee(data, callback) {
  return apiAction({
    url: '/invite',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'users',
  });
}
