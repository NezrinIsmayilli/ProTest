import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setWorkScheduleDays = createAction('setWorkScheduleDays');

export function fetchWorkScheduleDays(workScheduleId) {
  return apiAction({
    url: `/hrm/work-schedules/days/${workScheduleId}`,
    onSuccess: setWorkScheduleDays,
    label: 'fetchWorkScheduleDays',
  });
}

export function createWorkScheduleDays(data) {
  return apiAction({
    url: '/hrm/work-schedules/days',
    method: 'POST',
    data,
    onSuccess: () => dispatch => {
      dispatch(fetchWorkScheduleDays(data.workSchedule));
    },
    showToast: true,
    label: 'createWorkScheduleDays',
  });
}
