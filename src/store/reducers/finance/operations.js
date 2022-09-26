import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setOperationsList,
  setTransactionsCount,
  setPaidSalaries,
  setTransactionAction,
  transactionsFilterHandle,
  setContactInfo,
  setCashboxInvoiceTransactionInfo,
  setExpenseTransactionInfo,
  setSalaryPaymentTransactionInfo,
  deleteTransactionAction,
  resetOperationsList,
  resetTransactionInfo,
  setWorkerCurrentBalance,
  setInfoCardData,
} from 'store/actions/finance/operations';

const initialState = {
  cashboxInvoiceTransactionInfo: {},
  expenseTransactionInfo: {},
  salaryPaymentTransactionInfo: {},
  contactInfo: {},
  operationsList: [],
  paidSalaries: [],
  filteredList: [],
  transactionsCount: 0,
  transaction: undefined,
  isLoading: false,
  actionLoading: false,
  added: false,
  edited: false,
  currentBalance: undefined,

  infoCardData: undefined,
};

export const financeOperationsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'financeOperations') {
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
    if (action.payload === 'financeOperations') {
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

  [setTransactionAction]: (state, action) => ({
    ...state,
    transaction: action.payload.data,
  }),

  [setWorkerCurrentBalance]: (state, action) => ({
    ...state,
    currentBalance: action.payload.data?.currentBalance,
  }),

  [setOperationsList]: (state, action) => {
    return {
      ...state,
      operationsList: action.payload.data,
      filteredList: action.payload.data,
      // added: action.payload.attribute.action === 'added',
      // edited: action.payload.attribute.action === 'edited',
    };
  },
  [setTransactionsCount]: (state, action) => ({
    ...state,
    transactionsCount: action.payload.data,
  }),
  [setPaidSalaries]: (state, action) => {
    return {
      ...initialState,
      operationsList: state.operationsList,
      paidSalaries: action.payload.data,
    };
  },
  [deleteTransactionAction]: (state, action) => ({
    ...initialState,
    filteredList: state.operationsList.filter(
      item => item.id !== action.payload.attribute
    ),
  }),

  [setContactInfo]: (state, action) => ({
    ...state,
    contactInfo: action.payload.data,
  }),

  [setCashboxInvoiceTransactionInfo]: (state, action) => ({
    ...state,
    cashboxInvoiceTransactionInfo: action.payload.data,
  }),

  [setExpenseTransactionInfo]: (state, action) => ({
    ...state,
    expenseTransactionInfo: action.payload.data,
  }),

  [setSalaryPaymentTransactionInfo]: (state, action) => ({
    ...state,
    salaryPaymentTransactionInfo: action.payload.data,
  }),

  // [searchHandle]: (state, action) => {
  //   const result = state.operationsList.filter(item =>
  //     item.serialNumber
  //       .toLowerCase()
  //       .includes(action.payload.searchValue.toLowerCase())
  //   );
  //   return {
  //     ...state,
  //     filteredList: result,
  //   };
  // },

  [transactionsFilterHandle]: (state, action) => {
    const { filters } = action.payload;

    const result = state.operationsList.filter(item => {
      let status = true;

      if (filters.senderContact) {
        status = item.senderId === +filters.senderContact;
      }

      if (status && filters.senderCashbox) {
        status = item.senderId === +filters.senderCashbox;
      }

      if (status && filters.receiverContact) {
        status = item.receiverId === +filters.receiverContact;
      }

      if (status && filters.receiverCashbox) {
        status = item.receiverId === +filters.receiverCashbox;
      }

      return status;
    });
    return {
      ...state,
      filteredList: result,
    };
  },

  [resetOperationsList]: () => initialState,

  [resetTransactionInfo]: () => state => ({
    ...state,
    transaction: undefined,
  }),

  [setInfoCardData]: (state, action) => ({
    ...state,
    infoCardData: action.payload,
  }),
});
