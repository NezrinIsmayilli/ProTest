import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import {
  setProductsFromCatalog,
  setSearchedCatalogs,
  setProductsByName,
  setInvoicesByProduct,
  clearProductsByName,
  clearSearchedCatalogs,
  clearProductsFromCatalog,
  clearInvoicesByProduct,
} from 'store/actions/bron';

const initialState = {
  productsFromCatalog: [],
  catalogs: [],
  productsByName: [],
  invoicesByProduct: [],
  isLoading: false,
};

export const bronReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'bron' || action.payload === 'filteredBron') {
      return {
        ...state,
        isLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'bron' || action.payload === 'filteredBron') {
      return {
        ...state,
        isLoading: false,
      };
    }
  },

  [setProductsFromCatalog]: (state, action) => ({
    ...state,
    productsFromCatalog: action.payload.data.map(product => ({
      ...product,
      quantityLabel:
        Number(product.quantity || 0) > 0
          ? ` (${formatNumberToLocale(defaultNumberFormat(product.quantity))} ${
              product.unitOfMeasurementName
                ? product.unitOfMeasurementName.toLowerCase()
                : ''
            })`
          : '',
    })),
  }),

  // Product catalogs by invoice type
  [setSearchedCatalogs]: (state, action) => ({
    ...state,
    catalogs: action.payload.data,
  }),
  [clearSearchedCatalogs]: state => ({
    ...state,
    catalogs: [],
  }),
  // Products by catalog type
  [setProductsFromCatalog]: (state, action) => ({
    ...state,
    productsFromCatalog: action.payload.data.map(product => ({
      ...product,
      quantityLabel:
        Number(product.quantity || 0) > 0
          ? ` (${formatNumberToLocale(defaultNumberFormat(product.quantity))} ${
              product.unitOfMeasurementName
                ? product.unitOfMeasurementName.toLowerCase()
                : ''
            })`
          : '',
    })),
  }),
  [clearProductsFromCatalog]: state => ({
    ...state,
    productsFromCatalog: [],
  }),
  // Product by product name and invoice type
  [setProductsByName]: (state, action) => ({
    ...state,
    productsByName: action.payload.data.map(product => ({
      ...product,
      codeLabel: product.product_code ? `/${product.product_code}` : '',
      quantityLabel:
        Number(product.quantity || 0) > 0
          ? ` (${formatNumberToLocale(defaultNumberFormat(product.quantity))} ${
              product.unitOfMeasurementName
                ? product.unitOfMeasurementName.toLowerCase()
                : ''
            })`
          : '',
    })),
  }),

  [clearProductsByName]: state => ({
    ...state,
    productsByName: [],
  }),
  // Product invoices by produc id and invoice type
  [setInvoicesByProduct]: (state, action) => ({
    ...state,
    invoicesByProduct: Object.values(action.payload.data),
  }),
  [clearInvoicesByProduct]: state => ({
    ...state,
    invoicesByProduct: [],
  }),
});
