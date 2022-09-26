import React, { Suspense, lazy, Fragment } from 'react';
import { Sidebar, SubRouteLink, SubNavigation } from 'components/Lib';
import { connect } from 'react-redux';
import { Switch, Redirect } from 'react-router-dom';

const Apps = lazy(() => import('./apps'));

const pathList = {
  apps: '/profile/apps',
};

const AppTab = () => (
  <>
    <Fragment>
      <SubNavigation>
        <SubRouteLink
          path={pathList.apps}
          key="apps"
          liStyle={{ paddingRight: '15px' }}
        >
          Tətbiqlər
        </SubRouteLink>
      </SubNavigation>
      <Sidebar />
    </Fragment>

    <Suspense>
      <Switch>
        <Redirect exact from="/profile" />
        <Apps />
      </Switch>
    </Suspense>
  </>
);

const mapStateToProps = state => ({});
export default connect(
  mapStateToProps,
  null
)(AppTab);
