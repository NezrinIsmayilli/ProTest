import { createReducer } from 'redux-starter-kit';
import { setAppealsCounts, setAppeals } from 'store/actions/jobs/appeals';

const initialState = {
  // counts
  counts: {
    new: 0,
    wait: 0,
    interview: 0,
    result: 0,
  },
};

export const appealsCountsReducer = createReducer(initialState, {
  [setAppealsCounts]: (state, action) => {
    const { open, waiting, interview, result } = action.payload.data;
    return {
      counts: {
        new: open,
        wait: waiting,
        interview,
        result,
      },
    };
  },

  [setAppeals]: (state, action) => ({
    counts: {
      ...state.counts,
      [action.payload.attribute.route]: action.payload.count,
    },
  }),
});
