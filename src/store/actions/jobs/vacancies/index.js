import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setVacancies = createAction('setVacancies');
export const resetVacanciesData = createAction('resetVacanciesData');
export const resetVacancyData = createAction('resetVacancyData');
export const setVacancy = createAction('setVacancy');
export const setSelectedVacancy = createAction('setSelectedVacancy');

export const setVacancyCounts = createAction('setVacancyCounts');

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROJOBS
    : process.env.REACT_APP_DEV_API_URL_PROJOBS;

export const fetchVacancies = ({ filters = {}, attribute = {} } = {}) => {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `${url}/sdk/vacancies?${query}`,
    onSuccess: setVacancies,
    attribute: { ...attribute, page: filters.page },
    label: 'fetchVacancies',
  });
};

export const fetchVacancyById = id =>
  apiAction({
    url: `${url}/sdk/vacancies/${id}`,
    onSuccess: setVacancy,
    onFailure: resetVacancyData,
    label: 'fetchVacancyById',
  });

export const changeVacancyStatus = (id, filters) =>
  apiAction({
    url: `${url}/sdk/vacancies/${id}/toggle`,
    method: 'PATCH',
    data: { id },
    onSuccess: () => dispatch => {
      dispatch(fetchVacancies({ filters, attribute: { id } }));
    },
    label: 'changeVacancyStatus',
  });

export const deleteVacancyById = (id, filters) =>
  apiAction({
    url: `${url}/sdk/vacancies/${id}`,
    method: 'DELETE',
    onSuccess: () => dispatch => {
      dispatch(fetchVacancies({ filters, attribute: { id } }));
    },
    attribute: { selectedVacancyId: id },
    showToast: true,
    label: 'deleteVacancyById',
  });

export const createVacancies = (
  data,
  onFailureCallback = () => {},
  onSuccessCallback = () => {}
) =>
  apiAction({
    url: `${url}/sdk/vacancies`,
    method: 'POST',
    data,
    onFailure: params => () => {
      onFailureCallback(params);
    },
    onSuccess: onSuccessCallback,
    label: 'createVacancy',
  });

export const editVacancyById = (data, id, onSuccessCallback = () => {}) =>
  apiAction({
    url: `${url}/sdk/vacancies/${id}`,
    method: 'PUT',
    data,
    onSuccess: onSuccessCallback,
    showErrorToast: true,
    label: 'editVacancyById',
  });

export const fetchVacancyCounts = () =>
  apiAction({
    url: `${url}/sdk/vacancies/counts?owner=1`,
    onSuccess: setVacancyCounts,
    label: 'vacancyCounts',
  });
