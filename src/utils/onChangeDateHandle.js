// filter date filter handle helper
import moment from 'moment';

export function onChangeDateHandle(
  startDate,
  endDate,
  onFilter,
  filters,
  type
) {
  const from = moment(startDate).format('DD-MM-YYYY');
  const to = moment(endDate).format('DD-MM-YYYY');

  if (type === 1) {
    if (filters.dateFrom !== from) {
      onFilter('dateFrom', from);
    }

    if (filters.dateTo !== to) {
      onFilter('dateTo', to);
    }
  } else {
    if (filters.dateFrom !== from) {
      onFilter('dateOfTransactionStart', from);
    }

    if (filters.dateTo !== to) {
      onFilter('dateOfTransactionEnd', to);
    }
  }
}
