import React, { Suspense, lazy, Fragment } from 'react';
import { Switch, Redirect, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  Loading,
  Sidebar,
  SubNavigation,
  SubRouteLink,
  PrivateRoute,
} from 'components/Lib';
import { accessTypes } from 'config/permissions';
import Can from 'components/Lib/Can';
import {
  getFirstSuitableKey,
  getHighestPermissionKey,
} from 'utils/permissions';
import { hrmMainPathList } from './hrmAvialableRoutes';

const Employees = lazy(() => import('./Employees'));
const Structure = lazy(() => import('./Structure'));
const Attendance = lazy(() => import('./Attendance'));
const Report = lazy(() => import('./Report'));

const workers = [
  'hrm_working_employees',
  'hrm_fired_employees',
  'hrm_activities',
];
const structure = ['structure', 'occupation'];
const attendance = ['calendar', 'timecard', 'work_schedule'];
const report = ['lateness_report', 'payroll', 'timecard_report'];

const HRM = props => {
  const { permissionsList } = props;
  const location = useLocation();
  const { pathname } = location;

  const showNavAndSidebar = !/add|edit/.test(pathname);

  return (
    <Fragment>
      {showNavAndSidebar && (
        <Fragment>
          <SubNavigation>
            <Can
              I={accessTypes.read}
              a={getHighestPermissionKey(
                permissionsList.filter(permission =>
                  workers.includes(permission.key)
                )
              )}
            >
              <SubRouteLink path="/hrm/employees">Əməkdaşlar</SubRouteLink>
            </Can>

            <Can
              I={accessTypes.read}
              a={getHighestPermissionKey(
                permissionsList.filter(permission =>
                  structure.includes(permission.key)
                )
              )}
            >
              <SubRouteLink path="/hrm/structure">Struktur</SubRouteLink>
            </Can>

            <Can
              I={accessTypes.read}
              a={getHighestPermissionKey(
                permissionsList.filter(permission =>
                  attendance.includes(permission.key)
                )
              )}
            >
              <SubRouteLink path="/hrm/attendance">Davamiyyət</SubRouteLink>
            </Can>
            <Can
              I={accessTypes.read}
              a={getHighestPermissionKey(
                permissionsList.filter(permission =>
                  report.includes(permission.key)
                )
              )}
            >
              <SubRouteLink path="/hrm/report">Hesabatlar</SubRouteLink>
            </Can>
          </SubNavigation>
          <Sidebar />
        </Fragment>
      )}

      <Suspense fallback={<Loading />}>
        <Switch>
          <Redirect
            exact
            from="/hrm"
            to={
              hrmMainPathList[
                getFirstSuitableKey(
                  permissionsList.filter(
                    permission => permission.group_key === 'hrm'
                  )
                )
              ]
            }
          />
          <PrivateRoute
            path="/hrm/employees"
            I={accessTypes.read}
            a={getHighestPermissionKey(
              permissionsList.filter(permission =>
                workers.includes(permission.key)
              )
            )}
            component={Employees}
          />

          <PrivateRoute
            path="/hrm/structure"
            I={accessTypes.read}
            a={getHighestPermissionKey(
              permissionsList.filter(permission =>
                structure.includes(permission.key)
              )
            )}
            component={Structure}
          />

          <PrivateRoute
            path="/hrm/attendance"
            I={accessTypes.read}
            a={getHighestPermissionKey(
              permissionsList.filter(permission =>
                attendance.includes(permission.key)
              )
            )}
            component={Attendance}
          />

          <PrivateRoute
            path="/hrm/report"
            I={accessTypes.read}
            a={getHighestPermissionKey(
              permissionsList.filter(permission =>
                report.includes(permission.key)
              )
            )}
            component={Report}
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
  null
)(HRM);
