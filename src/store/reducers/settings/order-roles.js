import { createReducer } from 'redux-starter-kit';
import {
  setOrderRoles,
  setOrderRegulations,
} from 'store/actions/settings/order-roles';

export const orderRolesReducer = createReducer(
  {
    warehousemen: [],
    operators: [],
    expeditors: [],
    stageRoles: {},
  },
  {
    [setOrderRoles]: (state, action) => ({
      ...state,
      warehousemen: action.payload.data[1],
      expeditors: action.payload.data[2],
      operators: action.payload.data[3],
    }),

    [setOrderRegulations]: (state, action) => ({
      ...state,
      stageRoles: action.payload.data,
    }),
  }
);
