import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setInterview = createAction('setInterview');
export const resetInterview = createAction('resetInterview');

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROJOBS
    : process.env.REACT_APP_DEV_API_URL_PROJOBS;

export const fetchInterviewById = id =>
  apiAction({
    url: `${url}/interviews/${id}`,
    onSuccess: setInterview,
    label: 'fetchInterviewById',
  });

export const createInterview = (id, type, data, cb) =>
  apiAction({
    url: `${url}/sdk/${type}/${id}/interviews`,
    method: 'POST',
    data,
    onSuccess: () => () => {
      cb();
    },
    label: 'createInterview',
  });

export const editInterview = (id, data, callback) =>
  apiAction({
    url: `${url}/sdk/interviews/${id}`,
    method: 'PUT',
    data,
    onSuccess: params => () => {
      callback(params.data);
    },
    label: 'editInterview',
  });

export const agreeInterview = (id, callback = () => {}) =>
  apiAction({
    url: `${url}/interviews/${id}/agree`,
    method: 'POST',
    data: { id },
    onSuccess: () => () => {
      callback();
    },
    label: 'agreeInterview',
  });

export const resultInterview = (id, data, callback) =>
  apiAction({
    url: `${url}/sdk/interviews/${id}/result`,
    method: 'POST',
    data,
    onSuccess: params => () => {
      callback(params.data);
    },
    label: 'resultInterview',
  });
