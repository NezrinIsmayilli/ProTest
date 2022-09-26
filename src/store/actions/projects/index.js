import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setProjects = createAction('projects/setProjects');

export function fetchProjects({
  filters,
  onSuccessCallback,
  onFailureCallback = () => {},
} = {}) {
  const query = filterQueryResolver(filters);
  const url = `/projects?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setProjects(data));
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onFailure: error => () => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    label: `fetchingProjects`,
  });
}

export const createProject = ({ data, callback, onFailureCallback }) =>
  apiAction({
    url: '/projects',
    method: 'POST',
    onSuccess: data => dispatch => {
      dispatch(fetchProjects());
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
    label: `createProject`,
    showErrorToast: false,
    showToast: true,
  });
export const addMembersToProject = ({
  id,
  data,
  callback,
  onFailureCallback,
}) =>
  apiAction({
    url: `/projects/${id}/members`,
    method: 'POST',
    onSuccess: data => dispatch => {
      dispatch(fetchProjects());
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
    label: `addMembers`,
    showToast: true,
  });

export const deleteProject = ({ id, callback, onFailureCallback }) =>
  apiAction({
    url: `/projects/${id}`,
    method: 'DELETE',
    onSuccess: data => () => {
      if (callback) {
        callback(data);
      }
    },
    onFailure: ({ error }) => {
      if (onFailureCallback) {
        onFailureCallback(error);
      }
    },
    label: `deleteProject`,
    showToast: true,
  });

export function editProject({ id, data, callback, onFailureCallback }) {
  return apiAction({
    url: `/projects/${id}`,
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
    label: `editProject`,
    showToast: true,
  });
}

// export function deleteTask({ id, callback, onFailureCallback, list }) {
//   return apiAction({
//     url: `/tasks/${id}`,
//     method: 'DELETE',
//     onSuccess: data => dispatch => {
//       if (callback) {
//         dispatch(callback(data));
//       }
//     },
//     onFailure: ({ error }) => {
//       if (onFailureCallback) {
//         onFailureCallback(error);
//       }
//     },
//     label: `deleteTask`,
//     showErrorToast: false,
//   });
// }

// export const reorderTasks = (
//   list,
//   startIndex,
//   endIndex,
//   droppableId
// ) => dispatch => {
//   const result = Array.from(list);
//   // find dragged item(removed from list)
//   const [removed] = result.splice(startIndex, 1);
//   // add to dragged list
//   result.splice(endIndex, 0, removed);

//   dispatch(setReorderedTasks({ result, droppableId }));
// };
