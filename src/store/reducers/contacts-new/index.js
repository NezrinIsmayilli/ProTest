import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
    setContacts,
    setSuppliers,
    setClients,
    setContact,
    setManufacturers,
    setFilteredContacts,
    setCustomerTypes,
    setContactsCount,
} from 'store/actions/contacts-new';

export const newContactsReducer = createReducer(
    {
        isLoading: false,
        actionIsLoading: false,
        filteredContacts: [],
        contacts: [],
        suppliers: [],
        clients: [],
        manufacturers: [],
        customerTypes: [],
        contact: {},
        total: 0,
    },
    {
        [apiStart]: (state, action) => {
            if (action.payload === 'new-contacts') {
                return {
                    ...state,
                    isLoading: true,
                };
            }
            if (action.payload === 'new-contactsAction') {
                return {
                    ...state,
                    actionIsLoading: true,
                };
            }
        },
        [apiEnd]: (state, action) => {
            if (action.payload === 'new-contacts') {
                return {
                    ...state,
                    isLoading: false,
                };
            }
            if (action.payload === 'new-contactsAction') {
                return {
                    ...state,
                    actionIsLoading: false,
                };
            }
        },
        [setContacts]: (state, action) => ({
            ...state,
            contacts: action.payload.data,
        }),
        [setClients]: (state, action) => ({
            ...state,
            clients: action.payload.data,
        }),
        [setSuppliers]: (state, action) => ({
            ...state,
            suppliers: action.payload.data,
        }),
        [setContact]: (state, action) => ({
            ...state,
            contact: action.payload,
        }),
        [setManufacturers]: (state, action) => ({
            ...state,
            manufacturers: action.payload.data,
        }),
        [setFilteredContacts]: (state, action) => ({
            ...state,
            filteredContacts: action.payload.data,
        }),
        [setCustomerTypes]: (state, action) => ({
            ...state,
            customerTypes: action.payload.data,
        }),
        [setContactsCount]: (state, action) => ({
            ...state,
            total: action.payload.data,
        }),
    }
);
