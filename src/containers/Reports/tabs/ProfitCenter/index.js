import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import { ProfitContractsReport } from './Tabs/tabs';

const { read } = accessTypes;

const mainPath = '/reports/profit_center';
const paths = {
  profit_center_contracts: `${mainPath}/profit_center_contracts`,
};
const ProfitCenter = props => {
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
        path={paths.profit_center_contracts}
        I={read}
        a={permissions.profit_center_contracts}
        component={ProfitContractsReport}
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
)(ProfitCenter);
