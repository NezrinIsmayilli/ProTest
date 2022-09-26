import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setSalesProfit = createAction('setSalesProfit');
export const setSalesProfitReturned = createAction('setSalesProfitReturned');

export const searchInvoiceHandle = createAction('searchInvoiceHandle');

export function fetchFilteredSalesProfit({ filters }) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/sales/invoices/report/sales-profit?${query}`,
    onSuccess: setSalesProfit,
    label: 'SalesProfit',
  });
}

export function fetchFilteredSalesProfitReturned({ filters }) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/sales/invoices/report/sales-profit-returned-invoices?${query}`,
    onSuccess: setSalesProfitReturned,
    label: 'SalesProfit',
  });
}
