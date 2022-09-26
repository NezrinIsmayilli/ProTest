import { createReducer } from 'redux-starter-kit';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import {
  setActivePayments,
  setSearchedCatalogs,
  setSearchedBarcodes,
  setProductsFromCatalog,
  setProductsByName,
  setInvoicesByProduct,
  clearProductsByName,
  clearSearchedCatalogs,
  clearProductsFromCatalog,
  clearInvoicesByProduct,
  setContractDetails,
  setInvoiceCurrencyCode,
  setProductPrice,
  setProductQuantity,
  setTotalPrice,
  setVatCurrencyCode,
  setEndPrice,
  setInvoicePaymentDetails,
  setVatPaymentDetails,
  setDiscount,
  setVat,
  clearReducer,
  updateDetails,
  setSelectedProducts,
  setInvoiceExpenseRate,
  setExpenseError,
  setCounterparty,
  setExpenses,
  setExpenseDirection,
  setExpenseCurrency,
  setExpenseCashboxType,
  setExpenseCashbox,
  setEmployee,
  setDescription,
  setProductPlannedPrice,
  setProductPlannedCost,
  setSelectedProductionExpense,
  setSelectedProductionEmployeeExpense,
  setSelectedProductionMaterial,
  setTotalCost,
  setMaterialList,
  setProductionExpensesList,
  setProductionProductOrder,
  setSelectedImportProducts
} from 'store/actions/sales-operation';

