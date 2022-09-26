import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setSalesProfit,
  setSalesProfitReturned,
  searchInvoiceHandle,
} from 'store/actions/salesReport';

const initialState = {
  profitList: [],
  profitReturnedList: [],

  filteredProfitList: [],
  filteredProfitReturnedList: [],

  isLoading: false,
  searchQuery: '',
};

export const salesReportReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'SalesProfit') {
      return {
        ...state,
        isLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'SalesProfit') {
      return {
        ...state,
        isLoading: false,
      };
    }
  },

  [setSalesProfit]: (state, action) => {
    const { searchQuery } = state;
    const { data } = action.payload;

    if (!String(searchQuery).trim()) {
      return {
        ...state,
        profitList: data,
        filteredProfitList: data,
      };
    }

    const result = data.filter(item =>
      item.invoiceNumber.includes(searchQuery)
    );

    return {
      ...state,
      profitList: result,
      filteredProfitList: data,
    };
  },

  [setSalesProfitReturned]: (state, action) => {
    const { searchQuery } = state;
    const { data } = action.payload;

    if (!String(searchQuery).trim()) {
      return {
        ...state,
        profitReturnedList: data,
        filteredProfitReturnedList: data,
      };
    }

    const result = data.filter(item =>
      item.invoiceNumber.includes(searchQuery)
    );

    return {
      ...state,
      profitReturnedList: result,
      filteredProfitReturnedList: data,
    };
  },

  [searchInvoiceHandle]: (state, action) => {
    const { searchQuery, isSales } = action.payload;
    const { filteredProfitList, filteredProfitReturnedList } = state;

    const activeList = isSales
      ? filteredProfitList
      : filteredProfitReturnedList;
    const activeFilteredList = isSales ? 'profitList' : 'profitReturnedList';

    if (!searchQuery) {
      return {
        ...state,
        [activeFilteredList]: activeList,
        searchQuery,
      };
    }

    const result = activeList.filter(item =>
      item.invoiceNumber.includes(searchQuery)
    );
    return {
      ...state,
      [activeFilteredList]: result,
      searchQuery,
    };
  },
});
