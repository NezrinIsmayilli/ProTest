import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setOffline = createAction('setOffline');
const url =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_URL_PROCALL
        : process.env.REACT_APP_DEV_API_URL_PROCALL;

export function fetchOfflineOperators(props = {}) {
    const { filter, onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `${url}/statuses?rt=1&statuses[]=2${filter || ''}`,
        onSuccess: data => dispatch => {
            dispatch(setOffline(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'offlineUsers',
    });
}
