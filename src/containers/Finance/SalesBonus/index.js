import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import Regulation from './Regulation';
import EmployeeBonus from './EmployeeBonus';

const { read } = accessTypes;

const mainPath = '/finance/sales_bonus';
const paths = {
  employee_sales_bonus_configuration: `${mainPath}/employee_bonus`,
  sales_bonus_configuration: `${mainPath}/sales_bonus_configuration`,
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
        path={paths.employee_sales_bonus_configuration}
        I={read}
        a={permissions.employee_sales_bonus_configuration}
        component={EmployeeBonus}
      />
      <PrivateRoute
        path={paths.sales_bonus_configuration}
        I={read}
        a={permissions.sales_bonus_configuration}
        component={Regulation}
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
