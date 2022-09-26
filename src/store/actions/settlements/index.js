import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { thisWeekStart, thisWeekEnd } from 'utils';

export const setSettlements = createAction('setSettlements');
export const setOperations = createAction('setOperations');
export const setContactsWhoHasSettlements = createAction(
  'setContactsWhoHasSettlements'
);

export function fetchSettlements({
  query = `startDate=${thisWeekStart}&endDate=${thisWeekEnd}`,
  attribute,
} = {}) {
  return apiAction({
    url: `/settlements/?${query}`,
    onSuccess: setSettlements,
    attribute,
    label: 'settlements',
  });
}

export function fetchOperationsByContact({
  id,
  query = `startDate=${thisWeekStart}&endDate=${thisWeekEnd}`,
} = {}) {
  return apiAction({
    url: `/settlements/contact/${id}/?${query}`,
    onSuccess: setOperations,
    attribute: id,
    label: 'settlements',
  });
}

export function fetchContactsWhoHasSettlements({
  query = `startDate=${thisWeekStart}&endDate=${thisWeekEnd}`,
} = {}) {
  return apiAction({
    url: `/settlements/contacts/?${query}`,
    onSuccess: setContactsWhoHasSettlements,
    // attribute: id,
    label: 'settlements',
  });
}
