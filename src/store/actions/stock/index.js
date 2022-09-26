import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver, ErrorMessage } from 'utils';
import { toast } from 'react-toastify';

export const setStocks = createAction('setStocks');
export const setStocksCount = createAction('setStocksCount');
export const setStockInfo = createAction('setStockInfo');
export const deleteStockAction = createAction('deleteStockAction');
export const setReminders = createAction('setReminders');
export const setMovements = createAction('setMovements');
export const resetStockInfo = createAction('resetStockInfo');
export const setStockStatics = createAction('setStockStatics');
export const setStockStaticsCount = createAction('setStockStaticsCount');
export const setStockStaticsInfo = createAction('setStockStaticsInfo');

export function fetchStocks(filters, callback) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/stocks?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setStocks(data));
      if (callback) dispatch(callback(data));
    },
    label: 'fetchStocks',
  });
}

export function fetchStocksCount(filters, callback) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/stocks/count?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setStocksCount(data));
      if (callback) dispatch(callback(data));
    },
    label: 'fetchStocksCount',
  });
}
export function fetchFilteredStocks(props = {}) {
  const { filters = {}, onSuccessCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/stocks?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'filteredStocks',
  });
}
export function 
fetchStockStatics({ attribute, filters } = {}) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);

  return apiAction({
    url: `/sales/stocks/statistic?${query}`,
    onSuccess: setStockStatics,
    attribute,
    label: 'fetchStockStatics',
  });
}

export function fetchStockStaticsInfo(props = {}) {
  const { filters, stockId, productId } = props;

  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/sales/stocks/statistic/${stockId}/${productId}?${query}`,
    onSuccess: setStockStaticsInfo,
    label: 'fetchStockStaticsInfo',
  });
}

export function fetchStockStaticsCount({ attribute, filters } = {}) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/sales/stocks/statistic/count?${query}`,
    onSuccess: setStockStaticsCount,
    attribute,
    label: 'stockStaticsCount',
  });
}

export function fetchStockInfo(id) {
  return apiAction({
    url: `/sales/stocks/${id}`,
    onSuccess: setStockInfo,
    attribute: id,
    label: 'stock',
  });
}

export function fetchReminders(id) {
  return apiAction({
    url: `/sales/stocks/reminder/${id}`,
    onSuccess: setReminders,
    label: 'stock',
  });
}

export function fetchMovements(id) {
  return apiAction({
    url: `/sales/stocks/movement/${id}`,
    onSuccess: setMovements,
    label: 'stock',
  });
}

export function fetchFilteredStock({ filters }) {
  let query = '';
  Object.keys(filters).forEach(item => {
    const filter = filters[item];
    if (filter && query === '') {
      return (query += `filter[${item}]=${filter}`);
    }
    if (filter) {
      return (query += `&filter[${item}]=${filter}`);
    }
  });
  return apiAction({
    url: `/sales/stocks?${query}`,
    onSuccess: setStocks,
    label: 'stock',
  });
}

/**
 *
 * @param {Object} data
 * @param {Function} callback
 */
export function createStock(data, callback) {
  return apiAction({
    url: '/sales/stocks',
    method: 'POST',
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    data,
    onSuccess: callback,
    label: 'action',
  });
}

export function editStock(id, data, callback) {
  return apiAction({
    url: `/sales/stocks/${id}`,
    method: 'PUT',
    data,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    onSuccess: callback,
    label: 'action',
  });
}

export function deleteStock(id, onSuccess = () => {}) {
  return apiAction({
    url: `/sales/stocks/${id}`,
    method: 'DELETE',
    onSuccess,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    attribute: id,
    label: 'stock',
  });
}
