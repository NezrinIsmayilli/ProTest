import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setBusinessUnitList,
  setSelectedUnitUser,
  setSelectedUnitStructure,
  setSelectedUnitStock,
  setSelectedUnitCashbox,
  setSelectedUnitPriceType,
  clearBusinessUnitReducer,
} from 'store/actions/businessUnit';

const initialState = {
  businessUnits: [],
  selectedUnitUser: [],
  selectedUnitStructure: [],
  selectedUnitStock: [],
  selectedUnitCashbox: [],
  selectedUnitPriceType: [],
  isLoading: false,
  actionLoading: false,
};

export const businessUnitReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'fetchBusinessUnitList') {
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
    if (action.payload === 'fetchBusinessUnitList') {
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
  [setBusinessUnitList]: (state, action) => ({
    ...state,
    businessUnits: action.payload.data,
  }),
  [setSelectedUnitUser]: (state, action) => {
    const { newSelectedUnitUser } = action.payload;
    return {
      ...state,
      selectedUnitUser: newSelectedUnitUser,
    };
  },
  [setSelectedUnitStructure]: (state, action) => {
    const { newSelectedUnitStructure } = action.payload;
    return {
      ...state,
      selectedUnitStructure: newSelectedUnitStructure,
    };
  },
  [setSelectedUnitStock]: (state, action) => {
    const { newSelectedUnitStock } = action.payload;
    return {
      ...state,
      selectedUnitStock: newSelectedUnitStock,
    };
  },
  [setSelectedUnitCashbox]: (state, action) => {
    const { newSelectedUnitCashbox } = action.payload;
    return {
      ...state,
      selectedUnitCashbox: newSelectedUnitCashbox,
    };
  },
  [setSelectedUnitPriceType]: (state, action) => {
    const { newSelectedUnitPriceType } = action.payload;
    return {
      ...state,
      selectedUnitPriceType: newSelectedUnitPriceType,
    };
  },
  [clearBusinessUnitReducer]: state => ({
    ...state,
    selectedUnitUser: [],
    selectedUnitStructure: [],
    selectedUnitStock: [],
    selectedUnitCashbox: [],
    selectedUnitPriceType: [],
  }),
});
