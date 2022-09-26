import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setContacts = createAction('setContacts');
export const setSuppliers = createAction('setSuppliers');
export const setClients = createAction('setClients');
export const setContact = createAction('setContact');
export const setPersons = createAction('setPersons');
export const setCompanies = createAction('setCompanies');
export const setManufacturers = createAction('setManufacturers');
export const setCustomerTypes = createAction('setCustomerTypes');
export const setFilteredContacts = createAction('setFilteredContacts');
export const setContactsCount = createAction('setContactsCount');

export function getContact(filters, onSucessCallback) {
    const query = filterQueryResolver(filters);
    const url = `/contacts?${query}`;
    return apiAction({
        url,
        label: 'new-contacts',
        onSuccess: data => {
            if (onSucessCallback) {
                onSucessCallback(data);
            }
        },
        attribute: {},
    });
}

export function getContactsInfo(id, onSucessCallback) {
    const url = `/contacts/${id}`;
    return apiAction({
        url,
        onSuccess: data => {
            if (onSucessCallback) {
                onSucessCallback(data);
            }
        },
        attribute: {},
        label: 'new-contactsAction',
    });
}

export function fetchContacts(isPartner = false, filters, onSuccessCallback) {
    const query = filterQueryResolver({ ...filters });
    const url = `/contacts?${isPartner ? 'isPartner=0&' : ''}${query}`;
    return apiAction({
        url,
        label: 'fetchContacts',
        onSuccess: data => dispatch => {
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(data);
            } else {
                dispatch(setContacts(data));
            }
        },
        attribute: {},
    });
}
export function fetchSuppliers(filters = {}, onSuccessCallback) {
    const query = filterQueryResolver(filters);
    const url = `/contacts/suppliers?${query}`;
    return apiAction({
        url,
        label: 'fetchSuppliers',
        onSuccess: data => dispatch => {
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(data);
            } else {
                dispatch(setSuppliers(data));
            }
        },
        attribute: {},
    });
}
export function fetchClients(filters = {}, onSuccessCallback) {
    const query = filterQueryResolver(filters);
    const url = `/contacts/clients?${query}`;
    return apiAction({
        url,
        label: 'fetchClients',
        onSuccess: data => dispatch => {
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(data);
            } else {
                dispatch(setClients(data));
            }
        },
        attribute: {},
    });
}

export function fetchManufacturers(
    filters = {},
    onSuccessCallback = () => {},
    onFailureCallback = () => {}
) {
    const query = filterQueryResolver({ ...filters });
    const url = `/contacts/manufacturers?${query}`;
    return apiAction({
        url,
        label: 'new-contacts',
        onSuccess: data => dispatch => {
            dispatch(setManufacturers(data));
            onSuccessCallback(data);
        },
        attribute: {},
    });
}

export function fetchCustomerTypes(props = {}) {
    const { filters = {}, onSuccessCallback } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/sales/product/productPriceTypes?${query}`,
        label: 'new-contacts',
        onSuccess: data => dispatch => {
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(data);
            } else {
                dispatch(setCustomerTypes(data));
            }  
        },
        attribute: {},
    });
}

export function fetchFilteredContacts({ filters: { ...filters } }, onSuccessCallback) {
///export function fetchFilteredContacts(filters , onSuccessCallback) {
    const query = filterQueryResolver({ ...filters });
    const url = `/contacts?${query}`;
    return apiAction({
        url,
        label: 'new-contacts',
        onSuccess: data => dispatch => {
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(data);
            } else {
                dispatch(getTotalCount({ query }));
                dispatch(setFilteredContacts(data));
            }
            
        },
        attribute: {},
    });
}

export function createContact(data, callback, onFailureCallback) {
    return apiAction({
        url: '/contacts',
        method: 'POST',
        onSuccess: callback,
        onFailure: ({ error }) => {
            if (onFailureCallback) {
                onFailureCallback(error);
            }
        },
        data,
        label: 'newContact',
        showErrorToast: false,
    });
}
export function remove_phone_numbers(filters, callback) {
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/contact-phone-numbers?${query}`,
        method: 'DELETE',
        onSuccess: callback,
        label: 'removePhoneNumber',
    });
}

export function editContact(id, data, callback, onFailureCallback) {
    return apiAction({
        url: `/contacts/${id}`,
        method: 'PUT',
        onSuccess: callback,
        onFailure: ({ error }) => {
            if (onFailureCallback) {
                onFailureCallback(error);
            }
        },
        data,
        label: 'editContact',
        showErrorToast: false,
    });
}

export function getTotalCount({ query }) {
    const url = `/contacts/count?${query}`;
    return apiAction({
        url,
        label: 'new-contacts',
        onSuccess: setContactsCount,
        attribute: {},
    });
}

export function deleteContact(id, callback) {
    return apiAction({
        url: `/contacts/${id}`,
        method: 'DELETE',
        onSuccess: callback,
        showToast: true,
        label: 'new-contactsAction',
    });
}
