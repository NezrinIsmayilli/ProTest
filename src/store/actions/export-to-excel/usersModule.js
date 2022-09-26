import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export function fetchAllUsers(props = {}) {
    const { filters = {}, onSuccessCallback, onFailureCallback } = props;
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/employees?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        attribute: filters,
        label: 'fetchAllUsers',
    });
}
