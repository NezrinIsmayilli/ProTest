import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { ErrorMessage, filterQueryResolver } from 'utils';
import { toast } from 'react-toastify';

export const setRoles = createAction('setRoles');
export const setFeatures = createAction('setFeatures');
export const resetRolesFeaturesData = createAction('resetRolesFeaturesData');

export function fetchRoles(props = {}) {
    const { filters = {}, onSuccessCallback } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/authorization/roles?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setRoles(data));
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(data);
            }
        },
        label: 'roleActionsLoading',
    });
}

export function createRole(data) {
    return apiAction({
        url: `/authorization/roles`,
        method: 'POST',
        data,
        onSuccess: fetchRoles,
        onFailure: error => () => {
            const message = ErrorMessage(error);
            toast.error(message);
        },
        showErrorToast: false,
        showToast: true,
        label: 'roleActionsLoading',
    });
}

export function editRoleById(id, data) {
    return apiAction({
        url: `/authorization/roles/${id}`,
        method: 'PUT',
        data,
        onSuccess: fetchRoles,
        onFailure: error => () => {
            const message = ErrorMessage(error);
            toast.error(message);
        },
        showErrorToast: false,
        showToast: true,
        label: 'roleActionsLoading',
    });
}

export function deleteRoleById(id) {
    return apiAction({
        url: `/authorization/roles/${id}`,
        method: 'DELETE',
        onSuccess: fetchRoles,
        showToast: true,
        label: 'roleActionsLoading',
    });
}

// feature permissions
export function fetchFeaturesByRoleId(roleId) {
    return apiAction({
        url: `authorization/roles/${roleId}/features`,
        onSuccess: setFeatures,
        label: 'fetchFeaturesByRoleId',
    });
}

export function changeRolePermissionByRoleId(roleId, data) {
    return apiAction({
        url: `authorization/roles/${roleId}/features`,
        method: 'POST',
        data,
        // onSuccess: setFeatures,
        label: 'changeRolePermissionByRoleId',
    });
}
