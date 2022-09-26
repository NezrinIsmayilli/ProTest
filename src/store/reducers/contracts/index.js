import { createReducer } from 'redux-starter-kit';
import moment from 'moment';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setContracts,
  setFilteredContracts,
  setContractsCount,
  setContractInfo,
  contractsFilterHandle,
  setActionResult,
  setContractStatistics,
  resetContracts,
  setContractDocuments,
} from 'store/actions/contracts';

const initialState = {
  contracts: [],
  filteredContracts: [],
  statistics: {},
  contractInfo: undefined,
  contractsCount: 0,
  isLoading: false,
  actionLoading: false,
  added: false,
  edited: false,
};

export const contractsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (
      action.payload === 'contracts' ||
      action.payload === 'filteredContracts'
    ) {
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
    if (
      action.payload === 'contracts' ||
      action.payload === 'filteredContracts'
    ) {
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

  [setContracts]: (state, action) => ({
    ...state,
    contracts: action.payload.data,
    added: action.payload.attribute === 'added',
    edited: action.payload.attribute === 'edited',
  }),

  [setFilteredContracts]: (state, action) => ({
    ...state,
    filteredContracts: action.payload.data,
  }),

  [contractsFilterHandle]: (state, action) => {
    const { filters } = action.payload;

    const {
      signatoryContactId,
      contractTypeId,
      searchValue,
      dateRange,
    } = filters;

    const result = state.contracts.filter(item => {
      let status = true;

      if (signatoryContactId) {
        status = item.signatoryContactId === signatoryContactId;
      }

      if (status && contractTypeId) {
        status = item.contractTypeId === contractTypeId;
      }

      if (status && searchValue) {
        status =
          item.contractTypeName
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          (item.signatoryContactName &&
            item.signatoryContactName
              .toLowerCase()
              .includes(searchValue.toLowerCase()));
      }

      if (status && dateRange) {
        status = moment(item.createdAt, 'DD-MM-YYYY').isBetween(
          moment(dateRange.startDate, 'DD-MM-YYYY'),
          moment(dateRange.endDate, 'DD-MM-YYYY'),
          null,
          '[]'
        );
      }

      return status;
    });
    return {
      ...state,
      filteredContracts: result,
      contractInfo: undefined,
    };
  },

  [setContractInfo]: (state, action) => ({
    ...state,
    contractInfo: action.payload.data,
    added: false,
    edited: false,
  }),

  [setContractStatistics]: (state, action) => ({
    ...state,
    statistics: action.payload.data,
  }),

  [setActionResult]: (state, action) => ({
    ...state,
    added: action.payload.attribute === 'added',
    edited: action.payload.attribute === 'edited',
  }),
  [setContractsCount]: (state, action) => ({
    ...state,
    contractsCount: action.payload.data,
  }),
  [setContractDocuments]: (state, action) => ({
    ...state,
    contractsDoucmnets: action.payload.data,
  }),
  [resetContracts]: () => initialState,
});
