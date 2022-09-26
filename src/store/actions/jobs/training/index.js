import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setTrainings = createAction('setTrainings');
export const resetTrainingsData = createAction('resetTrainingsData');
export const resetTrainingData = createAction('resetTrainingData');
export const setTraining = createAction('setTraining');
export const setSelectedTraining = createAction('setSelectedTraining');

export const setTrainingCounts = createAction('setTrainingCounts');

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROJOBS
    : process.env.REACT_APP_DEV_API_URL_PROJOBS;

export const fetchTrainings = ({ filters = {}, attribute = {} } = {}) => {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `${url}/sdk/trainings?${query}`,
    onSuccess: setTrainings,
    attribute: { ...attribute, page: filters.page },
    label: 'fetchTrainings',
  });
};

export const fetchTrainingById = id =>
  apiAction({
    url: `${url}/sdk/trainings/${id}`,
    onSuccess: setTraining,
    onFailure: resetTrainingData,
    label: 'fetchTrainingById',
  });

export const changeTrainingStatus = (id, filters) =>
  apiAction({
    url: `${url}/sdk/trainings/${id}/toggle`,
    method: 'PATCH',
    data: { id },
    onSuccess: () => dispatch => {
      dispatch(fetchTrainings({ filters, attribute: { id } }));
    },
    label: 'changeTrainingStatus',
  });

export const deleteTrainingById = (id, filters) =>
  apiAction({
    url: `${url}/sdk/trainings/${id}`,
    method: 'DELETE',
    onSuccess: () => dispatch => {
      dispatch(fetchTrainings({ filters, attribute: { id } }));
    },
    attribute: { selectedTrainingId: id },
    showToast: true,
    label: 'deleteTrainingById',
  });

export const createTrainings = (
  data,
  onFailureCallback = () => {},
  onSuccessCallback = () => {}
) =>
  apiAction({
    url: `${url}/sdk/trainings`,
    method: 'POST',
    data,
    onFailure: params => () => {
      onFailureCallback(params);
    },
    onSuccess: onSuccessCallback,
    label: 'createTraining',
  });

export const editTrainingById = (data, id, onSuccessCallback = () => {}) =>
  apiAction({
    url: `${url}/sdk/trainings/${id}`,
    method: 'PUT',
    data,
    onSuccess: onSuccessCallback,
    showErrorToast: true,
    label: 'editTrainingById',
  });

export const fetchTrainingCounts = () =>
  apiAction({
    url: `${url}/sdk/trainings/counts?owner=1`,
    onSuccess: setTrainingCounts,
    label: 'TrainingCounts',
  });
