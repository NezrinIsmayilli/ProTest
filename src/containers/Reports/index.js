import React, { Suspense, lazy } from 'react';
import { Switch, Redirect } from 'react-router-dom';
import {
  Loading,
  SubNavigation,
  SubRouteLink,
  PrivateRoute,
} from 'components/Lib';
import { connect } from 'react-redux';
import Can from 'components/Lib/Can';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';

// const BalanceSheet = lazy(() => import('./tabs/BalanceSheet'));
const SalesReport = lazy(() => import('./tabs/SalesReport'));
const DebtsTurnovers = lazy(() => import('./tabs/DebtsTurnovers'));
const ProfitAndLoss = lazy(() => import('./tabs/ProfitAndLoss'));
const BalanceSheet = lazy(() => import('./tabs/BalanceSheet'));
const ProfitCenter = lazy(() => import('./tabs/ProfitCenter'));
const Expenses = lazy(() => import('./tabs/Expenses'));
const Salary = lazy(() => import('./tabs/Salary'));

const pathList = {
  sales_report: '/reports/sales-report',
  debt_turnover: '/reports/debts-turnovers',
  profit_and_loss: '/reports/profit-and-loss',
  balance_sheet_report: '/reports/balance_sheet_report',
  profit_center_contracts: '/reports/profit_center',
  payment_report: '/reports/payment_report',
  salary_report: '/reports/salary',
};
const Reports = ({ permissionsList }) => (
  <>
    <SubNavigation>
      <Can I={accessTypes.read} a={permissions.sales_report}>
        <SubRouteLink
          path={pathList.sales_report}
          liStyle={{ paddingRight: '15px' }}
        >
          Satış hesabatı
        </SubRouteLink>
      </Can>
      <Can I={accessTypes.read} a={permissions.debt_turnover}>
        <SubRouteLink
          path={pathList.debt_turnover}
          liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
        >
          Borc dövriyyəsi
        </SubRouteLink>
      </Can>
      <Can I={accessTypes.read} a={permissions.profit_and_loss_report}>
        <SubRouteLink
          path={pathList.profit_and_loss}
          liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
        >
          Mənfəət və Zərər
        </SubRouteLink>
      </Can>
      <Can I={accessTypes.read} a={permissions.balance_sheet_report}>
        <SubRouteLink
          path="/reports/balance_sheet_report"
          liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
        >
          Balans hesabatı
        </SubRouteLink>
      </Can>
      <Can I={accessTypes.read} a={permissions.profit_center_contracts}>
        <SubRouteLink
          path="/reports/profit_center"
          liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
        >
          Mənfəət mərkəzləri
        </SubRouteLink>
      </Can>
      <Can I={accessTypes.read} a={permissions.payment_report}>
        <SubRouteLink
          path="/reports/payment_report"
          liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
        >
          Xərclər
        </SubRouteLink>
      </Can>
      <Can I={accessTypes.read} a={permissions.salary_report}>
        <SubRouteLink
          path="/reports/salary"
          liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
        >
          Əməkhaqqı hesabatı
        </SubRouteLink>
      </Can>
    </SubNavigation>

    <Suspense fallback={<Loading />}>
      <Switch>
        <Redirect
          exact
          from="/reports"
          to={
            pathList[
              getFirstSuitableKey(
                permissionsList.filter(
                  permission => permission.group_key === 'report'
                ),
                1
              )
            ]
          }
        />
        <PrivateRoute
          path={pathList.sales_report}
          I={accessTypes.read}
          a={permissions.sales_report}
          component={SalesReport}
        />
        <PrivateRoute
          path={pathList.debt_turnover}
          I={accessTypes.read}
          a={permissions.debt_turnover}
          component={DebtsTurnovers}
        />
        <PrivateRoute
          path={pathList.profit_and_loss}
          I={accessTypes.read}
          a={permissions.profit_and_loss_report}
          component={ProfitAndLoss}
        />
        <PrivateRoute
          path={pathList.balance_sheet_report}
          I={accessTypes.read}
          a={permissions.balance_sheet_report}
          component={BalanceSheet}
        />
        <PrivateRoute
          path={pathList.profit_center_contracts}
          I={accessTypes.read}
          a={permissions.profit_center_contracts}
          component={ProfitCenter}
        />
        <PrivateRoute
          path={pathList.payment_report}
          I={accessTypes.read}
          a={permissions.payment_report}
          component={Expenses}
        />
        <PrivateRoute
          path={pathList.salary_report}
          I={accessTypes.read}
          a={permissions.salary_report}
          component={Salary}
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
)(Reports);
