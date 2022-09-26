import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setProfitContracts = createAction(
  'reports/profit-center/setProfitContracts'
);
export const clearProfitAndLoss = createAction(
  'reports/profit-and-loss/clearProfitAndLoss'
);

export const fetchProfitContracts = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/sales/contracts/profit-centers?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setProfitContracts(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchProfitContracts',
  });
};
