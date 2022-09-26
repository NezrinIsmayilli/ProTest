import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setOrderReports = createAction('setOrderReports');
export const setOrderReportsCount = createAction('setOrderReportsCount');
export const setSalesInvoiceList = createAction('setSalesInvoiceList');

export const fetchOrderReports = (
  type,
  filters,
  onSuccessCallback = () => {}
) => {
  const query = filterQueryResolver(filters);
  const url = `/orders/report/${type}?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setOrderReports(data));
      onSuccessCallback(data);
      dispatch(fetchOrderReportsCount(type, filters));
    },
    label: 'order-report',
  });
};
export const fetchOrderReportsCount = (type, filters) => {
  const query = filterQueryResolver(filters);
  const url = `/orders/report/${type}?count=1&${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setOrderReportsCount(data));
    },
    label: 'order-report',
  });
};

export function fetchSalesInvoiceList({
  filters: { ...filters },
  attribute = {},
  onSuccess,
  label = 'setSalesInvoiceList',
}) {
  if (onSuccess === undefined) {
    onSuccess = setSalesInvoiceList;
  }
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `/orders?${query}`,
    onSuccess,
    attribute,
    label,
  });
}