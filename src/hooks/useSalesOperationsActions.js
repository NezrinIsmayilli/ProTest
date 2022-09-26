import { createReducer } from 'utils';
import { useReducer } from 'react';

// null empty product data for adding new rows to table
const newProduct = {
  id: null,
  barcode: null,
  name: null,
  catalogName: null,
  isWithoutSerialNumber: null,
  isNull: true,
  price: 0,
  quantity: 0,
  serialNumber_ul: [],
  salesPrice: 0,
  maxProductQuantity: 99999999, // max is 8 caracters length
};

function getNewEmptyProduct(len) {
  return {
    ...newProduct,
    id: `${Math.random()
      .toString(36)
      .substr(2, 16) +
      new Date().getUTCMilliseconds() +
      len}`,
  };
}

// compute total price of products in bucket
function computeTotalPrice(bucket) {
  return bucket
    .reduce((acc, next) => {
      const num = next.price * next.quantity;
      const multiply = !Number.isNaN(num) ? parseFloat(num.toFixed(2)) : 0;

      return acc + multiply;
    }, 0)
    .toFixed(2);
}

const initialState = {
  isCatalogModalOpen: false,
  isSeriyaModalOpen: false,

  selectedCurrencyCode: null,
  selectedClient: null,
  selectedStock: null,
  selectedSupplier: null,

  bucket: [],
  totalPrice: null,
  openedProductId: null,
  isSalesInvoiceChecked: false,
};

// REDUCER
const reducer = createReducer(initialState, {
  // modal actions
  closeCatalogModal: state => ({ ...state, isCatalogModalOpen: false }),

  openCatalogModal: state => ({ ...state, isCatalogModalOpen: true }),

  closeSeriyaModal: state => ({
    ...state,
    isSeriyaModalOpen: false,
  }),

  resetOpenedProductId: state => ({
    ...state,
    openedProductId: null,
  }),

  openSeriyaModal: (state, action) => ({
    ...state,
    isSeriyaModalOpen: true,
    openedProductId: action.id,
  }),

  // main form actions
  setCurrencyCode: (state, action) => ({
    ...state,
    selectedCurrencyCode: action.code,
  }),

  setSelectedClient: (state, action) => ({
    ...state,
    bucket: [],
    selectedClient: action.client,
    totalPrice: 0,
  }),

  setSelectedStock: (state, action) => ({
    ...state,
    bucket: [],
    totalPrice: 0,
    selectedStock: action.stock,
  }),

  setSelectedSupplier: (state, action) => ({
    ...state,
    bucket: [],
    selectedSupplier: action.supplier,
    totalPrice: 0,
  }),

  submitTempSeriyaList: (state, action) => {
    const { bucket, openedProductId } = state;
    const index = bucket.findIndex(product => product.id === openedProductId);
    const openedProduct = bucket[index];
    const newSerialNumbers = [...action.tempSeriyaList];
    const newProduct = {
      ...openedProduct,
      quantity: newSerialNumbers.length,
      serialNumber_ul: newSerialNumbers,
    };
    const newBucket = [...bucket];
    newBucket.splice(index, 1, newProduct);
    const totalPrice = computeTotalPrice(newBucket);

    return {
      ...state,
      bucket: newBucket,
      totalPrice,
      isSeriyaModalOpen: false,
    };
  },

  addSelectedProductsToBucket: (state, action) => ({
    ...state,
    isCatalogModalOpen: false,
    bucket: action.tempBucket.concat(state.bucket),
  }),

  resetBucket: state => ({
    ...state,
    bucket: [],
    totalPrice: 0,
  }),

  removeFromBucket: (state, action) => {
    const newBucket = [...state.bucket].filter(
      product => product.id !== action.id
    );
    return {
      ...state,
      bucket: newBucket,
      totalPrice: computeTotalPrice(newBucket),
    };
  },

  removeRow: (state, action) => {
    const newBucket = [...state.bucket].filter(row => row.id !== action.id);
    return {
      ...state,
      bucket: newBucket,
      totalPrice: computeTotalPrice(newBucket),
    };
  },

  addRow: state => {
    const newBucket = [
      getNewEmptyProduct(state.bucket.length),
      ...state.bucket,
    ];
    return {
      ...state,
      bucket: newBucket,
      // totalPrice: computeTotalPrice(newBucket),
    };
  },

  replaceEmptyProductWithSelected: (state, action) => {
    const { bucket } = state;
    const { product, id } = action;

    // dont let choose same product twice if it is in bucket already
    const isProductInBucket = bucket.find(item => item.id === product.id);
    if (isProductInBucket) {
      return state;
    }

    const index = bucket.findIndex(item => item.id === id);
    const oldProduct = bucket[index];
    const selectedProduct = {
      ...oldProduct,
      id: product.id,
      product: product.id,
      barcode: product.barcode,
      name: product.name,
      catalogName: product.catalog.name,
      isWithoutSerialNumber: product.catalog.isWithoutSerialNumber,
      maxProductQuantity: product.quantity,
      isNull: false,
    };

    const newBucket = [...bucket];
    newBucket.splice(index, 1, selectedProduct);
    // const totalPrice = computeTotalPrice(newBucket);

    return {
      ...state,
      // bucket: [getNewEmptyProduct(newBucket.length), ...newBucket],
      bucket: newBucket,
      // totalPrice,
    };
  },

  quantityHandler: (state, action) => {
    const { bucket } = state;
    const { quantity, id } = action;
    const index = bucket.findIndex(product => product.id === id);
    const oldProduct = bucket[index];
    const newProduct = { ...oldProduct, quantity };
    const newBucket = [...bucket];
    newBucket.splice(index, 1, newProduct);
    const totalPrice = computeTotalPrice(newBucket);

    return { ...state, bucket: newBucket, totalPrice };
  },

  priceHandler: (state, action) => {
    const { bucket } = state;
    const { id, price } = action;
    const index = bucket.findIndex(product => product.id === id);
    const oldProduct = bucket[index];
    const newProduct = { ...oldProduct, price };
    const newBucket = [...bucket];
    newBucket.splice(index, 1, newProduct);
    const totalPrice = computeTotalPrice(newBucket);

    return { ...state, bucket: newBucket, totalPrice };
  },

  setInitialState: (state, action) => ({
    ...state,
    ...action.state,
    totalPrice: computeTotalPrice(action.state.bucket),
  }),

  // Sales actions
  toggleSalesInvoice: state => ({
    ...state,
    isSalesInvoiceChecked: !state.isSalesInvoiceChecked,
  }),
});

