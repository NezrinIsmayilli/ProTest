import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { PrivateRoute } from 'components/Lib';
import { connect } from 'react-redux';
import { permissions, accessTypes } from 'config/permissions';

import { getFirstSuitableKey } from 'utils';
import AttendanceJournal from './AttendanceJournal';
import ProductionCalendar from './ProductionCalendar';
import WorkSchedule from './WorkSchedule';

import { pathNameList } from './Shared/NavigationButtons';

/*

export const pathNameList = {
  timecard: `${basePathName}/attendance-journal`,
  work_schedule: `${basePathName}/work-schedule`,
  calendar: `${basePathName}/production-calendar`,
};

*/

const { read } = accessTypes;

const Attendance = props => {
  const { permissionsList } = props;
  return (
    <Switch>
      <Redirect
        exact
        from="/hrm/attendance"
        to={
          pathNameList[
            getFirstSuitableKey(
              permissionsList.filter(permission =>
                Object.keys(pathNameList).includes(permission.key)
              ),
              1
            )
          ]
        }
      />
      <PrivateRoute
        path={pathNameList.timecard}
        I={read}
        a={permissions.timecard}
        component={AttendanceJournal}
      />
      <PrivateRoute
        exact
        path={pathNameList.calendar}
        I={read}
        a={permissions.calendar}
        component={ProductionCalendar}
      />
      <PrivateRoute
        path={pathNameList.work_schedule}
        I={read}
        a={permissions.work_schedule}
        component={WorkSchedule}
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
)(Attendance);
