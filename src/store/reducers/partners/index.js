import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';

import {
  setPartners,
  setSelectedPartner,
  setSelectedPartnerContactInfo,
  setFilteredPartners,
  setSelectedCounterparty,
  setIsCounterpartySelected,
  resetSelectedPartner,
  setTotalCount,
  clearPartners,
} from 'store/actions/partners';

const initialState = {
  filteredPartners: [],
  selectedPartnerContactInfo: {},
  total: 0,
  partners: [],
  selectedPartner: {},
  isCounterpartySelected: false,
  isLoading: false,
  actionLoading: false,
  selectedCounterparty: null,
};

export const partnersReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'partners') {
      return {
        ...state,
        isLoading: true,
      };
    }

    if (action.payload === 'partnersActions') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'partners') {
      return {
        ...state,
        isLoading: false,
      };
    }

    if (action.payload === 'partnersActions') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },
  [setPartners]: (state, action) => ({
    ...state,
    partners: action.payload.data,
  }),
  [setFilteredPartners]: (state, action) => ({
    ...state,
    filteredPartners: action.payload.data,
  }),

  [setSelectedPartnerContactInfo]: (state, action) => ({
    ...state,
    selectedPartnerContactInfo: action.payload.data[0],
  }),
  [setSelectedPartner]: (state, action) => ({
    ...state,
    selectedPartner: action.payload.data[0],
  }),
  [setSelectedCounterparty]: (state, action) => ({
    ...state,
    selectedCounterparty: action.payload,
  }),
  [resetSelectedPartner]: (state, action) => ({
    ...state,
    selectedPartner: {},
  }),
  [setIsCounterpartySelected]: state => ({
    ...state,
    isCounterpartySelected: true,
  }),
  [setTotalCount]: (state, action) => ({
    ...state,
    total: action.payload.data,
  }),
  [clearPartners]: state => ({
    ...state,
    isCounterpartySelected: false,
    selectedCounterparty: null,
  }),
});
