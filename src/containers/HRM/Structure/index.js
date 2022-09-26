import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import Sections from './Sections';
import Positions from './Positions';
import Tree from './Tree';

const { read } = accessTypes;

const mainPath = '/hrm/structure';
const paths = {
  structure: '/hrm/structure/sections',
  occupation: '/hrm/structure/positions',
  tree: '/hrm/structure/tree',
};
function Structure(props) {
  const { permissionsList } = props;
  return (
    <Switch>
      <Redirect
        exact
        from="/hrm/structure"
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
        exact
        path={`${mainPath}/sections`}
        I={read}
        a={permissions.structure}
        component={Sections}
      />
      <PrivateRoute
        exact
        path={`${mainPath}/positions`}
        I={read}
        a={permissions.occupation}
        component={Positions}
      />
      <PrivateRoute
        exact
        path={`${mainPath}/tree`}
        I={read}
        a={permissions.structure}
        component={Tree}
      />
    </Switch>
  );
}

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
});
export default connect(
  mapStateToProps,
  null
)(Structure);
