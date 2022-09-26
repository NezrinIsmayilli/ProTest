import { createReducer } from 'redux-starter-kit';
import {
  setExpenseReport,
  setSelectedExpenseItem,
  resetExpenseReport,
} from 'store/actions/expenseReport';

const initialState = {
  expenses: [],
  selectedExpenseItem: null,
  filters: {},
};

export const expenseReportReducer = createReducer(initialState, {
  [setExpenseReport]: (state, action) => {
    const { salaryPayment, removedInvoice, expenses } = action.payload.data;

    return {
      selectedExpenseItem: null,
      filters: action.payload.attribute,
      expenses: [
        {
          amount: salaryPayment,
          expenseItemId: 'salaryPayment',
          expenseItemName: 'Əmək haqqı',
        },
        {
          amount: removedInvoice,
          expenseItemId: 'removedInvoice',
          expenseItemName: 'Sərfiyyat materialları',
        },
        ...expenses,
      ],
    };
  },

  [setSelectedExpenseItem]: (state, action) => ({
    ...state,
    selectedExpenseItem: action.payload,
  }),

  [resetExpenseReport]: () => initialState,
});
