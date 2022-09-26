import { createReducer } from 'redux-starter-kit';
import {
  setSpecialParameters,
  setProductTypes,
  setProductPriceTypes,
  setFilteredProductPriceTypes,
  setUnitOfMeasurements,
  setTaxTypes,
  setBarcodTypes,
  setFreeBarcodTypes,
  setGeneratedBarcode,
} from 'store/actions/settings/mehsul';
import { apiStart, apiEnd } from 'store/actions/api';

export const mehsulReducer = createReducer(
  {
    productTypes: [],
    unitOfMeasurements: [],
    specialParameters: [],
    productPriceTypes: [],
    filteredProductPriceTypes:[],
    taxTypes: [],
    barcodTypes: [],
    freeBarcodTypes: [],
    generatedBarcode: [],
    isLoading: false,
    actionLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'productTypes') {
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
      if (action.payload === 'productTypes') {
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
    [setProductTypes]: (state, action) => ({
      ...state,
      productTypes: action.payload.data,
    }),
    [setUnitOfMeasurements]: (state, action) => ({
      ...state,
      unitOfMeasurements: action.payload.data,
    }),
    [setSpecialParameters]: (state, action) => ({
      ...state,
      specialParameters: action.payload.data,
    }),
    [setProductPriceTypes]: (state, action) => ({
      ...state,
      productPriceTypes: action.payload.data,
    }),
    [setFilteredProductPriceTypes]: (state, action) => ({
      ...state,
      filteredProductPriceTypes: action.payload.data,
    }),
    [setTaxTypes]: (state, action) => ({
      ...state,
      taxTypes: action.payload.data,
    }),
    [setBarcodTypes]: (state, action) => ({
      ...state,
      barcodTypes: action.payload.data === null ? [] : [action.payload.data],
    }),

    [setGeneratedBarcode]: (state, action) => ({
      ...state,
      generatedBarcode: action.payload.data,
    }),

    [setFreeBarcodTypes]: (state, action) => ({
      ...state,
      freeBarcodTypes:
        action.payload.data === null ? [] : [action.payload.data],
    }),
  }
);
