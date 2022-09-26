import { createReducer } from 'redux-starter-kit';
import { setVacancyCounts, setVacancies } from 'store/actions/jobs/vacancies';

const initialState = {
  // counts
  counts: {
    waiting: 0,
    active: 0,
    disabled: 0,
  },
};

export const vacancyCountsReducer = createReducer(initialState, {
  [setVacancyCounts]: (state, action) => {
    const { waiting, active, disabled } = action.payload.data;

    return {
      counts: {
        waiting,
        active,
        disabled,
      },
    };
  },

  [setVacancies]: (state, action) => ({
    counts: {
      ...state.counts,
      [action.payload.attribute.route]: action.payload.count,
    },
  }),
});
