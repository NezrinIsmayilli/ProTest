import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import NotFound from './containers/NotFound';

import Login from './containers/Auth/Login';
import Register from './containers/Auth/Register';
import Recovery from './containers/Auth/Recovery';
import PasswordRecovery from './containers/Auth/PasswordRecovery';
import Invitation from './containers/Auth/Invitation';

import { hidePreloader } from './utils/preloaderControl';

// export const loadRegisterPage = () =>
//   import(/* webpackChunkName: "RegisterPage" */ './containers/Auth/Register');

function UnAuthorizedApp() {
  useEffect(() => {
    hidePreloader();
  }, []);

  return (
    <Switch>
      <Route exact path="/login">
        <Login />
      </Route>

      <Route exact path="/registration">
        <Register />
      </Route>

      <Route exact path="/recovery">
        <Recovery />
      </Route>

      <Route exact path="/passwordRecovery">
        <PasswordRecovery />
      </Route>

      <Route exact path="/invitation">
        <Invitation />
      </Route>

      <Redirect from="*" to="/login" />

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default UnAuthorizedApp;
