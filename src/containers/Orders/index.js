import React, { Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import { Switch, Redirect } from 'react-router-dom';
import {
  Loading,
  SubNavigation,
  SubRouteLink,
  Can,
  PrivateRoute,
} from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';

const Goods = lazy(() => import('./Goods'));
const Orders = lazy(() => import('./Orders'));
const Reports = lazy(() => import('./Reports'));

const paths = {
  order: '/orders/orders',
  order_basket: '/orders/goods',
  order_report: '/orders/reports',
};
const OrdersModule = ({ permissionsList }) => (
  <>
    <SubNavigation>
      <Can I={accessTypes.read} a={permissions.order}>
        <SubRouteLink path="/orders/orders" liStyle={{ paddingRight: '15px' }}>
          Sifarişlər
        </SubRouteLink>
      </Can>
      <Can I={accessTypes.read} a={permissions.order_basket}>
        <SubRouteLink path="/orders/goods" liStyle={{ paddingLeft: '15px' }}>
          Məhsul kataloqu
        </SubRouteLink>
      </Can>
      <Can I={accessTypes.read} a={permissions.order_report}>
        <SubRouteLink path="/orders/reports" liStyle={{ paddingLeft: '15px' }}>
          Hesabatlar
        </SubRouteLink>
      </Can>
    </SubNavigation>

    <Suspense fallback={<Loading />}>
      <Switch>
        <Redirect
          exact
          from="/orders"
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
          path="/orders/goods"
          component={Goods}
          I={accessTypes.read}
          a={permissions.order_basket}
        />
        <PrivateRoute
          path="/orders/orders"
          component={Orders}
          I={accessTypes.read}
          a={permissions.order}
        />
        <PrivateRoute
          path="/orders/reports"
          component={Reports}
          I={accessTypes.read}
          a={permissions.order_report}
        />
      </Switch>
    </Suspense>
  </>
);

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  null
)(OrdersModule);
