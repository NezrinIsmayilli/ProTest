import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { Days, Months, Quarters } from './tabs';

const { read } = accessTypes;

const mainPath = '/call-center/reports/main_indicators';
const paths = {
  days: `${mainPath}/days`,
  month: `${mainPath}/month`,
  quarter: `${mainPath}/quarter`,
};
const MainIndicatorsReports = () => (
  <Switch>
    <Redirect exact from={mainPath} to={paths.month} />

    <PrivateRoute
      path={paths.days}
      I={read}
      a={permissions.main_indicators}
      component={Days}
    />
    <PrivateRoute
      path={paths.month}
      I={read}
      a={permissions.main_indicators}
      component={Months}
    />
    <PrivateRoute
      path={paths.quarter}
      I={read}
      a={permissions.main_indicators}
      component={Quarters}
    />
  </Switch>
);

const mapStateToProps = () => ({});

export const MainIndicatorsReport = connect(
  mapStateToProps,
  {}
)(MainIndicatorsReports);
