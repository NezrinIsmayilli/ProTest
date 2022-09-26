import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import Workers from './Workers';
import WorkersForm from './Workers/WorkerForm';
import DismissedPeople from './DismissedPeople';
import DismissedPeopleForm from './DismissedPeople/DismissedPeopleForm';
import Operations from './Operations';

const { read, manage } = accessTypes;

const mainPath = '/hrm/employees';
const paths = {
  hrm_working_employees: '/hrm/employees/workers',
  hrm_fired_employees: '/hrm/employees/dismissed-people',
  hrm_activities: '/hrm/employees/operations',
};
const Employees = props => {
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
        exact
        path={`${mainPath}/workers/add`}
        I={manage}
        a={permissions.hrm_working_employees}
        component={WorkersForm}
      />
      <PrivateRoute
        path={`${mainPath}/workers/edit/:id`}
        I={manage}
        a={permissions.hrm_working_employees}
        component={WorkersForm}
      />
      <PrivateRoute
        path={`${mainPath}/workers`}
        I={read}
        a={permissions.hrm_working_employees}
        component={Workers}
      />
      <PrivateRoute
        path={`${mainPath}/dismissed-people/edit/:id`}
        I={manage}
        a={permissions.hrm_fired_employees}
        component={DismissedPeopleForm}
      />
      <PrivateRoute
        path={`${mainPath}/dismissed-people`}
        I={read}
        a={permissions.hrm_fired_employees}
        component={DismissedPeople}
      />
      <PrivateRoute
        path={`${mainPath}/operations`}
        I={read}
        a={permissions.hrm_activities}
        component={Operations}
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
)(Employees);
