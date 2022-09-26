import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setExpenseReport = createAction('setExpenseReport');
export const resetExpenseReport = createAction('resetExpenseReport');
export const setSelectedExpenseItem = createAction('setSelectedExpenseItem');

export function fetchExpenseReport({ filters }) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/sales/report/expense?${query}`,
    onSuccess: setExpenseReport,
    attribute: filters,
    label: 'expenseReport',
  });
}
