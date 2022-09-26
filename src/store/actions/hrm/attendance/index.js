import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setTimeCard = createAction('setTimeCard');
export const setFilters = createAction('setFilters');
export const setDate = createAction('setDate');
export const setIntialState = createAction('setIntialState');

export const fetchTimeCard = (filters, date, label) => {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/hrm/time-card/by-date/${date}?${query}`,
    onSuccess: setTimeCard,
    label,
  });
};
export const editTimeCard = (data, successCallback) =>
  apiAction({
    url: `/hrm/time-card`,
    method: 'PUT',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    label: 'editTimeCard',
  });
