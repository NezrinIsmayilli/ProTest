import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setIsCounterpartySelected = createAction(
  'setIsCounterpartySelected'
);
export const setPartners = createAction('setPartners');
export const setSelectedPartner = createAction('setSelectedPartner');
export const resetSelectedPartner = createAction('resetSelectedPartner');

export const setSelectedPartnerContactInfo = createAction(
  'setSelectedPartnerContactInfo'
);
export const setFilteredPartners = createAction('setFilteredPartners');
export const setSelectedCounterparty = createAction('setSelectedCounterparty');
export const setTotalCount = createAction('setTotalCount');
export const clearPartners = createAction('clearPartners');

export function getPartnerContactInformation(id) {
  return apiAction({
    url: `/contacts?ids[]=${[id]}`,
    label: 'partners',
    onSuccess: setSelectedPartnerContactInfo,
    attribute: {},
  });
}
export function getPartner(id) {
  return apiAction({
    url: `/partners?ids[]=${[id]}`,
    label: 'partners',
    onSuccess: setSelectedPartner,
    attribute: {},
  });
}

export function fetchPartners() {
  return apiAction({
    url: `/partners?limit=1000`,
    label: 'partners',
    onSuccess: setPartners,
    attribute: {},
  });
}

export function editPartner({
  id,
  data,
  callback,
  onFailure = () => {},
  showToast = true,
}) {
  return apiAction({
    url: `/partners/${id}`,
    method: 'PUT',
    onSuccess: callback,
    data,
    showToast,
    showErrorToast: false,
    onFailure,
    label: 'partnersActions',
  });
}
export function deletePartner(id, callback) {
  return apiAction({
    url: `/partners/${id}`,
    method: 'DELETE',
    onSuccess: callback,
    showToast: true,
    label: 'partnersActions',
  });
}

export function fetchFilteredPartners({ filters: { ...filters } }) {
  const query = filterQueryResolver({ ...filters });
  const url = `/partners?${query}`;
  return apiAction({
    url,
    label: 'partners',
    onSuccess: data => dispatch => {
      dispatch(getPartnersCount({ query }));
      dispatch(setFilteredPartners(data));
    },
    attribute: {},
  });
}
export function getPartnersCount({ query }) {
  const url = `/partners-count?${query}`;
  return apiAction({
    url,
    label: 'partners',
    onSuccess: setTotalCount,
    attribute: {},
  });
}

export function createPartner(data, callback = () => {}, onFailure = () => {}) {
  return apiAction({
    url: '/partners',
    method: 'POST',
    onSuccess: callback,
    data,
    label: 'partnersActions',
    showToast: true,
    showErrorToast: false,
    onFailure,
  });
}
