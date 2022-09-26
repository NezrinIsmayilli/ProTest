import { createReducer } from 'redux-starter-kit';
import {
  setTrainings,
  setTraining,
  resetTrainingsData,
  resetTrainingData,
  setSelectedTraining,
} from 'store/actions/jobs/training';

const initialState = {
  trainings: [],
  selectedTrainings: null,
  training: null,
};

export const trainingsReducer = createReducer(initialState, {
  [setTrainings]: (state, action) => {
    const { page } = action.payload.attribute;

    if (page) {
      return {
        ...initialState,
        trainings: action.payload.data,
        counts: action.payload.count,
      };
    }

    return {
      ...state,
      trainings: [...state.trainings, ...action.payload.data],
      counts: [...state.counts, ...action.payload.count],
    };
  },

  [setTraining]: (state, action) => ({
    ...state,
    training: action.payload.data,
  }),

  [setSelectedTraining]: (state, action) => ({
    ...state,
    selectedTrainings: action.payload,
  }),

  [resetTrainingsData]: () => initialState,

  [resetTrainingData]: state => ({
    ...state,
    training: null,
  }),
});
