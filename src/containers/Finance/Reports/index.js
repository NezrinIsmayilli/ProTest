import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import {
  AdvanceReport,
  BalanceReport,
  ExpenseReport,
  EmployeeReport,
  CurrencyReport,
  CashboxBalanceReport,
} from './Tabs/tabs';

const { read } = accessTypes;

const mainPath = '/finance/reports';
const paths = {
  expense_report: `${mainPath}/expenses`,
  advance_report: `${mainPath}/advances`,
  employee_payment_report: `${mainPath}/employees`,
  balance_creation_report: `${mainPath}/balances`,
  currency_history_report: `${mainPath}/currencies`,
  cashbox_balance_report: `${mainPath}/cashbox-balance`,
};
const Reports = props => {
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
        path={paths.expense_report}
        I={read}
        a={permissions.expense_report}
        component={ExpenseReport}
      />
      <PrivateRoute
        path={paths.advance_report}
        I={read}
        a={permissions.advance_report}
        component={AdvanceReport}
      />
      <PrivateRoute
        path={paths.employee_payment_report}
        I={read}
        a={permissions.employee_payment_report}
        component={EmployeeReport}
      />
      <PrivateRoute
        path={paths.balance_creation_report}
        I={read}
        a={permissions.balance_creation_report}
        component={BalanceReport}
      />
      <PrivateRoute
        path={paths.currency_history_report}
        I={read}
        a={permissions.currency_history_report}
        component={CurrencyReport}
      />
      <PrivateRoute
        path={paths.cashbox_balance_report}
        I={read}
        a={permissions.cashbox_balance_report}
        component={CashboxBalanceReport}
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
)(Reports);
