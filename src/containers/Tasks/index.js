import React, { Suspense, Fragment } from 'react';
import { Switch, Redirect, useLocation } from 'react-router-dom';
import {
  Loading,
  PrivateRoute,
  SubNavigation,
  SubRouteLink,
} from 'components/Lib';
import Can from 'components/Lib/Can';
import { permissions, accessTypes } from 'config/permissions';
import { connect } from 'react-redux';
import Assignments from './Assignments';
import './tasks.css';
import './advanced-tasks.css';

const paths = {
  assignments: '/tasks/assignments',
};
const Tasks = () => {
  const location = useLocation();
  const { pathname } = location;
  const showNavAndSidebar = !/new|edit/.test(pathname);
  return (
    <>
      {showNavAndSidebar && (
        <Fragment>
          <SubNavigation>
            <Can I={accessTypes.read} a={permissions.contact}>
              <SubRouteLink
                path={paths.assignments}
                liStyle={{ paddingRight: '15px' }}
              >
                Tapşırıqlar jurnalı
              </SubRouteLink>
            </Can>
          </SubNavigation>
        </Fragment>
      )}
      <Suspense fallback={<Loading />}>
        <Switch>
          <Redirect exact from="/tasks" to="/tasks/assignments" />
          <PrivateRoute
            path="/tasks/assignments"
            component={Assignments}
            I={accessTypes.manage}
            a={permissions.contact}
          />
        </Switch>
      </Suspense>
    </>
  );
};

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
});
export default connect(
  mapStateToProps,
  null
)(Tasks);
