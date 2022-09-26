import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const resetCalendarData = createAction('resetCalendarData');
export const setIsEditible = createAction('setIsEditible');
export const setCalendars = createAction('setCalendars');
export const setCalendarNonWorkingDays = createAction(
  'setCalendarNonWorkingDays'
);

export const setSelectedCaledar = createAction('setSelectedCaledar');
export const setSelectedCalendarDay = createAction('setSelectedCalendarDay');
export const changeCalendarSelectedYear = createAction(
  'changeCalendarSelectedYear'
);
export const fetchHRMCalendars = () =>
  apiAction({
    url: '/hrm/calendars',
    onSuccess: setCalendars,
    label: 'fetchHRMCalendars',
  });

export const createHRMCalendar = (data, successCallback) =>
  apiAction({
    url: '/hrm/calendars',
    method: 'POST',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    label: 'createHRMCalendar',
  });

export const editHRMCalendar = (id, data, successCallback) =>
  apiAction({
    url: `/hrm/calendars/${id}`,
    method: 'PUT',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    label: 'editHRMCalendar',
  });

export const deleteHRMCalendarById = (id, successCallback, failureCallback) =>
  apiAction({
    url: `/hrm/calendars/${id}`,
    onSuccess: () => () => {
      successCallback();
    },
    onFailure: () => () => {
      failureCallback();
    },
    method: 'DELETE',
    label: 'deleteHRMCalendarById',
  });

// Non Working days controls
export const fetchCalendarNonWorkingDaysByCalendarId = calendarId =>
  apiAction({
    url: `/hrm/calendar/non-working-days/by-calendar/${calendarId}`,
    onSuccess: setCalendarNonWorkingDays,
    label: 'fetchCalendarNonWorkingDaysByCalendarId',
  });

export const createCalendarNonWorkingDays = (data, successCallback) =>
  apiAction({
    url: '/hrm/calendar/non-working-days',
    method: 'POST',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    showToast: true,
    label: 'createCalendarNonWorkingDay',
  });

export const editCalendarNonWorkingDays = (id, data, successCallback) =>
  apiAction({
    url: `/hrm/calendar/non-working-days/${id}`,
    method: 'PUT',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    showToast: true,
    label: 'editCalendarNonWorkingDay',
  });

export const deleteCalendarNonWorkingDaysById = (id, successCallback) =>
  apiAction({
    url: `/hrm/calendar/non-working-days/${id}`,
    method: 'DELETE',
    onSuccess: () => () => {
      successCallback();
    },
    label: 'deleteCalendarNonWorkingDayById',
  });
