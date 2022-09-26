import { createReducer } from 'redux-starter-kit';
import { setActivityAppointmentInfo } from 'store/actions/employeeActivity/employeeActivityAppointment';
import { apiStart, apiEnd } from 'store/actions/api';

export const appointmentReducer = createReducer(
  {
    data: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'employeeActivityAppointments') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'employeeActivityAppointments') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setActivityAppointmentInfo]: (state, action) => ({
      ...state,
      data: action.payload.data,
    }),
  }
);
