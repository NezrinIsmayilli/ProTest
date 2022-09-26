import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrivateRoute } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { getFirstSuitableKey } from 'utils';
import {
    OperatorReports,
    StatusHistoryReports,
    SupervisorReports,
    MainIndicatorsReport,
} from './Tabs/tabs';

const { read } = accessTypes;

const mainPath = '/call-center/reports';
const paths = {
    statistics_of_operators: `${mainPath}/operator_reports`,
    supervisor_panel: `${mainPath}/supervisor_panel`,
    procall_status_history: `${mainPath}/procall_status_history`,
    main_indicators: `${mainPath}/main_indicators`,
};
const Reports = props => {
    const { permissionsList } = props;
    return (
        <>
            <Switch>
                <Redirect
                    exact
                    from={mainPath}
                    to={
                        paths[
                            getFirstSuitableKey(
                                permissionsList
                                    .filter(
                                        ({ key }) =>
                                            key !== 'main_indicators' &&
                                            key !== 'procall_messages'
                                    )
                                    .filter(permission =>
                                        Object.keys(paths).includes(
                                            permission.key
                                        )
                                    ),
                                1
                            )
                        ]
                    }
                />
                <PrivateRoute
                    path={paths.statistics_of_operators}
                    I={read}
                    a={permissions.statistics_of_operators}
                    component={OperatorReports}
                />
                <PrivateRoute
                    path={paths.supervisor_panel}
                    I={read}
                    a={permissions.supervisor_panel}
                    component={SupervisorReports}
                />
                <PrivateRoute
                    path={paths.procall_status_history}
                    I={read}
                    a={permissions.procall_status_history}
                    component={StatusHistoryReports}
                />
                {/* <PrivateRoute
                    path={paths.main_indicators}
                    I={read}
                    a={permissions.main_indicators}
                    component={MainIndicatorsReport}
                /> */}
            </Switch>
        </>
    );
};

const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
});

export default connect(
    mapStateToProps,
    null
)(Reports);
