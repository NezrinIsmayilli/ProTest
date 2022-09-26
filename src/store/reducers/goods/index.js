import { createReducer } from 'redux-starter-kit';
import {
  setGoods,
  setPartnerGoods,
  setTotalCount,
  clearGoods,
  clearPartnerGoods,
} from 'store/actions/goods';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
  goods: [],
  partnerGoods: [],
  total: 0,
  isLoading: false,
  actionLoading: false,
};

export const goodsReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'goods') {
      return {
        ...state,
        isLoading: true,
      };
    }

    if (action.payload === 'goodsActions') {
      return {
        ...state,
        actionLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'goods') {
      return {
        ...state,
        isLoading: false,
      };
    }

    if (action.payload === 'goodsActions') {
      return {
        ...state,
        actionLoading: false,
      };
    }
  },
  [setGoods]: (state, action) => {
    return {
      ...state,
      goods: action.payload.data,
    };
  },
  [setPartnerGoods]: (state, action) => {
    return {
      ...state,
      partnerGoods: action.payload.data,
    };
  },
  [setTotalCount]: (state, action) => {
    return {
      ...state,
      total: action.payload.data,
    };
  },
  [clearGoods]: () => {
    return {
      goods: [],
      partnerGoods: [],
      orderCart: { products: [], additionalInformation: '' },
      filteredOrderCart: [],
      total: 0,
      isLoading: false,
      actionLoading: false,
    };
  },
  [clearPartnerGoods]: state => {
    return {
      ...state,
      partnerGoods: [],
    };
  },
});
