import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setGateways = createAction('setGateways');

const url =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_URL_PROCALL
        : process.env.REACT_APP_DEV_API_URL_PROCALL;

export function fetchGateways(props = {}) {
    const { onFailureCallback, onSuccessCallback } = props;
    return apiAction({
        url: `${url}/gateways`,
        onSuccess: data => dispatch => {
            dispatch(setGateways(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchGateways',
    });
}

export function editGateways(
    id,
    data,
    onSuccess = () => { },
    onFailure = () => { }
) {
    return apiAction({
        url: `${url}/gateways/${id}`,
        onSuccess: params => dispatch => {
            dispatch(onSuccess(data));
        },
        onFailure: error => dispatch => {
            dispatch(onFailure(error));
        },
        method: 'PUT',
        data,
        showToast: false,
        showErrorToast: false,
        attribute: 'edited',
        label: 'action',
    });
}
export function createGateways(
    data,
    onSuccess = () => { },
    onFailure = () => { }
) {
    return apiAction({
        url: `${url}/gateways`,
        onSuccess,
        onFailure: error => dispatch => {
            dispatch(onFailure(error));
        },
        method: 'POST',
        data,
        showToast: false,
        showErrorToast: false,
        attribute: 'added',
        label: 'action',
    });
}
export function fetchSelectedGateway(props = {}) {
    const { id, onFailureCallback, onSuccessCallback } = props;
    return apiAction({
        url: `${url}/gateways/${id}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'action',
    });
}
export function toggleGateways(
    id,
    value,
    onSuccess = () => { },
    onFailure = () => { }
) {
    return apiAction({
        url: `${url}/gateways/${id}/${value ? 'activate' : 'deactivate'}`,
        onSuccess,
        onFailure,
        method: 'PUT',
        showToast: false,
        showErrorToast: false,
        attribute: 'added',
        label: 'toggleIvr',
    });
}
export function deleteGateways(id, onSuccess = () => { }) {
    return apiAction({
        url: `${url}/gateways/${id}`,
        method: 'DELETE',
        onSuccess,
        showToast: true,
        label: 'ivr',
    });
}
