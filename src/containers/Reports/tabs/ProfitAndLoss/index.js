import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { Month, Year, Quarter } from './tabs';

const { read } = accessTypes;

const mainPath = '/reports/profit-and-loss';
const paths = {
  byMonth: `${mainPath}/by-month`,
  byQuarter: `${mainPath}/by-quarter`,
  byYear: `${mainPath}/by-year`,
};
const Reports = () => (
  <Switch>
    <Redirect exact from={mainPath} to={paths.byMonth} />
    <PrivateRoute
      path={paths.byMonth}
      I={read}
      a={permissions.profit_and_loss_report}
      component={Month}
    />
    <PrivateRoute
      path={paths.byQuarter}
      I={read}
      a={permissions.profit_and_loss_report}
      component={Quarter}
    />
    <PrivateRoute
      path={paths.byYear}
      I={read}
      a={permissions.profit_and_loss_report}
      component={Year}
    />
  </Switch>
);

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  {}
)(Reports);
