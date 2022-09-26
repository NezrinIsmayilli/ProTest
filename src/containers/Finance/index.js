import React, { Suspense, lazy, Fragment } from 'react';
import { Switch, useLocation, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import {
  PrivateRoute,
  Loading,
  SubNavigation,
  SubRouteLink,
  Sidebar,
  Can,
} from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import {
  getHighestPermissionKey,
  getSubGroupKey,
  getFirstSuitableKey,
  getPermissionsByGroupKey,
} from 'utils';

const { manage, read } = accessTypes;

const AddOperation = lazy(() =>
  /* webpackChunkName: "Finance-AddOperation" */ import(
    './Operations/AddOperations'
  )
);
const Reports = lazy(() =>
  /* webpackChunkName: "Finance-Reports" */ import('./Reports')
);
const Operations = lazy(() =>
  /* webpackChunkName: "Finance-Operations" */ import('./Operations')
);
const Recievables = lazy(() =>
  /* webpackChunkName: "Finance-Recievables" */ import('./Recievables')
);
const Payables = lazy(() =>
  /* webpackChunkName: "Finance-Payables" */ import('./Payables')
);
const Vat = lazy(() => /* webpackChunkName: "Finance-Vat" */ import('./Vat'));
const Kassa = lazy(() =>
  /* webpackChunkName: "Finance-Cashbox" */ import('./Cashbox')
);
const ExpenseCatalog = lazy(() =>
  /* webpackChunkName: "Finance-ExpenseCatalog" */ import('./ExpenseCatalog')
);
const SalesBonus = lazy(() =>
  /* webpackChunkName: "Finance-ExpenseCatalog" */ import('./SalesBonus')
);
const PaymentTable = lazy(() =>
  /* webpackChunkName: "Finance-PaymentTable" */ import('./PaymentTable')
);

const base_path = '/finance';

const paths = {
  operations: `${base_path}/operations`,
  accounts: `${base_path}/cashbox`,
  expenses: `${base_path}/expenses`,
  reports: `${base_path}/reports`,
  transaction_vat_report: `${base_path}/vat`,
  transaction_recievables_report: `${base_path}/recievables`,
  transaction_payables_report: `${base_path}/payables`,
  salesBonus: `${base_path}/sales_bonus`,
  credits: `${base_path}/payment_table`,
};

const Finance = props => {
  const { permissionsList } = props;
  const location = useLocation();
  const { pathname } = location;
  const showNavAndSidebar = !/add|\/edit/.test(pathname);

  return (
    <Fragment>
      {showNavAndSidebar && (
        <Fragment>
          <SubNavigation>
            <Can
              I={read}
              a={getHighestPermissionKey(
                permissionsList.filter(
                  ({ group_key, sub_group_key }) =>
                    group_key === 'transaction' &&
                    sub_group_key === 'operations'
                )
              )}
            >
              <SubRouteLink
                path="/finance/operations"
                liStyle={{ paddingRight: '15px' }}
              >
                Əməliyyatlar
              </SubRouteLink>
            </Can>
            <Can I={read} a={permissions.accounts}>
              <SubRouteLink
                path="/finance/cashbox"
                liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
              >
                Hesablar
              </SubRouteLink>
            </Can>

            <Can I={read} a={permissions.transaction_recievables_report}>
              <SubRouteLink
                path={paths.transaction_recievables_report}
                liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
              >
                Debitor borclar
              </SubRouteLink>
            </Can>
            <Can I={read} a={permissions.transaction_payables_report}>
              <SubRouteLink
                path={paths.transaction_payables_report}
                liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
              >
                Kreditor borclar
              </SubRouteLink>
            </Can>
            <Can I={read} a={permissions.transaction_vat_report}>
              <SubRouteLink
                path={paths.transaction_vat_report}
                liStyle={{ paddingRight: '15px', paddingLeft: '15px' }}
              >
                ƏDV
              </SubRouteLink>
            </Can>
            <Can I={read} a={permissions.expenses}>
              <SubRouteLink
                path={paths.expenses}
                liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
              >
                Xərc maddələri
              </SubRouteLink>
            </Can>
            <Can
              I={read}
              a={getHighestPermissionKey(
                permissionsList.filter(
                  ({ group_key, sub_group_key }) =>
                    group_key === 'transaction' &&
                    sub_group_key === 'salesBonus'
                )
              )}
            >
              <SubRouteLink
                path={paths.salesBonus}
                liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
              >
                Satışdan bonus
              </SubRouteLink>
            </Can>
            <Can
              I={read}
              a={getHighestPermissionKey(
                permissionsList.filter(
                  ({ group_key, sub_group_key }) =>
                    group_key === 'transaction' && sub_group_key === 'credits'
                )
              )}
            >
              <SubRouteLink
                path={paths.credits}
                liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
              >
                Ödəniş cədvəli
              </SubRouteLink>
            </Can>
            <Can
              I={read}
              a={getHighestPermissionKey(
                permissionsList.filter(
                  ({ group_key, sub_group_key }) =>
                    group_key === 'transaction' && sub_group_key === 'reports'
                )
              )}
            >
              <SubRouteLink
                path={paths.reports}
                liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
              >
                Hesabatlar
              </SubRouteLink>
            </Can>
          </SubNavigation>
          <Sidebar />
        </Fragment>
      )}
      <Suspense fallback={<Loading />}>
        <Switch>
          <Redirect
            exact
            from="/finance"
            to={
              paths[
                getSubGroupKey(
                  permissionsList,
                  getFirstSuitableKey(
                    getPermissionsByGroupKey(permissionsList, 'transaction'),
                    1
                  )
                )
              ]
            }
          />
          <PrivateRoute
            path="/finance/operations/add"
            component={AddOperation}
            I={manage}
            a={getHighestPermissionKey(
              permissionsList.filter(
                ({ group_key, sub_group_key }) =>
                  group_key === 'transaction' && sub_group_key === 'operations'
              )
            )}
          />
          <PrivateRoute
              path={"/finance/operations/edit/:id"}
              component={AddOperation}
              I={manage}
              a={getHighestPermissionKey(
                permissionsList.filter(
                  ({ group_key, sub_group_key }) =>
                    group_key === 'transaction' && sub_group_key === 'operations'
                )
              )}
            />
          <PrivateRoute
            path={paths.operations}
            component={Operations}
            I={read}
            a={getHighestPermissionKey(
              permissionsList.filter(
                ({ group_key, sub_group_key }) =>
                  group_key === 'transaction' && sub_group_key === 'operations'
              )
            )}
          />
          <PrivateRoute
            path={paths.accounts}
            component={Kassa}
            I={read}
            a={permissions.accounts}
          />
          <PrivateRoute
            path={paths.transaction_recievables_report}
            component={Recievables}
            I={read}
            a={permissions.transaction_recievables_report}
          />
          <PrivateRoute
            path={paths.transaction_payables_report}
            component={Payables}
            I={read}
            a={permissions.transaction_payables_report}
          />
          <PrivateRoute
            path={paths.transaction_vat_report}
            component={Vat}
            I={read}
            a={permissions.transaction_vat_report}
          />
          <PrivateRoute
            path={paths.expenses}
            component={ExpenseCatalog}
            I={read}
            a={permissions.expenses}
          />
          <PrivateRoute
            path={paths.reports}
            component={Reports}
            I={read}
            a={getHighestPermissionKey(
              permissionsList.filter(
                ({ group_key, sub_group_key }) =>
                  group_key === 'transaction' && sub_group_key === 'reports'
              )
            )}
          />
          <PrivateRoute
            path={paths.salesBonus}
            component={SalesBonus}
            I={read}
            a={getHighestPermissionKey(
              permissionsList.filter(
                ({ group_key, sub_group_key }) =>
                  group_key === 'transaction' && sub_group_key === 'salesBonus'
              )
            )}
          />
          <PrivateRoute
            path={paths.credits}
            component={PaymentTable}
            I={read}
            a={getHighestPermissionKey(
              permissionsList.filter(
                ({ group_key, sub_group_key }) =>
                  group_key === 'transaction' && sub_group_key === 'credits'
              )
            )}
          />
        </Switch>
      </Suspense>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  {}
)(Finance);
