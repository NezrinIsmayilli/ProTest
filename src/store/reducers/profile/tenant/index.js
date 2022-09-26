import { createReducer } from 'redux-starter-kit';
import { setTenant, setTenants } from 'store/actions/profile/tenant';

const initialState = {
  tenant: {},
  isAdmin: false,
  tenants: [],
};

export const tenantReducer = createReducer(initialState, {
  [setTenant]: (state, action) => ({
    ...state,
    tenant: action.payload.data,
    isAdmin: action.payload.data.isAdmin || false,
  }),
  [setTenants]: (state, action) => ({
    ...state,
    tenants: action.payload.data,
  }),
});
