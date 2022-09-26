import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setEmployeeActivities = createAction('setEmployeeActivities');

export function fetchEmployeeActivities({ filters = {}, attribute = {} } = {}) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/hrm/employee-activities?${query}`,
    onSuccess: setEmployeeActivities,
    attribute,
    label: 'fetchEmployeeActivities',
  });
}

export function deleteEmployeeActivity(id, callback) {
  return apiAction({
    url: `/hrm/employee-activities/${id}`,
    onSuccess: callback,
    method: 'DELETE',
    attribute: 'delete',
    label: 'deleteEmployeeActivity',
  });
}
