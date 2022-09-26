import React, { Fragment, lazy, Suspense } from 'react';
import { connect, useSelector } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import { ProfileSkeleton } from './shared';

const Main = lazy(() => import(/* webpackChunkName: "ProfileMain" */ './Main'));

const Company = lazy(() =>
  import(/* webpackChunkName: "ProfileCompany" */ './Company')
);

const Security = lazy(() =>
  import(/* webpackChunkName: "ProfileSecurity" */ './Security')
);

// const Plans = lazy(() =>
//   import(/* webpackChunkName: "ProfilePlans" */ './Plans')
// );

const Invoice = lazy(() =>
  import(/* webpackChunkName: "ProfileInvoice" */ './Invoice')
);

const AuditLog = lazy(() =>
  import(/* webpackChunkName: "AuditLog" */ './AuditLog')
);

const Apps = lazy(() => import(/* webpackChunkName: "Apps" */ './Apps'));

const Requisites = lazy(() =>
  import(/* webpackChunkName: "Requisites" */ './Requisites')
);

const Operations = lazy(() =>
  import(/* webpackChunkName: "Operations" */ './Operations')
);

const getPath = path => `/profile/${path}`;

function Profile({ permissionsList }) {
  const isAdmin = useSelector(state => state.tenantReducer.isAdmin);

  const permissionsListReq = permissionsList.filter(
    permission => permission.key === 'tenant_requisites'
  );

  return (
    <Fragment>
      <Suspense fallback={<ProfileSkeleton />}>
        <Switch>
          <Redirect exact from="/profile" to={getPath('main')} />
          <Route exact path={getPath('main')}>
            <Main />
          </Route>

          <Route exact path={getPath('security')}>
            <Security />
          </Route>

          {isAdmin ? (
            <Fragment>
              <Route exact path={getPath('company')}>
                <Company />
              </Route>

              <Route exact path={getPath('invoice')}>
                <Invoice />
              </Route>

              <Route exact path={getPath('logs')}>
                <AuditLog />
              </Route>

              <Route exact path={getPath('apps')}>
                <Apps />
              </Route>
              {/* <Route exact path={getPath('plans')}>
                <Plans />
              </Route> */}

              <Route exact path={getPath('requisites')}>
                <Requisites />
              </Route>
              <Route exact path={getPath('operations')}>
                <Operations />
              </Route>
            </Fragment>
          ) : null}

          {permissionsListReq[0]?.permission !== 0 ? (
            <Route exact path={getPath('requisites')}>
              <Requisites />
            </Route>
          ) : null}
        </Switch>
      </Suspense>
    </Fragment>
  );
}
const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  null
)(Profile);