// actions and state that are used in all(6) sales-buys add/edit operations pages
export function useSalesOperationsActions() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    // catalog modal handling
    openCatalogModal() {
      dispatch({ type: 'openCatalogModal' });
    },

    closeCatalogModal() {
      dispatch({ type: 'closeCatalogModal' });
    },

    addSelectedProductsToBucket(tempBucket) {
      dispatch({ type: 'addSelectedProductsToBucket', tempBucket });
    },

    resetBucket(tempBucket) {
      dispatch({ type: 'resetBucket', tempBucket });
    },

    resetOpenedProductId() {
      dispatch({ type: 'resetOpenedProductId' });
    },

    removeFromBucket(id) {
      dispatch({ type: 'removeFromBucket', id });
    },

    // seriya modal handling
    openSeriyaModal(id) {
      dispatch({ type: 'openSeriyaModal', id });
    },

    closeSeriyaModal() {
      dispatch({ type: 'closeSeriyaModal' });
    },

    submitTempSeriyaList(tempSeriyaList) {
      dispatch({ type: 'submitTempSeriyaList', tempSeriyaList });
    },

    //  table handling
    removeRow(id) {
      dispatch({ type: 'removeRow', id });
    },

    addRow() {
      dispatch({ type: 'addRow' });
    },

    replaceEmptyProductWithSelected(product, id) {
      dispatch({ type: 'replaceEmptyProductWithSelected', product, id });
    },

    quantityHandler(quantity, id) {
      dispatch({ type: 'quantityHandler', quantity, id });
    },

    priceHandler(price, id) {
      dispatch({ type: 'priceHandler', price, id });
    },

    //  form handling
    setCurrencyCode(code) {
      dispatch({ type: 'setCurrencyCode', code });
    },

    setSelectedClient(client) {
      dispatch({ type: 'setSelectedClient', client });
    },

    setSelectedStock(stock) {
      dispatch({ type: 'setSelectedStock', stock });
    },

    // returnToSupplier related actions
    setSelectedSupplier(supplier) {
      dispatch({ type: 'setSelectedSupplier', supplier });
    },

    setInitialState(state) {
      dispatch({ type: 'setInitialState', state });
    },

    // Sales related actions
    toggleSalesInvoice() {
      dispatch({ type: 'toggleSalesInvoice' });
    },
  };

  return [state, actions];
}
