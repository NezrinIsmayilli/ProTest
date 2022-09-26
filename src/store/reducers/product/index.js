import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setProduct,
  setProducts,
  setProductsExtended,
  setEditMode,
  setCatalogId,
  setProductCount,
  setdataId,
} from 'store/actions/product';

const initialState = {
  isLoading: false,
  actionLoading: false,
  product: {},
  dataId: {},
  selectedProductId: undefined,
  catalogId: null,
  products: [],
  productsExtended: [],
  editMode: false,
  productCount: undefined,
};

export const productReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'products') {
      return {
        ...state,
        isLoading: true,
      };
    }

    if (action.payload === 'productsActions') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'products') {
      return {
        ...state,
        isLoading: false,
      };
    }

    if (action.payload === 'productsActions') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },

  [setEditMode]: (state, action) => ({
    ...state,
    editMode: action.payload,
  }),

  [setCatalogId]: (state, action) => ({
    ...state,
    catalogId: action.payload,
    products: [],
  }),

  [setProduct]: (state, action) => ({
    ...state,
    // editMode: action.payload.attribute.editMode,
    product: action.payload.data,
    // selectedProductId: action.payload.attribute.id,
  }),
  [setdataId]: (state, action) => ({
    ...state,
    // editMode: action.payload.attribute.editMode,
    dataId: action.payload.data,
    // selectedProductId: action.payload.attribute.id,
  }),

  [setProducts]: (state, action) => ({
    ...state,
    products: action.payload.data,
    editMode: false,
    product: {},
    selectedProductId: undefined,
    catalogId: action.payload.attribute,
  }),
  [setProductCount]: (state, action) => ({
    ...state,
    productCount: action.payload.data,
  }),
  [setProductsExtended]: (state, action) => ({
    ...state,
    productsExtended: action.payload.data,
    editMode: false,
    product: {},
    catalogId: action.payload.attribute,
  }),
});
