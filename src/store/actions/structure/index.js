import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const structuresSearchHandle = createAction('structuresSearchHandle');
export const structuresSectionHandle = createAction('structuresSectionHandle');
export const setStructures = createAction('setStructures');

export function fetchStructures(filters = {}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/structures?${query}`,
    onSuccess: setStructures,
    label: 'structures',
  });
}
export function fetchFilteredStructures(props = {}) {
  const { filters = {}, onSuccessCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/structures?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'filteredStructures',
  });
}
export function fetchHierarchicalStructure(props = {}) {
  const { filters = {}, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/structures/hierarchical?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchHierarchicalStructure',
  });
}

export function deleteStructure(id) {
  return apiAction({
    url: `/structure/${id}`,
    method: 'DELETE',
    onSuccess: fetchStructures,
    showToast: true,
    label: 'structures',
  });
}

export function createStructure(data, closeDrawer) {
  return apiAction({
    url: '/structure',
    onSuccess: () => dispatch => {
      dispatch(fetchStructures());
      if (closeDrawer) {
        closeDrawer();
      }
    },
    method: 'POST',
    data,
    showToast: true,
    attribute: 'added',
    label: 'structures',
  });
}

export function editStructure(id, data, closeDrawer) {
  return apiAction({
    url: `/structure/${id}`,
    onSuccess: () => dispatch => {
      dispatch(fetchStructures());
      if (closeDrawer) {
        closeDrawer();
      }
    },
    method: 'PUT',
    data,
    showToast: true,
    attribute: 'edited',
    label: 'structures',
  });
}