const initialState = {
  // invoice
  selectedProductionExpense: [],
  selectedProductionEmployeeExpense: [],
  selectedProductionMaterial: [],
  selectedProducts: [],
  selectedImportProducts: [],
  materialList: [],
  productionExpensesList: [],
  productionProductOrder: [],
  totalPrice: undefined,
  totalCost: undefined,
  endPrice: undefined,
  discount: {
    percentage: undefined,
    amount: undefined,
  },
  vat: {
    percentage: undefined,
    amount: undefined,
  },
  description: undefined,
  counterparty: {},
  contractDetails: {
    isContractSelected: false,
    contractAmount: undefined,
    contractBalance: undefined,
  },
  invoiceCurrencyCode: undefined,

  // payments
  activePayments: [],
  invoicePaymentDetails: {
    accountBalance: [],
  },
  vatPaymentDetails: {
    accountBalance: [],
  },
  vatCurrencyCode: null,
  opeartionDate: null,
  // Fetch
  catalogs: [],
  barcodes: [],
  productsFromCatalog: [],
  selectedExpenses: [],
  productsByName: [],
  invoice_expense_rate: 1,
  invoicesByProduct: [],
  expenseDirection: {},
  expenseCurrency: {},
  expenseCashboxType: {},
  expenseCashbox: {},
  expenseCashboxBalance: [],
  employee: {},
  expenseError: false,
};
export const salesOperation = createReducer(
  initialState,

  {
    // Product catalogs by invoice type
    [setSearchedCatalogs]: (state, action) => ({
      ...state,
      catalogs: action.payload.data,
    }),
    [clearSearchedCatalogs]: state => ({
      ...state,
      catalogs: [],
    }),
    // Product barcodes by invoice type
    [setSearchedBarcodes]: (state, action) => ({
      ...state,
      barcodes: action.payload.data,
    }),
    // Products by catalog type
    [setProductsFromCatalog]: (state, action) => ({
      ...state,
      productsFromCatalog: action.payload.data.map(product => ({
        ...product,
        quantityLabel:
          Number(product.quantity || 0) > 0
            ? ` (${formatNumberToLocale(
                defaultNumberFormat(product.quantity)
              )} ${
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
        codeLabel: product.productCode
          ? `/${product.productCode}`
          : product.product_code
          ? `/${product.product_code}`
          : '',
        quantityLabel:
          Number(product.quantity || 0) > 0
            ? ` (${formatNumberToLocale(
                defaultNumberFormat(product.quantity)
              )} ${
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
    // Currency code of new invoice
    [setInvoiceCurrencyCode]: (state, action) => ({
      ...state,
      invoiceCurrencyCode: action.payload,
    }),
    [setVatCurrencyCode]: (state, action) => ({
      ...state,
      vatCurrencyCode: action.payload,
    }),
    // Contract details of new invoice
    [setContractDetails]: (state, action) => ({
      ...state,
      contractDetails: {
        ...state.contractDetails,
        ...action.payload,
      },
    }),

    // Selected products of new invoice
    [setSelectedProducts]: (state, action) => {
      const { newSelectedProducts } = action.payload;
      return {
        ...state,
        selectedProducts: newSelectedProducts,
      };
    },

    [setSelectedImportProducts]: (state, action) => {
      return {
        ...state,
        selectedImportProducts: action.payload,
      };
    },

    // Selected expenses of import invoice
    [setExpenses]: (state, action) => {
      const { newExpenses } = action.payload;
      return {
        ...state,
        selectedExpenses: newExpenses,
      };
    },

    // Active payment types
    [setActivePayments]: (state, action) => {
      const { newActivePayments } = action.payload;

      return {
        ...state,
        activePayments: newActivePayments,
      };
    },
    // Selected product quantity
    [setProductQuantity]: (state, action) => {
      const { selectedProducts } = state;
      const { productId, newQuantity } = action.payload;
      const newSelectedProducts = selectedProducts.map(selectedProduct => {
        if (productId === selectedProduct.id) {
          return {
            ...selectedProduct,
            invoiceQuantity: newQuantity,
            invoiceProducts: undefined,
          };
        }
        return selectedProduct;
      });
      return {
        ...state,
        selectedProducts: newSelectedProducts,
      };
    },
    // Selected product price
    [setProductPrice]: (state, action) => {
      const { selectedProducts } = state;
      const { productId, newPrice } = action.payload;
      const newSelectedProducts = selectedProducts.map(selectedProduct => {
        if (productId === selectedProduct.id) {
          return {
            ...selectedProduct,
            invoicePrice: newPrice,
          };
        }
        return selectedProduct;
      });
      return {
        ...state,
        selectedProducts: newSelectedProducts,
      };
    },
    // Selected product planned price
    [setProductPlannedPrice]: (state, action) => {
      const { selectedProducts } = state;
      const { productId, newPlannedPrice } = action.payload;
      const newSelectedProducts = selectedProducts.map(selectedProduct => {
        if (productId === selectedProduct.id) {
          return {
            ...selectedProduct,
            plannedPrice: newPlannedPrice,
          };
        }
        return selectedProduct;
      });
      return {
        ...state,
        selectedProducts: newSelectedProducts,
      };
    },
    // Selected product planned cost
    [setProductPlannedCost]: (state, action) => {
      const { selectedProducts } = state;
      const { productId, newCost } = action.payload;
      const newSelectedProducts = selectedProducts.map(selectedProduct => {
        if (productId === selectedProduct.id) {
          return {
            ...selectedProduct,
            plannedCost: newCost,
          };
        }
        return selectedProduct;
      });
      return {
        ...state,
        selectedProducts: newSelectedProducts,
      };
    },
    // Selected expense of production invoice
    [setSelectedProductionExpense]: (state, action) => {
      const { newSelectedProductionExpense } = action.payload;
      return {
        ...state,
        selectedProductionExpense: newSelectedProductionExpense,
      };
    },
    // Selected employee expense of production invoice
    [setSelectedProductionEmployeeExpense]: (state, action) => {
      const { newSelectedProductionEmployeeExpense } = action.payload;
      return {
        ...state,
        selectedProductionEmployeeExpense: newSelectedProductionEmployeeExpense,
      };
    },
    // Selected material of production invoice
    [setSelectedProductionMaterial]: (state, action) => {
      const { newSelectedProductionMaterial } = action.payload;
      return {
        ...state,
        selectedProductionMaterial: newSelectedProductionMaterial,
      };
    },
    [setMaterialList]: (state, action) => ({
      ...state,
      materialList: action.payload.data,
    }),
    [setProductionExpensesList]: (state, action) => ({
      ...state,
      productionExpensesList: action.payload.data,
    }),
    [setProductionProductOrder]: (state, action) => ({
      ...state,
      productionProductOrder: action.payload.data,
    }),
    // Total price of new invoice
    [setTotalPrice]: (state, action) => {
      const { newTotalPrice } = action.payload;
      return {
        ...state,
        totalPrice: newTotalPrice,
      };
    },
    // Total cost of new profuction invoice
    [setTotalCost]: (state, action) => {
      const { newTotalCost } = action.payload;
      return {
        ...state,
        totalCost: newTotalCost,
      };
    },
    // End price of new invoice
    [setEndPrice]: (state, action) => {
      const { newEndPrice } = action.payload;

      return {
        ...state,
        endPrice: newEndPrice,
      };
    },
    // Discount of new invoice
    [setDiscount]: (state, action) => {
      const { newPercentage, newAmount } = action.payload;
      return {
        ...state,
        discount: {
          percentage: newPercentage,
          amount: newAmount,
        },
      };
    },
    // Vat of new invoice
    [setVat]: (state, action) => {
      const { newPercentage, newAmount } = action.payload;

      return {
        ...state,
        vat: {
          percentage: newPercentage,
          amount: newAmount,
        },
      };
    },
    // Invoice payment details of new invoice
    [setInvoicePaymentDetails]: (state, action) => {
      const { newDetails } = action.payload;

      return {
        ...state,
        invoicePaymentDetails: {
          ...state.invoicePaymentDetails,
          ...newDetails,
        },
      };
    },
    // Vat payment details of new invoice
    [setVatPaymentDetails]: (state, action) => {
      const { newDetails } = action.payload;

      return {
        ...state,
        vatPaymentDetails: {
          ...state.vatPaymentDetails,
          ...newDetails,
        },
      };
    },
    // Set invoice description
    [setDescription]: (state, action) => {
      console.log(newDescription)
      const { newDescription } = action.payload;

      return {
        ...state,
        description: newDescription,
      };
    },
    [setCounterparty]: (state, action) => {
      const { newCounterparty } = action.payload;

      return {
        ...state,
        counterparty: newCounterparty,
      };
    },
    // Expenses
    [setExpenseDirection]: (state, action) => {
      const { newExpenseDirection } = action.payload;

      return {
        ...state,
        expenseDirection: newExpenseDirection,
      };
    },
    [setExpenseCurrency]: (state, action) => {
      const { newExpenseCurrency } = action.payload;

      return {
        ...state,
        expenseCurrency: newExpenseCurrency,
      };
    },
    [setExpenseCashboxType]: (state, action) => {
      const { newExpenseCashboxType } = action.payload;

      return {
        ...state,
        expenseCashboxType: newExpenseCashboxType,
      };
    },
    [setInvoiceExpenseRate]: (state, action) => {
      const { newRate } = action.payload;

      return {
        ...state,
        invoice_expense_rate: newRate,
      };
    },
    [setExpenseError]: (state, action) => {

      return {
        ...state,
        expenseError: action.payload,
      };
    },

    [setExpenseCashbox]: (state, action) => {
      const { newExpenseCashbox, newExpenseCashboxBalance } = action.payload;

      return {
        ...state,
        expenseCashbox: newExpenseCashbox,
        expenseCashboxBalance: newExpenseCashboxBalance,
      };
    },
    [setEmployee]: (state, action) => {
      const { newEmployee } = action.payload;

      return {
        ...state,
        employee: newEmployee,
      };
    },
    [updateDetails]: (state, action) => {
      const { invoiceDetails } = action.payload;
      return {
        ...state,
        ...invoiceDetails,
      };
    },
    [clearReducer]: () => initialState,
  }
);
