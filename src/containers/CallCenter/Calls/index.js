import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import { MissedCalls, AnsweredCalls, InternalCalls } from './Tabs/tabs';

const { read } = accessTypes;

const mainPath = '/call-center/calls';
const paths = {
  missed_calls: `${mainPath}/missed_calls`,
  answered_calls: `${mainPath}/answered_calls`,
  internal_calls: `${mainPath}/internal_calls`,
};
const Calls = props => {
  const { permissionsList } = props;
  return (
    <Switch>
      <Redirect
        exact
        from={mainPath}
        to={
          paths[
          getFirstSuitableKey(
            permissionsList.filter(permission =>
              Object.keys(paths).includes(permission.key)
            ),
            1
          )
          ]
        }
      />
      <PrivateRoute
        path={paths.missed_calls}
        I={read}
        a={permissions.missed_calls}
        component={MissedCalls}
      />
      <PrivateRoute
        path={paths.answered_calls}
        I={read}
        a={permissions.answered_calls}
        component={AnsweredCalls}
      />
      <PrivateRoute
        path={paths.internal_calls}
        I={read}
        a={permissions.internal_calls}
        component={InternalCalls}
      />
    </Switch>
  );
};

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  null
)(Calls);
