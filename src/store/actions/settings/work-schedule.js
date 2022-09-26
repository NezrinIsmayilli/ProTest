import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setWorkSchedulesCall = createAction('setWorkSchedulesCall');
const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchWorkSchedulesCall(props = {}) {
  const { onFailureCallback, onSuccessCallback } = props;
  return apiAction({
    url: `${url}/tenants/getMe`,
    onSuccess: data => dispatch => {
      dispatch(setWorkSchedulesCall(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchWorkSchedulesCall',
  });
}
export function editWorkSchedule(
  data,
  onSuccess = () => {},
  onFailure = () => {}
) {
  return apiAction({
    url: `${url}/tenants`,
    onSuccess: params => dispatch => {
      dispatch(onSuccess(data));
    },
    onFailure,
    method: 'PUT',
    data,
    showToast: true,
    attribute: 'edited',
    label: 'action',
  });
}
