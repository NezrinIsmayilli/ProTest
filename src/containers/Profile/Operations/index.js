import React, { Suspense, lazy, Fragment } from 'react';
import { Sidebar, SubRouteLink, SubNavigation } from 'components/Lib';
import { connect } from 'react-redux';
import { Switch, Redirect } from 'react-router-dom';

const Operations = lazy(() => import('./operation'));

const pathList = {
  operations: '/profile/operations',
};

const OperationTab = () => (
  <>
    <Fragment>
      <SubNavigation>
        <SubRouteLink
          path={pathList.operations}
          key="operations"
          liStyle={{ paddingRight: '15px' }}
        >
          Əməliyyatların siyahisi
        </SubRouteLink>
      </SubNavigation>
      <Sidebar />
    </Fragment>

    <Suspense>
      <Switch>
        <Redirect exact from="/profile" />
        <Operations />
      </Switch>
    </Suspense>
  </>
);

const mapStateToProps = state => ({});
export default connect(
  mapStateToProps,
  null
)(OperationTab);
