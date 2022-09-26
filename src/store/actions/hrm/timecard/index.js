import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setTimecardReportArchive = createAction(
  'setTimecardReportArchive'
);

export const setArchiveEmployees = createAction('setArchiveEmployees');
export const setSelectedArchive = createAction('setSelectedArchive');
export const setSelectedYear = createAction('setSelectedYear');
export const setSelectedMonth = createAction('setSelectedMonth');
export const setSelectedEmployee = createAction('setSelectedEmployee');

export const resetTimecardData = createAction('resetTimecardData');

// Timecard_report_archive - Get
export const fetchTimecardReportArchive = () =>
  apiAction({
    url: `/hrm/report-archive/timecard`,
    onSuccess: setTimecardReportArchive,
    label: 'fetchTimecardReportArchive',
  });

// Timecard_report_archive - Create;
export const createTimecardReportArchive = (data, successCallback) =>
  apiAction({
    url: `/hrm/report-archive/timecard`,
    method: 'POST',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    label: 'createTimecardReportArchive',
  });

// Timecard_report_archive - Edit
export const editTimecardReportArchive = (data, id, successCallback) =>
  apiAction({
    url: `/hrm/report-archive/timecard/${id}`,
    method: 'PUT',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    label: 'editTimecardReportArchive',
  });

// Timecard_report_archive - Delete
export const deleteTimecardReportArchive = (
  id,
  successCallback,
  failureCallback
) =>
  apiAction({
    url: `hrm/report-archive/timecard/${id}`,
    onSuccess: () => () => {
      successCallback();
    },
    onFailure: () => () => {
      failureCallback();
    },
    method: 'DELETE',
    label: 'deleteTimecardReportArchive',
  });

// Timecard_report_archive - Get employees of an archive
export const fetchArchiveEmployees = id =>
  apiAction({
    url: `/hrm/report-archive/employee-timecard/by-archive/${id}`,
    onSuccess: setArchiveEmployees,
    label: 'fetchArchiveEmployees',
  });

// Timecard_report_archive - Delete employee from an archive
export const deleteArchiveEmployee = (id, successCallback) =>
  apiAction({
    url: `/hrm/report-archive/employee-timecard/${id}`,
    method: 'DELETE',
    onSuccess: () => () => {
      successCallback();
    },
    label: 'deleteArchiveEmployee',
  });

// Get timecard report by year and month
export const fetchTimecardArchivesByDate = (year, month, filters) => {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/hrm/report/timecard/${year}/${month}?${query}`,
    onSuccess: setArchiveEmployees,
    label: 'fetchTimecardArchivesByDate',
  });
};
export const editTimecardEvent = (id, data, successCallback, failureCallback) =>
  apiAction({
    url: `/hrm/report-archive/employee-event-timecard/${id}`,
    method: 'PUT',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    onFailure: () => () => {
      failureCallback();
    },
    label: 'editTimecardEvent',
  });
