import { createReducer } from 'redux-starter-kit';
import {
  apiStart,
  apiEnd,
  apiStartHandle,
  apiEndHandle,
} from 'store/actions/api';
import {
  setSettlements,
  setOperations,
  setContactsWhoHasSettlements,
} from 'store/actions/settlements';

const initialState = {
  settlements: [],
  operations: [],
  contactsWhoHasSettlements: [],
  isLoading: false,
};

export const settlementsReducer = createReducer(initialState, {
  [apiStart]: apiStartHandle('settlements'),

  [apiEnd]: apiEndHandle('settlements'),

  [setSettlements]: (state, action) => ({
    ...state,
    settlements: action.payload.data,
  }),

  [setOperations]: (state, action) => ({
    ...state,
    operations: action.payload.data.operations,
  }),

  [setContactsWhoHasSettlements]: (state, action) => ({
    ...state,
    contactsWhoHasSettlements: action.payload.data,
  }),
});
