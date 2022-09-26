import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setStockTypes = createAction('setStockTypes');

export function fetchStockTypes(props = {}) {
  const { filters = {}, onSuccessCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/stock/stockTypes?${query}`,
    onSuccess:data=>dispatch=>{ 
      dispatch(setStockTypes(data));
      if (onSuccessCallback !== undefined) {
        onSuccessCallback(data);
    }
    },
    label: 'stockTypes',
  });
}

export function createStockTypes(index, name) {
  return apiAction({
    url: '/sales/stock/stockTypes',
    method: 'POST',
    data: { name },
    onSuccess: fetchStockTypes,
    showToast: true,
    label: 'stockTypes',
  });
}

export function editStockTypes(id, name) {
  return apiAction({
    url: `/sales/stock/stockTypes/${id}`,
    method: 'PUT',
    data: { name },
    onSuccess: fetchStockTypes,
    showToast: true,
    label: 'stockTypes',
  });
}

export function deleteStockTypes(id) {
  return apiAction({
    url: `/sales/stock/stockTypes/${id}`,
    method: 'DELETE',
    onSuccess: fetchStockTypes,
    showToast: true,
    label: 'stockTypes',
  });
}
