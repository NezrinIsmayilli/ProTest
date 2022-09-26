import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setGoods = createAction('setGoods');
export const setPartnerGoods = createAction('setPartnerGoods');
export const setOrderCart = createAction('setOrderCart');
export const setFilteredOrderCart = createAction('setFilteredOrderCart');
export const setTotalCount = createAction('setTotalCount');
export const clearGoods = createAction('clearGoods');
export const clearPartnerGoods = createAction('clearPartnerGoods');

export function fetchGoods({ filters: { ...filters } }) {
  const query = filterQueryResolver(filters);
  const url = `/partners/products?${query}`;
  return apiAction({
    url,
    label: 'goods',
    onSuccess: data => async dispatch => {
      dispatch(getTotalCount({ query }));
      dispatch(setGoods(data));
    },
    attribute: {},
  });
}

// Filtered Order cart items from goods API
export function fetchFilteredOrders({ filters: { ...filters } }, ids) {
  const idsQuery = filterQueryResolver(ids);
  const query = filterQueryResolver({ ...filters });
  const url = `/partners/products?${idsQuery}&${query}`;
  return apiAction({
    url,
    label: 'goods',
    onSuccess: data => dispatch => {
      dispatch(setFilteredOrderCart(data));
    },
    attribute: {},
  });
}

export function getTotalCount({ query }) {
  const url = `/partners/products/count?${query}`;
  return apiAction({
    url,
    label: 'goods',
    onSuccess: setTotalCount,
    attribute: {},
  });
}
export function fetchPartnerGoods({ filters: { ...filters } }) {
  const query = filterQueryResolver(filters);
  const url = `/partners/products?${query}`;
  return apiAction({
    url,
    label: 'partnerGoods',
    onSuccess: data => async dispatch => {
      dispatch(setPartnerGoods(data));
    },
    attribute: {},
  });
}
