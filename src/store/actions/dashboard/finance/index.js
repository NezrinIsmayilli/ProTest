import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export function fetchDashboardSummary(props = {}) {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/dashboard?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchDashboardSummary',
  });
}

export function fetchRecentOperations(props = {}) {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/invoices?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchRecentOperations',
  });
}
