import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import CreditPayments from './CreditPayments';
import CreditTables from './CreditTables';

const { read } = accessTypes;

const mainPath = '/finance/payment_table';
const paths = {
  credit_payments: `${mainPath}/credit_payments`,
  credits_table: `${mainPath}/credits_table`,
};
const PaymentTable = props => {
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
        path={paths.credit_payments}
        I={read}
        a={permissions.credit_payments}
        component={CreditPayments}
      />
      <PrivateRoute
        path={paths.credits_table}
        I={read}
        a={permissions.credits_table}
        component={CreditTables}
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
)(PaymentTable);
