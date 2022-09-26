import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setSalesReports = createAction('setSalesReports');
export const setSalesReportsCount = createAction('setSalesReportsCount');

export const fetchSalesReports = (
  type,
  filters,
  onSuccessCallback = () => {}
) => {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/${type}?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setSalesReports(data));
      dispatch(fetchSalesReportsCount(type, filters));
      onSuccessCallback(data);
    },
    label: 'fetchSalesReports',
  });
};

export const fetchSalesReportsCount = (type, filters) => {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/${type}-count?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      dispatch(setSalesReportsCount(data));
    },
    label: 'sales-report',
  });
};
