import { createSelector } from 'reselect';
import { groupByKey } from 'utils';

export const getVacanciesCount = createSelector(
  state => state.vacanciesReducer.vacancies.length,
  vacanciesLength => (vacanciesLength > 0 ? vacanciesLength : '')
);

export const getGroupedByTypeCashboxNames = createSelector(
  state => state.kassaReducer.allCashBoxNames,
  allCashBoxNames => groupByKey(allCashBoxNames, 'type')
);
