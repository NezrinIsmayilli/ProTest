import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setApps = createAction('setApps');

export function getApps() {
  return apiAction({
    url: 'system/applications',
    onSuccess: setApps,
    label: 'payments',
  });
}
