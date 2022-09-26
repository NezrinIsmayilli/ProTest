import React, { Suspense, lazy, Fragment } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    getSubGroupKey,
    getFirstSuitableKey,
    getPermissionsByGroupKey,
} from 'utils';

const MSK = lazy(() => import(/* webpackChunkName: "MSK" */ './MSK'));

const InitialRemains = lazy(() =>
    import(/* webpackChunkName: "InitialRemains" */ './initialRemains')
);

const Settings = props => {
    const { permissionsList } = props;
    const paths = {
        msk: `/settings/msk`,
        initial_remains: `/settings/initial-remains`,
    };

    return (
        <>
            <Fragment>
                <Suspense>
                    <Switch>
                        <Redirect
                            exact
                            from="/settings"
                            to={
                                paths[
                                    getSubGroupKey(
                                        permissionsList,
                                        getFirstSuitableKey(
                                            [
                                                ...getPermissionsByGroupKey(permissionsList, 'settings'),
                                                ...getPermissionsByGroupKey(
                                                    permissionsList,
                                                    'init_settings'
                                                ),
                                            ],
                                            1
                                        )
                                    )
                                ]
                            }
                        />
                        <Route path="/settings/msk">
                            <MSK />
                        </Route>

                        <Route path="/settings/initial-remains">
                            <InitialRemains />
                        </Route>
                    </Switch>
                </Suspense>
            </Fragment>
        </>
    );
};

const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
});

export default connect(
    mapStateToProps,
    {}
)(Settings);
