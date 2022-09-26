import { createReducer } from 'redux-starter-kit';
import {
  setAppeals,
  setSelectedAppeal,
  resetAppealsData,
  setPerson,
  setAppealHistories,
  setAppealOrigin,
} from 'store/actions/jobs/appeals';

const initialState = {
  appeals: {
    wait: [],
    new: [],
    interview: [],
    result: [],
  },
  selectedAppeal: null,
  person: null,
  appealOrigin: null,
  histories: [],
  canLoadMore: false,
};

export const appealsReducer = createReducer(initialState, {
  [setAppeals]: (state, action) => {
    const { page, route } = action.payload.attribute;

    // const dataLength = action.payload.data.length;

    // const canLoadMore = !(dataLength === 0);

    if (page) {
      return {
        ...initialState,
        appeals: {
          ...initialState.appeals,
          [route]: action.payload.data,
        },
        // canLoadMore: dataLength >= 20,
      };
    }

    return {
      ...state,
      // canLoadMore,
      appeals: {
        ...state.appeals,
        [route]: [...state.appeals[route], ...action.payload.data],
      },
    };
  },

  [setAppealHistories]: (state, action) => ({
    ...state,
    histories: action.payload.data,
  }),

  [setPerson]: (state, action) => ({
    ...state,
    person: action.payload.data,
  }),

  [setAppealOrigin]: (state, action) => ({
    ...state,
    appealOrigin: action.payload.data,
  }),

  [setSelectedAppeal]: (state, action) => ({
    ...state,
    selectedAppeal: action.payload,
  }),

  [resetAppealsData]: () => initialState,
});
