import { createReducer } from 'redux-starter-kit';
import {
  setCatalogs,
  setRootEditMode,
  setCatalog,
  filterCatalogs,
  setFilteredCatalogs,
} from 'store/actions/catalog';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
  catalogs: { root: [], children: {} },
  filteredCatalogs: { root: [], children: {} },
  catalog: {},
  editingRootId: undefined,
  isLoading: false,
  actionLoading: false,
  // unused
  added: false,
  edited: false,
};

export const catalogsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'catalogs') {
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
    if (action.payload === 'catalogs') {
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
  [filterCatalogs]: (state, action) => {
    const { productTypes, isWithoutSerialNumber } = action.payload;

    const filteredRoot = state.catalogs.root.filter(item => {
      if (productTypes.length > 0 && isWithoutSerialNumber) {
        return (
          item.isWithoutSerialNumber ===
            (isWithoutSerialNumber === 'withoutSerial') &&
          productTypes.includes(item.productTypeName)
        );
      }
      if (isWithoutSerialNumber) {
        return (
          item.isWithoutSerialNumber ===
          (isWithoutSerialNumber === 'withoutSerial')
        );
      }
      if (productTypes.length > 0) {
        return productTypes.includes(item.productTypeName);
      }
      return true;
    });
    return {
      ...state,
      filteredCatalogs: {
        ...state.filteredCatalogs,
        root: filteredRoot,
      },
    };
  },
  [setCatalogs]: (state, action) => ({
    ...initialState,
    catalogs: action.payload.data,
    filteredCatalogs: action.payload.data,
    added: action.payload.attribute === 'added',
    edited: action.payload.attribute === 'edited',
  }),
  [setFilteredCatalogs]: (state, action) => ({
    ...state,
    filteredCatalogs: action.payload.data,
  }),

  [setCatalog]: (state, action) => ({
    ...state,
    catalog: action.payload.data,
  }),

  [setRootEditMode]: (state, action) => ({
    ...state,
    editingRootId: action.payload,
    added: false,
    edited: false,
    catalog: {},
  }),
});
