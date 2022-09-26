import { cookies } from 'utils/cookies';

export const clearUserData = ({ reload = false }) => {
  cookies.remove('_TKN_');
  cookies.remove('__TNT__');
  cookies.remove('email');
  cookies.remove('_TKN_CALL_');
  cookies.remove('_TKN_UNIT_');

  if (reload) {
    setTimeout(() => {
      window.location.reload();
    });
  }
};
