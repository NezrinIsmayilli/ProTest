import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setDailyTasks = createAction('tasks/setDailyTasks');
export const setAssignedTasks = createAction('tasks/setAssignedTasks');
export const setDelayedTasks = createAction('tasks/setDelayedTasks');
export const setProjectTasks = createAction('tasks/setProjectTasks');
export const setReorderedTasks = createAction('tasks/setReorderedTasks');

export function fetchTasks({
  filters,
  type = 'daily',
  onSuccessCallback,
  onFailureCallback = () => {},
}) {
  const query = filterQueryResolver(filters);
  const url = `/tasks?${query}`;
  // const url = `/tasks/${type}?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      switch (type) {
        case 'daily':
          dispatch(setDailyTasks(data));
          break;
        case 'assigned':
          dispatch(setAssignedTasks(data));
          break;
        case 'delayed':
          dispatch(setDelayedTasks(data));
          break;
        case 'project':
          dispatch(setProjectTasks(data));
          break;
        default:
          break;
      }
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onFailure: error => () => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    label: `fetchTasks`,
  });
}

export function fetchProjectTasks({
  filters,
  onSuccessCallback,
  onFailureCallback = () => {},
}) {
  const query = filterQueryResolver(filters);
  const url = `/tasks?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setProjectTasks(data));
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onFailure: error => () => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    label: `fetchProjectTasks`,
  });
}

export const createTask = ({ data, type, list, callback, onFailureCallback }) =>
  apiAction({
    url: '/tasks',
    method: 'POST',
    onSuccess: data => dispatch => {
      dispatch(fetchTasks({ type }));
      if (callback) {
        callback(data);
      }
    },
    onFailure: ({ error }) => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    data,
    label: `createTask`,
    showErrorToast: false,
  });

export function editTask({ id, data, callback, onFailureCallback, list }) {
  return apiAction({
    url: `/tasks/${id}/status/${data.status}`,
    method: 'PUT',
    onSuccess: data => dispatch => {
      if (callback) {
        dispatch(callback(data));
      }
    },
    onFailure: ({ error }) => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    data,
    label: `editTask`,
    showErrorToast: false,
  });
}

export function deleteTask({ id, callback, onFailureCallback, list }) {
  return apiAction({
    url: `/tasks/${id}`,
    method: 'DELETE',
    onSuccess: data => dispatch => {
      if (callback) {
        dispatch(callback(data));
      }
    },
    onFailure: ({ error }) => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    label: `deleteTask`,
    showErrorToast: false,
  });
}

export const reorderTasks = (
  list,
  startIndex,
  endIndex,
  droppableId,
  type
) => dispatch => {
  const result = Array.from(list);
  // find dragged item(removed from list)
  const [removed] = result.splice(startIndex, 1);
  // add to dragged list
  result.splice(endIndex, 0, removed);

  dispatch(setReorderedTasks({ result, droppableId, type }));
};
