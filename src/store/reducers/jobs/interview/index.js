import { createReducer } from 'redux-starter-kit';
import { setInterview, resetInterview } from 'store/actions/jobs/interview';
import moment from 'moment';

const initialState = {
  interview: null,
  isInterviewEnd: null,
  canInterviewChange: null,
};

export const interviewReducer = createReducer(initialState, {
  [setInterview]: (state, action) => {
    const { data } = action.payload;
    return {
      ...state,
      interview: data,
      isInterviewEnd: checkInterviewEnd(data),
      canInterviewChange: checkInterviewCanChange(data),
    };
  },
  [resetInterview]: () => initialState,
});

function getEndDate({ meetAt, endTime }) {
  const meetAtSlice = moment(meetAt).format('YYYY-MM-DD'); // 2019-10-26
  const endTimeSlice = moment(endTime).format('HH:mm:ss'); // 17:00:00

  return moment(`${meetAtSlice}T${endTimeSlice}+00:00`); // 2019-10-26T17:00:00+00:00
}

function checkInterviewEnd(data) {
  if (data) {
    // check if interview end time passed from now
    if (moment() > getEndDate(data)) {
      return true;
    }
  }

  return false;
}

function checkInterviewCanChange(data) {
  if (data) {
    const remainDuration = getEndDate(data).diff(moment(), 'hours');

    if (remainDuration > 24) {
      return true;
    }
  }

  return false;
}
