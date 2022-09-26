import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export function fetchAllFilteredContacts(
    { filters: { ...filters },onSuccessCallback }
) {
    const query = filterQueryResolver({ ...filters });
    const url = `/contacts?${query}`;
    return apiAction({
        url,
        label: 'all-new-contacts',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        attribute: filters,
    });
};

export function fetchAllFilteredPartners({ filters: { ...filters },onSuccessCallback }) {
    const query = filterQueryResolver({ ...filters });
    const url = `/partners?${query}`;
    return apiAction({
      url,
      label: 'all-partners',
      onSuccess: data => dispatch => {
        if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
      attribute: {},
    });
  }