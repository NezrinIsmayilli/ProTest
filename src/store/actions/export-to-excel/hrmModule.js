import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export function fetchAllFilteredReports(
    year,
    month,
    { filters, onSuccessCallback, onFailureCallback }
) {
    const query = filterQueryResolver(filters);

    return apiAction({
        url: `/hrm/report/payroll/${year}/${month}?${query}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) {
                dispatch(onSuccessCallback(data));
            }
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'ExcelReports',
    });
}
