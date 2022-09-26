import { createReducer } from 'redux-starter-kit';
import { setEmployeeActivities } from 'store/actions/employeeActivity/employeeActivity';

const initialState = {
  employeeActivities: [],
};

export const employeeActivitiesReducer = createReducer(initialState, {
  [setEmployeeActivities]: (state, action) => {
    return {
      ...state,
      employeeActivities: action.payload.data,
    };
  },
});
