import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import Salary from './Salary';
import WorkTimeRecord from './WorkTimeRecord';
import Fines from './Fines';
import { pathNameList } from './#shared/NavigationButtons';

const { read } = accessTypes;

const paths = {
  lateness_report: '/hrm/report/fines',
  payroll: '/hrm/report/salary',
  timecard_report: '/hrm/report/work-time-record',
};

function Report(props) {
  const { permissionsList } = props;
  return (
    <Switch>
      <Redirect
        exact
        from="/hrm/report"
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
        exact
        path={pathNameList.salary}
        I={read}
        a={permissions.payroll}
        component={Salary}
      />

      <PrivateRoute
        exact
        path={pathNameList.worktimerecord}
        I={read}
        a={permissions.timecard_report}
        component={WorkTimeRecord}
      />

      <PrivateRoute
        exact
        path={pathNameList.fines}
        I={read}
        a={permissions.lateness_report}
        component={Fines}
      />
    </Switch>
  );
}

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
});
export default connect(
  mapStateToProps,
  null
)(Report);
