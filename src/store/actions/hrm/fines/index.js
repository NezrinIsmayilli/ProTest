import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

import { filterQueryResolver } from 'utils';

// settings
export const setFinesSettings = createAction('setFinesSettings');

export const fetchFinesSettings = () =>
  apiAction({
    url: `/hrm/attendance/settings`,
    onSuccess: setFinesSettings,
    label: 'fetchFinesSettings',
  });

export const editFinesSettings = (data, year, month, filters) =>
  apiAction({
    url: `/hrm/attendance/settings`,
    method: 'POST',
    onSuccess: params => dispatch => {
      dispatch(fetchFinesSettings(params));
      dispatch(fetchHrmPenalties({ year, month, filters }));
    },
    data,
    label: 'editFinesSettings',
  });

// fines main
export const resetHrmFinesData = createAction('resetHrmFinesData');
export const setHrmPenalties = createAction('setHrmPenalties');
export const setSelectedPerson = createAction('setSelectedPerson');

export const fetchHrmPenalties = ({
  year,
  month,
  filters = {},
  attribute = {},
} = {}) => {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/hrm/report/lateness-penalties/${year}/${month}?${query}`,
    onSuccess: setHrmPenalties,
    attribute,
    label: 'fetchHrmPenalties',
  });
};

// toggle true-false
export const editHrmPenaltiesApply = data =>
  apiAction({
    url: `/hrm/employee-lateness-penalty-period`,
    method: 'POST',
    data,
    label: 'editHrmPenaltiesApply',
  });

export const addManualPenalty = (data, onSuccess = () => {}) =>
  apiAction({
    url: `/hrm/attendance/employee-manual-lateness-penalties`,
    method: 'POST',
    data,
    onSuccess,
    label: 'hrmManualPenalty',
  });

export const deleteManualPenaltyById = (id, onSuccess = () => {}) =>
  apiAction({
    url: `/hrm/attendance/employee-manual-lateness-penalties/${id}`,
    method: 'DELETE',
    onSuccess,
    label: 'hrmManualPenalty',
  });
