import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setFilteredLogs = createAction('setFilteredLogs');
export const setLogsCount = createAction('setLogsCount');

export function fetchFilteredLogs(filters = {}, callback) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/audit/logs?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setFilteredLogs(data));
      if (callback) callback(data);
    },
    label: 'fetchFilteredLogs',
  });
}

export function fetchLogsCount(filters = {}, callback) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/audit/logs/count?${query}`,
    onSuccess: params => dispatch => {
      dispatch(setLogsCount(params));
      if (callback) callback();
    },
    label: 'logs',
  });
}

export function getPartner(id, onSucessCallback) {
  return apiAction({
    url: `/partners?ids[]=${[id]}&includeDeleted=1`,
    label: 'partners',
    onSuccess: data => {
      if (onSucessCallback) {
        onSucessCallback(data);
      }
    },
    attribute: {},
  });
}
