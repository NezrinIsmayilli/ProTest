import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setJobsCountries = createAction('setJobsCountries');
export const setJobsCities = createAction('setJobsCities');
export const setJobsCategories = createAction('setJobsCategories');
export const setJobsPositions = createAction('setJobsPositions');
export const setJobsCurrencies = createAction('setJobsCurrencies');
export const setJobsLanguages = createAction('setJobsLanguages');
export const setJobsSector = createAction('setJobsSector');

// trainings
export const setJobsCategoriesTrainings = createAction(
  'setJobsCategoriesTrainings'
);
export const setJobsDirectionsTrainings = createAction(
  'setJobsDirectionsTrainings'
);

export const setJobsFormats = createAction('setJobsFormats');
export const setJobsStations = createAction('setJobsStations');

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROJOBS
    : process.env.REACT_APP_DEV_API_URL_PROJOBS;

export const fetchCountries = () =>
  apiAction({
    url: `${url}/country`,
    onSuccess: setJobsCountries,
    label: 'country',
  });

export const fetchCities = (country = null) =>
  apiAction({
    url: `${url}/cities`,
    data: { country },
    onSuccess: setJobsCities,
    label: 'cities',
  });

export const fetchSector = () =>
  apiAction({
    url: `${url}/sectors`,
    onSuccess: setJobsSector,
    label: 'sectors',
  });
export const fetchCategories = () =>
  apiAction({
    url: `${url}/category`,
    onSuccess: setJobsCategories,
    label: 'categories',
  });

export const fetchPositions = (category = null, succesCallback = () => {}) =>
  apiAction({
    url: `${url}/sdk/positions`,
    data: { category },
    label: 'positions',
    onSuccess: params => dispatch => {
      dispatch(setJobsPositions(params));
      succesCallback();
    },
  });

export const fetchCurrencies = () =>
  apiAction({
    url: `${url}/currencies`,
    onSuccess: setJobsCurrencies,
    label: 'currencies',
  });

export const fetchLanguages = () =>
  apiAction({
    url: `${url}/languages`,
    onSuccess: setJobsLanguages,
    label: 'languages',
  });

export const integrateWithJobs = (
  succesCallback = () => {},
  failureCallback = () => {}
) =>
  apiAction({
    method: 'POST',
    url: `${url}/integration`,
    onSuccess: () => () => {
      succesCallback();
    },
    onFailure: () => () => {
      failureCallback();
    },
    label: 'integrateWithJobs',
  });

// Trainings
export const fetchCategoriesTrainings = () =>
  apiAction({
    url: `${url}/trainings/categories`,
    onSuccess: setJobsCategoriesTrainings,
    label: 'categories',
  });

export const fetchDirectionsTrainings = (
  category = null,
  succesCallback = () => {}
) =>
  apiAction({
    url: `${url}/trainings/directions`,
    data: { category },
    label: 'direction',
    onSuccess: params => dispatch => {
      dispatch(setJobsDirectionsTrainings(params));
      succesCallback();
    },
  });

export const fetchFormats = () =>
  apiAction({
    url: `${url}/trainings/formats`,
    onSuccess: setJobsFormats,
    label: 'formats',
  });

export const fetchStations = () =>
  apiAction({
    url: `${url}/metrostations`,
    onSuccess: setJobsStations,
    label: 'stations',
  });
