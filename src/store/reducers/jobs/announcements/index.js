import { createReducer } from 'redux-starter-kit';

import {
  setAnnouncements,
  resetAnnouncementsData,
  resetAnnouncementData,
  setAnnouncement,
  setSelectedAnnouncement,
} from 'store/actions/jobs/announcements';

const initialState = {
  announcements: [],
  selectedAnnouncement: null,
  announcement: null,
  counts: 0,
};

export const announcementsReducer = createReducer(initialState, {
  [setAnnouncements]: (state, action) => {
    const { page } = action.payload.attribute;

    // is first page or filter selected
    if (page) {
      return {
        ...initialState,
        announcements: action.payload.data,
        counts: action.payload.count,
      };
    }

    return {
      ...state,
      announcements: [...state.announcements, ...action.payload.data],
      counts: [...state.counts, ...action.payload.count],
    };
  },

  [setAnnouncement]: (state, action) => ({
    ...state,
    announcement: action.payload.data,
  }),

  [setSelectedAnnouncement]: (state, action) => ({
    ...state,
    selectedAnnouncement: action.payload,
  }),

  [resetAnnouncementsData]: () => initialState,

  [resetAnnouncementData]: state => ({
    ...state,
    announcement: null,
  }),
});
