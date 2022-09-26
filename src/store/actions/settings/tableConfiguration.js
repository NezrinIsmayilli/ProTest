import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setTableConfiguration = createAction('setTableConfiguration');

export function fetchTableConfiguration(filters = {}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/system/tenant-person-setting/columns-order?${query}`,
    onSuccess: setTableConfiguration,
    label: 'table-configuration',
  });
}

export function createTableConfiguration({ moduleName, columnsOrder }) {
  return apiAction({
    url: '/system/tenant-person-setting/columns-order',
    onSuccess: () => dispatch => {
      dispatch(fetchTableConfiguration({ module: moduleName }));
    },
    method: 'POST',
    data: {
      moduleName,
      columnsOrder,
    },
    showToast: true,
    attribute: 'added',
    label: 'table-configuration',
  });
}

