import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setContacts = createAction('setContacts');
export const setManufacturers = createAction('setManufacturers');
export const setSuppliers = createAction('setSuppliers');
export const setContactInfo = createAction('setContactInfo');
export const filterHandle = createAction('filterHandle');
export const setClients = createAction('setClients');

// get suppliers
export function fetchSuppliers() {
  return apiAction({
    url: '/contacts/suppliers',
    onSuccess: setSuppliers,
    label: 'contacts',
  });
}

// manufacturers
export function fetchManufacturers() {
  return apiAction({
    url: '/contacts/manufacturers',
    onSuccess: setManufacturers,
    label: 'contacts',
  });
}

// GET - Contacts
export function fetchContacts({ attribute, filters } = {}) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/contacts?${query}`,
    onSuccess: setContacts,
    attribute,
    label: 'fetchContacts',
  });
}

// Company
export function fetchCompany(id) {
  return apiAction({
    url: `/contacts/company/${id}`,
    onSuccess: setContactInfo,
    attribute: id,
    label: 'contacts',
  });
}

export function createCompanyContact(closeDrawer, data) {
  return apiAction({
    url: '/contacts/company',
    method: 'POST',
    data,
    onSuccess: params => dispatch => {
      dispatch(fetchContacts(params));
      closeDrawer();
    },
    attribute: 'added',
    label: 'action',
  });
}

export function editCompanyContact(id, closeDrawer, data) {
  return apiAction({
    url: `/contacts/company/${id}`,
    method: 'PUT',
    data,
    onSuccess: params => dispatch => {
      dispatch(fetchContacts(params));
      closeDrawer();
    },
    attribute: 'edited',
    label: 'action',
  });
}

// Individual
export function fetchIndividual(id) {
  return apiAction({
    url: `/contacts/individual/${id}`,
    onSuccess: setContactInfo,
    attribute: id,
    label: 'contacts',
  });
}

export function createIndividualContact(closeDrawer, data) {
  return apiAction({
    url: '/contacts/individual',
    method: 'POST',
    data,
    onSuccess: params => dispatch => {
      dispatch(fetchContacts(params));
      closeDrawer();
    },
    attribute: 'added',
    label: 'action',
  });
}

export function editIndividualContact(id, closeDrawer, data) {
  return apiAction({
    url: `/contacts/individual/${id}`,
    method: 'PUT',
    data,
    onSuccess: params => dispatch => {
      dispatch(fetchContacts(params));
      closeDrawer();
    },
    attribute: 'edited',
    label: 'action',
  });
}

// DElete contact by id
export function deleteContact(id) {
  return apiAction({
    url: `/contacts/${id}`,
    method: 'DELETE',
    onSuccess: fetchContacts,
    showToast: true,
    attribute: id,
    label: 'contacts',
  });
}

export function fetchClients({ attribute } = {}) {
  return apiAction({
    url: 'contacts/clients',
    onSuccess: setClients,
    attribute,
    label: 'contacts',
  });
}
