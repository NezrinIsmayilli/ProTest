import React from 'react';
import { Route } from 'react-router-dom';
import { CanWithResult } from 'components/Lib';

export function PrivateRoute({ component: Component, I, a, ...rest }) {
  return (
    <Route {...rest}>
      <CanWithResult I={I} a={a}>
        <Component {...rest} />
      </CanWithResult>
    </Route>
  );
}

// PrivateRoute.propTypes = {
//   component: PropTypes.any.isRequired,
//   I: PropTypes.string.isRequired,
//   a: PropTypes.string.isRequired,
// };
