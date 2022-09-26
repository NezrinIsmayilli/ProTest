import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setContacts,
  setContactInfo,
  filterHandle,
  setSuppliers,
  setClients,
  setManufacturers,
} from 'store/actions/relations';

const initialState = {
  contacts: [],
  suppliers: [],
  clients: [],
  manufacturers: [],
  filteredContacts: [],
  contactInfo: undefined,
  isLoading: false,
  actionLoading: false,
  added: false,
  edited: false,
};

export const contactsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'contacts') {
      return {
        ...state,
        isLoading: true,
      };
    }
    if (action.payload === 'action') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'contacts') {
      return {
        ...state,
        isLoading: false,
      };
    }
    if (action.payload === 'action') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setContacts]: (state, action) => ({
    ...state,
    contacts: action.payload.data,
    filteredContacts: action.payload.data,
  }),

  [setSuppliers]: (state, action) => ({
    ...state,
    suppliers: action.payload.data,
  }),

  [setManufacturers]: (state, action) => ({
    ...state,
    manufacturers: action.payload.data,
  }),

  [filterHandle]: (state, action) => {
    const { filters } = action.payload;

    const result = state.contacts.filter(item => {
      let status = true;

      if (filters.type) {
        status = item.type === filters.type;
      }

      if (status && filters.status) {
        status = item.status === filters.status;
      }

      if (status && filters.searchValue) {
        status =
          item.name
            ?.toLowerCase()
            .includes(filters.searchValue?.toLowerCase()) ||
          item.surname
            ?.toLowerCase()
            .includes(filters.searchValue?.toLowerCase()) ||
          item.chiefName
            ?.toLowerCase()
            .includes(filters.searchValue?.toLowerCase()) ||
          item.chiefLastName
            ?.toLowerCase()
            .includes(filters.searchValue?.toLowerCase());
      }

      return status;
    });
    return {
      ...state,
      filteredContacts: result,
    };
  },
  [setContactInfo]: (state, action) => ({
    ...state,
    contactInfo: action.payload.data,
  }),
  [setClients]: (state, action) => ({
    ...state,
    clients: action.payload.data,
  }),
});
