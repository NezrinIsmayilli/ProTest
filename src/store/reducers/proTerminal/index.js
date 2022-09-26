import { createReducer } from 'redux-starter-kit';

import { setTerminalCommand } from 'store/actions/proTerminal';

const initialState = {
  terminalCommand: null,
};

export const terminalCommandReducer = createReducer(initialState, {
  [setTerminalCommand]: (state, action) => ({
    ...state,
    terminalCommand: action.payload.redirect,
  }),
});
