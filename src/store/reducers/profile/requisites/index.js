import { createReducer } from 'redux-starter-kit';
import { setRequisitesData } from 'store/actions/profile/requisites';

const initialState = {
  requisitesData: [],
};

export const requisitesReducer = createReducer(initialState, {
  [setRequisitesData]: (state, action) => ({
    ...state,
    requisitesData: action.payload.data,
  }),
});
