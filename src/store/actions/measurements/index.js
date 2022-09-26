import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setMeasurements = createAction('setMeasurements');

export function fetchMeasurements(filters = {}, onSuccessCallback) {
    const query = filterQueryResolver(filters);
    const url = `/sales/product/unitOfMeasurements?${query}`;

    return apiAction({
        url,
        label: 'fetchMeasurements',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
            dispatch(setMeasurements(data));
        },
        attribute: {},
    });
}
