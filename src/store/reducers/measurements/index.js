import { createReducer } from 'redux-starter-kit';
import { setMeasurements } from 'store/actions/measurements';

const initialState = {
  measurements: [],
};

export const measurementsReducer = createReducer(initialState, {
  [setMeasurements]: (state, action) => ({
    ...state,
    measurements: action.payload.data,
  }),
});
