import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setGoodsTurnovers = createAction('setGoodsTurnovers');
export const setGoodsTurnoversCount = createAction('setGoodsTurnoversCount');
export const setSelectedGoodsTurnoversDetails = createAction(
  'setSelectedGoodsTurnoversDetails'
);

export function fetchGoodsTurnovers({ filters: { ...filters } }) {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/goods-turnover?${query}`;
  return apiAction({
    url,
    label: 'goods-turnovers',
    onSuccess: data => dispatch => {
      dispatch(setGoodsTurnovers(data));
      dispatch(getGoodsTurnoversCount(query));
    },
    attribute: {},
  });
}

export function getGoodsTurnoversCount(query) {
  const url = `/sales/invoices/goods-turnover-count?${query}`;
  return apiAction({
    url,
    label: 'goods-turnovers',
    onSuccess: data => dispatch => {
      dispatch(setGoodsTurnoversCount(data));
    },
    attribute: {},
  });
}

export function fetchGoodsTurnoversDetails(
  dateFrom,
  dateTo,
  stockId,
  productId
) {
  const url = `/sales/invoices/goods-turnover-details/${stockId}/${productId}?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  return apiAction({
    url,
    label: 'goods-turnovers',
    onSuccess: data => dispatch => {
      //  dispatch(getTotalCount({ query }));
      dispatch(setSelectedGoodsTurnoversDetails(data));
    },
    attribute: {},
  });
}
