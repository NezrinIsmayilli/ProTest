import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setOrders,
  setSelectedOrder,
  setContentItems,
  setAcceptedItems,
  setCountsGroupedByDirection,
  setSentItems,
  setStages,
  setOrdersTotal,
  clearOrders,
  clearSelectedOrder,
} from 'store/actions/orders';

const initialState = {
  orders: [],
  selectedOrder: undefined,
  contentItems: undefined,
  sentItems: undefined,
  acceptedItems: undefined,
  countsGroupedByDirection: undefined,
  stages: [],
  selectedRow: {},
  total: 0,
  isLoading: false,
  actionLoading: false,
};

export const ordersReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'orders') {
      return {
        ...state,
        isLoading: true,
      };
    }

    if (action.payload === 'ordersActions') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'orders') {
      return {
        ...state,
        isLoading: false,
      };
    }

    if (action.payload === 'ordersActions') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },
  [setOrders]: (state, action) => ({
    ...state,
    orders: action.payload.data,
  }),
  [setStages]: (state, action) => ({
    ...state,
    stages: action.payload.data,
  }),
  [setCountsGroupedByDirection]: (state, action) => ({
    ...state,
    countsGroupedByDirection: action.payload.data,
  }),
  [setOrdersTotal]: (state, action) => {
    return {
      ...state,
      total: action.payload.data,
    };
  },

  [setContentItems]: (state, action) => {
    return {
      ...state,
      contentItems: action.payload,
    };
  },
  [setSentItems]: (state, action) => {
    return {
      ...state,
      sentItems: action.payload,
    };
  },
  [setAcceptedItems]: (state, action) => {
    return {
      ...state,
      acceptedItems: action.payload,
    };
  },
  [setSelectedOrder]: (state, action) => {
    const [contentItems, sentItems, acceptedItems] = Object.values(
      action.payload?.items
    );
    return {
      ...state,
      selectedOrder: action.payload,
      contentItems,
      sentItems,
      acceptedItems,
    };
  },

  [clearOrders]: () => {
    return {
      orders: [],
      selectedOrder: null,
      contentItems: null,
      acceptedItems: null,
      sentItems: null,
      stages: [],
      total: 0,
      isLoading: false,
      actionLoading: false,
    };
  },

  [clearSelectedOrder]: (state, action) => {
    return {
      ...state,
      selectedOrder: undefined,
      contentItems: undefined,
      acceptedItems: undefined,
      sentItems: undefined,
    };
  },
});
