import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const positionsSearchHandle = createAction('positionsSearchHandle');
export const setPositions = createAction('setPositions');

export function fetchPositions() {
  return apiAction({
    url: '/occupations',
    onSuccess: setPositions,
    label: 'occupations',
  });
}
export function createPositionsMSK(index, name) {
  return apiAction({
    url: '/occupation',
    method: 'POST',
    data: { name, code: null, shortName: null },
    onSuccess: fetchPositions,
    showErrorToast: false,
    showToast: true,
    label: 'occupations',
  });
}

export function createPositions(index, name, code, shortName) {
  return apiAction({
    url: '/occupation',
    method: 'POST',
    data: { name, code: code || null, shortName: shortName || null },
    onSuccess: fetchPositions,
    showErrorToast: false,
    showToast: true,
    label: 'occupations',
  });
}

export function editPositions({ data }) {
  return apiAction({
    url: `/occupation/${data.id}`,
    method: 'PUT',
    data: {
      name: data.name,
      code: !data.code ? null : data.code,
      shortName: !data.shortName ? null : data.shortName,
    },
    onSuccess: fetchPositions,
    showToast: true,
    label: 'occupations',
  });
}

export function deletePositions(id) {
  return apiAction({
    url: `/occupation/${id}`,
    method: 'DELETE',
    onSuccess: fetchPositions,
    showToast: true,
    label: 'occupations',
  });
}
