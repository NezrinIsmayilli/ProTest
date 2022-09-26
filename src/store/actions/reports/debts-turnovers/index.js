import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setDebtsTurnovers = createAction('setDebtsTurnovers');
export const setDebtsTurnoversCount = createAction('setDebtsTurnoversCount');

export const fetchDebtsTurnovers = (
  filters,
  debtType,
  onSuccessCallback = () => {}
) => {
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/${debtType}?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setDebtsTurnovers(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'debts-turnovers',
  });
};

export const fetchDebtsTurnoversCount = (
  filters,
  debtType,
  onSuccessCallback = () => {}
) => {
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/${debtType}/count?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setDebtsTurnoversCount(data));
      dispatch(onSuccessCallback(data));
    },
    label: 'debts-turnovers',
  });
};
