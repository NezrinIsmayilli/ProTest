import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const dismissedWorkesSearch = createAction('dismissedWorkesSearch');
export const workersSearchHandle = createAction('workersSearchHandle');
export const setWorkers = createAction('setWorkers');
export const setDismissedWorkers = createAction('setDismissedWorkers');
export const setWorker = createAction('setWorker');

export function fetchWorkers({ filters } = {}) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/hrm/employees?${query}`,
    onSuccess: params => dispatch => {
      const mergedObject = {
        workerRequestQuery: query,
        data: params.data,
      };
      dispatch(setWorkers(mergedObject));
    },
    label: 'fetchWorkers',
  });
}

export function fetchFilteredWorkers(props={}) {
  const { filters  = {},callback = () => {}, onSuccessCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/hrm/employees?${query}`,
    onSuccess: params => dispatch => {
      const mergedObject = {
        workerRequestQuery: query,
        data: params.data,
      };
      dispatch(setWorkers(mergedObject));
      callback(mergedObject);
      if (onSuccessCallback !== undefined) {
        dispatch(onSuccessCallback(params))
    }
    },
    label: 'workers',
  });
}

export function fetchDismissedWorkers(
  filters = { isFired: 1 },
  callbacks = {}
) {
  const { onSuccessCallback = () => {} } = callbacks;
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/hrm/employees?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setDismissedWorkers(data));
      onSuccessCallback(data);
    },
    label: 'dismissedWorkers',
  });
}

export function createWorker(data, callback) {
  return apiAction({
    url: '/hrm/employees',
    onSuccess: callback,
    method: 'POST',
    data,
    attribute: 'added',
    label: 'workers',
  });
}

export function editWorker(id, data, callback) {
  return apiAction({
    url: `/hrm/employees/${id}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    attribute: 'edited',
    label: 'workers',
  });
}

export function addToBlackListWorker(id, callback) {
  return apiAction({
    url: `/hrm/employees/${id}/black-list/add`,
    method: 'PUT',
    onSuccess: callback,
    attribute: 'added',
    label: 'workers',
  });
}

export function removeToBlackListWorker(id, callback) {
  return apiAction({
    url: `/hrm/employees/${id}/black-list/remove`,
    method: 'PUT',
    onSuccess: callback,
    showToast: false,
    attribute: 'added',
    label: 'workers',
  });
}

export function fetchWorker(id) {
  return apiAction({
    url: `/hrm/employees/${id}`,
    onSuccess: setWorker,
    label: 'workers',
  });
}

export function fetchEmployeeActivity(id, employeeId) {
  return apiAction({
    url: `/hrm/employee-activities/${id}`,
    onSuccess: params => dispatch => {
      dispatch(setWorker({ data: { ...params.data, employeeId } }));
    },
    label: 'workers',
  });
}

export function editAndHireWorker(id, data, callback) {
  return apiAction({
    url: `/hrm/employees/editAndHire/${id}`,
    method: 'PUT',
    data,
    onSuccess: callback,
    attribute: 'edited',
    label: 'workers',
  });
}

export function deleteWorker(id, callback = () => {}) {
  return apiAction({
    url: `/hrm/employees/${id}`,
    method: 'DELETE',
    onSuccess: callback,
    label: 'workers',
  });
}
