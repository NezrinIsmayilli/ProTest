import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setCallRoles = createAction('settings/order-roles');
export const setOrderRegulations = createAction('settings/order-regulations');
const url =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_URL_PROCALL
        : process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchCallRoles(props = {}) {
    const { onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `${url}/operators/roles`,
        onSuccess: data => dispatch => {
            dispatch(setCallRoles(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onSuccessCallback(error));
        },
        label: 'fetchCallRoles',
    });
}

export const createCallRole = (props = {}) => {
    const { data, onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `${url}/operators/roles`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        data,
        label: 'createCallRole',
    });
};

export const deleteCallRole = (props = {}) => {
    const {
        id,
        label = 'deleteCallRole',
        onSuccessCallback,
        onFailureCallback,
    } = props;

    return apiAction({
        url: `${url}/operators/roles/${id}`,
        method: 'DELETE',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showToast: true,
        showErrorToast: false,
        label,
    });
};

export function fetchSipSettings(props = {}) {
    const { id, onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `${url}/operators/${id}/credentials`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'fetchSipSettings',
    });
}

// export function fetchStageRoleExecutors(props = {}) {
//   const { onSuccessCallback, onFailureCallback } = props;
//   return apiAction({
//     url: '/orders/stage-role-executors',
//     onSuccess: data => dispatch => {
//       dispatch(setOrderRegulations(data));
//       if (onSuccessCallback) dispatch(onSuccessCallback(data));
//     },
//     onFailure: error => dispatch => {
//       if (onFailureCallback) dispatch(onSuccessCallback(error));
//     },
//     label: 'fetchStageRoleExecutors',
//   });
// }

// export const updateStageRoleExecutors = (props = {}) => {
//   const { data, onSuccessCallback, onFailureCallback } = props;
//   return apiAction({
//     url: '/orders/stage-role-executors',
//     method: 'PUT',
//     onSuccess: data => dispatch => {
//       if (onSuccessCallback) dispatch(onSuccessCallback(data));
//     },
//     onFailure: error => dispatch => {
//       if (onFailureCallback) dispatch(onFailureCallback(error));
//     },
//     data,
//     label: 'updateStageRoleExecutors',
//   });
// };
