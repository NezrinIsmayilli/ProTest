import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setRecievables = createAction('setRecievables');
export const setPayables = createAction('setPayables');
export const setPayablesCount = createAction('setPayablesCount');
export const setRecievablesCount = createAction('setRecievablesCount');

// fetch recievables
export function fetchRecievables(filters) {
    let query = filterQueryResolver(filters);
    if (query.startsWith('&'))
      query = query.substring(1);
  
  return apiAction({
    url: `/transaction/report/recievables?${query}`,
    onSuccess: setRecievables,
    label: 'recievables',
  });
}

// fetch payables
export function fetchPayables(filters) {
    let query = filterQueryResolver(filters);
    if (query.startsWith('&'))
      query = query.substring(1);
  
  return apiAction({
    url: `/transaction/report/payables?${query}`,
    onSuccess: setPayables,
    label: 'payables',
  });
}

export function fetchPayablesCount(filters) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&'))
    query = query.substring(1);

return apiAction({
  url: `/transaction/report/payables/count?${query}`,
  onSuccess: setPayablesCount,
  label: 'payables',
});
}

export function fetchRecievablesCount(filters) {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&'))
    query = query.substring(1);

return apiAction({
  url: `/transaction/report/recievables/count?${query}`,
  onSuccess: setRecievablesCount,
  label: 'recievables',
});
}