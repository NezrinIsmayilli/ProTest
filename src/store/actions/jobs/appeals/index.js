import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setAppeals = createAction('setAppeals');
export const setSelectedAppeal = createAction('setSelectedAppeal');
export const resetAppealsData = createAction('resetAppealsData');

export const setPerson = createAction('setPerson');
export const setAppealOrigin = createAction('setAppealOrigin');
export const setAppealHistories = createAction('setAppealHistories');

export const setAppealsCounts = createAction('setAppealsCounts');

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROJOBS
    : process.env.REACT_APP_DEV_API_URL_PROJOBS;

export const fetchAppeals = ({ filters = {}, attribute = {} } = {}) => {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `${url}/appeals?${query}`,
    onSuccess: setAppeals,
    attribute: { ...attribute, page: filters.page },
    label: 'fetchAppeals',
  });
};

export const fetchPersonById = id =>
  apiAction({
    url: `${url}/persons/${id}`,
    onSuccess: setPerson,
    label: 'fetchPersonById',
  });

export const fetchAppealOriginById = (id, origin) =>
  apiAction({
    url: `${url}/${origin}/${id}`,
    onSuccess: setAppealOrigin,
    // onFailure: resetVacancyData,
    label: 'fetchAppealOriginById',
  });

export const rejectAppeal = (id, data, cb) =>
  apiAction({
    url: `${url}/appeals/${id}/reject`,
    method: 'POST',
    data,
    label: 'rejectAppeal',
    onSuccess: () => () => {
      cb();
    },
  });

export const rejectAppealAll = (data, cb) =>
  apiAction({
    url: `${url}/sdk/appeals/reject`,
    method: 'POST',
    data,
    label: 'rejectAppealAll',
    onSuccess: () => () => {
      cb();
    },
  });

export const fetchAppealHistories = id =>
  apiAction({
    url: `${url}/appeals/${id}/histories`,
    onSuccess: setAppealHistories,
    label: 'fetchAppealHistories',
  });

export const fetchAppealsCounts = () =>
  apiAction({
    url: `${url}/appeals/counts`,
    onSuccess: setAppealsCounts,
    label: 'appealsCounts',
  });
