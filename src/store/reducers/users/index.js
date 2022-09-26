import { createReducer } from 'redux-starter-kit';
import { setUsers } from 'store/actions/users';

const initialState = {
  users: [],
  filters: undefined,
};

export const usersReducer = createReducer(initialState, {
  [setUsers]: (state, action) => ({
    users: action.payload.data,
    filters: action.payload.attribute,
  }),
});
