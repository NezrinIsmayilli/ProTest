import { filterQueryResolver } from 'utils';
import { apiAction } from 'store/actions';

export const fetchSalesPrices = props => {
  const {
    label = 'fetchSalesPrices',
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/sales/prices?${query}`;
  return apiAction({
    url,
    label,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};
