import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setTerminalCommand = createAction('setTerminalCommand');

export function fetchTerminalCommand(command) {
  return apiAction({
    url: '/test/console',
    method: 'POST',
    data: {command},
    onSuccess: setTerminalCommand,
    label: 'terminalCommand',
  });
}
