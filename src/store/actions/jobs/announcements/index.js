import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setAnnouncements = createAction('setAnnouncements');
export const resetAnnouncementsData = createAction('resetAnnouncementsData');
export const resetAnnouncementData = createAction('resetAnnouncementData');
export const setAnnouncement = createAction('setAnnouncement');
export const setSelectedAnnouncement = createAction('setSelectedAnnouncement');
export const bookmarksToggleOnSuccessAction = createAction(
  'bookmarksToggleOnSuccessAction'
);

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROJOBS
    : process.env.REACT_APP_DEV_API_URL_PROJOBS;

const url = `${baseUrl}/sdk/announcements`;

export const fetchAnnouncements = ({ filters = {} } = {}) => {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `${url}/?${query}`,
    onSuccess: setAnnouncements,
    attribute: { page: filters.page },
    label: 'fetchAnnouncements',
  });
};

export const addToBookmarks = (id, onSuccessCallback, onFailureCallback) =>
  apiAction({
    url: `${url}/${id}/bookmarks`,
    method: 'PUT',
    attribute: { id },
    onSuccess: onSuccessCallback,
    onFailure: onFailureCallback,
    label: 'bookmarksAction',
  });

export const removeFromBookmarks = (id, onSuccessCallback, onFailureCallback) =>
  apiAction({
    url: `${url}/${id}/bookmarks`,
    method: 'DELETE',
    attribute: { id },
    onSuccess: onSuccessCallback,
    onFailure: onFailureCallback,
    label: 'bookmarksAction',
  });

export const fetchAnnouncementById = id =>
  apiAction({
    url: `${url}/${id}`,
    onSuccess: setAnnouncement,
    label: 'fetchAnnouncementById',
  });
