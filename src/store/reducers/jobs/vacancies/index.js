import { createReducer } from 'redux-starter-kit';
import {
  setVacancies,
  setVacancy,
  resetVacanciesData,
  resetVacancyData,
  setSelectedVacancy,
} from 'store/actions/jobs/vacancies';

const initialState = {
  vacancies: [],
  selectedVacancy: null,
  vacancy: null,

};

export const vacanciesReducer = createReducer(initialState, {
  [setVacancies]: (state, action) => {
    const { page } = action.payload.attribute;

    if (page) {
      return {
        ...initialState,
        vacancies: action.payload.data,
      };
    }

    return {
      ...state,
      vacancies: [...state.vacancies, ...action.payload.data],

    };
  },

  [setVacancy]: (state, action) => ({
    ...state,
    vacancy: action.payload.data,
  }),

  [setSelectedVacancy]: (state, action) => ({
    ...state,
    selectedVacancy: action.payload,
  }),

  [resetVacanciesData]: () => initialState,

  [resetVacancyData]: state => ({
    ...state,
    vacancy: null,
  }),
});
