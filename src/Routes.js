/* eslint-disable import/no-cycle */
import React, { Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Loading, PrivateRoute } from 'components/Lib';
import { getHighestPermissionKey } from 'utils';
import { permissions, accessTypes } from './config/permissions';

const Settings = lazy(() =>
  /* webpackChunkName: "Settings" */ import('./containers/Settings')
);
const Profile = lazy(() =>
  /* webpackChunkName: "Profile" */ import('./containers/Profile')
);
const Dashboard = lazy(() =>
  /* webpackChunkName: "Dashboard" */ import('./containers/Dashboard')
);
const Users = lazy(() =>
  /* webpackChunkName: "Users" */ import('./containers/Users')
);
const Relations = lazy(() =>
  /* webpackChunkName: "Relations" */ import('./containers/Relations')
);
const Warehouse = lazy(() =>
  /* webpackChunkName: "Warehouse" */ import('./containers/Warehouse')
);
const SalesBuys = lazy(() =>
  /* webpackChunkName: "SalesBuys" */ import('./containers/SalesBuys')
);
const Finance = lazy(() =>
  /* webpackChunkName: "Finance" */ import('./containers/Finance')
);
const HRM = lazy(() =>
  /* webpackChunkName: "HRM" */ import('./containers/HRM')
);
const Orders = lazy(() =>
  /* webpackChunkName: "Orders" */ import('./containers/Orders/index.js')
);
const CallCenter = lazy(() =>
  /* webpackChunkName: "CallCenter" */ import(
    './containers/CallCenter/index.js'
  )
);
const Reports = lazy(() =>
  /* webpackChunkName: "Reports" */ import('./containers/Reports/index.js')
);
const BusinessUnit = lazy(() =>
  /* webpackChunkName: "BusinessUnit" */ import(
    './containers/BusinessUnit/index.js'
  )
);
const NotFound = lazy(() =>
  /* webpackChunkName: "NotFound" */ import('./containers/NotFound')
);

const mainRoute = '/profile';

// recruitment / jobs
const Jobs = lazy(() =>
  /* webpackChunkName: "Jobs" */ import('./containers/Jobs')
);
const Tasks = lazy(() =>
  /* webpackChunkName: "Tasks" */ import('./containers/Tasks')
);

/* 

common: true
contact: true
dashboard: true
hrm: true
msk: true
order: true
report: true
sales: true
stock: true
task: true
transaction: true
users: true

*/
// authorized routes
function Routes(props) {
  const { permissionsList } = props;

  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Redirect exact from="/" to={mainRoute} />
        <Redirect exact from="/login" to={mainRoute} />
        <Redirect exact from="/registration" to={mainRoute} />

        <Route path="/profile">
          <Profile />
        </Route>
        <PrivateRoute
          path="/settings"
          component={Settings}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(permission => permission.group_key === 'settings' || permission.group_key === 'init_settings')
          )}
        />
        <PrivateRoute
          path="/dashboard"
          component={Dashboard}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'dashboard'
            )
          )}
        />
        <PrivateRoute
          path="/users"
          component={Users}
          I={accessTypes.read}
          a={permissions.users}
        />

        <PrivateRoute
          path="/relations"
          component={Relations}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'contact'
            )
          )}
        />

        <PrivateRoute
          path="/warehouse"
          component={Warehouse}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'stock'
            )
          )}
        />

        <PrivateRoute
          path="/sales"
          component={SalesBuys}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'sales'
            )
          )}
        />

        <PrivateRoute
          path="/finance"
          component={Finance}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'transaction'
            )
          )}
        />

        <PrivateRoute
          path="/hrm"
          component={HRM}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(permission => permission.group_key === 'hrm')
          )}
        />

        <PrivateRoute
          path="/orders"
          component={Orders}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'order'
            )
          )}
        />
        <PrivateRoute
          path="/call-center"
          component={CallCenter}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'call_center'
            )
          )}
        />
        <PrivateRoute
          path="/reports"
          component={Reports}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'report'
            )
          )}
        />
        <PrivateRoute
          path="/business_unit"
          component={BusinessUnit}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'business_unit'
            )
          )}
        />
        <PrivateRoute
          path="/recruitment"
          component={Jobs}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'projobs'
            )
          )}
        />
        {/* <PrivateRoute
          path="/tasks"
          component={Tasks}
          I={accessTypes.read}
          a={getHighestPermissionKey(
            permissionsList.filter(
              permission => permission.group_key === 'projobs'
            )
          )}
        />
        <Route path="/tasks">
          <Tasks />
        </Route> */}

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Suspense>
  );
}

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  null
)(Routes);
