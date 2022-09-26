import { createReducer } from 'redux-starter-kit';
import {
  setJobsCities,
  setJobsSector,
  setJobsCategories,
  setJobsPositions,
  setJobsCurrencies,
  setJobsLanguages,
  setJobsCountries,
  setJobsCategoriesTrainings,
  setJobsDirectionsTrainings,
  setJobsFormats,
  setJobsStations,
} from 'store/actions/jobs/parameters';

const initialState = {
  countries: [],
  cities: [],
  sectors: [],
  categories: [],
  positions: [],
  currencies: [],
  languages: [],

  // trainings
  categoriesTg: [],
  directions: [],
  formats: [],
  stations: [],
};

export const parametersReducer = createReducer(initialState, {
  [setJobsCountries]: (state, action) => ({
    ...state,
    countries: action.payload.data,
  }),

  [setJobsCities]: (state, action) => ({
    ...state,
    cities: action.payload.data,
  }),

  [setJobsSector]: (state, action) => ({
    ...state,
    sectors: action.payload.data,
  }),

  [setJobsCategories]: (state, action) => ({
    ...state,
    categories: action.payload.data,
  }),

  [setJobsPositions]: (state, action) => ({
    ...state,
    positions: action.payload.data,
  }),

  [setJobsCurrencies]: (state, action) => ({
    ...state,
    currencies: action.payload.data,
  }),

  [setJobsLanguages]: (state, action) => ({
    ...state,
    languages: action.payload.data,
  }),

  [setJobsLanguages]: (state, action) => ({
    ...state,
    languages: action.payload.data,
  }),

  // trainings
  [setJobsCategoriesTrainings]: (state, action) => ({
    ...state,
    categoriesTg: action.payload.data,
  }),
  [setJobsDirectionsTrainings]: (state, action) => ({
    ...state,
    directions: action.payload.data,
  }),
  [setJobsFormats]: (state, action) => ({
    ...state,
    formats: action.payload.data,
  }),
  [setJobsStations]: (state, action) => ({
    ...state,
    stations: action.payload.data,
  }),
});
