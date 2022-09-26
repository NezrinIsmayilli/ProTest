import React, { Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import { Switch, Redirect } from 'react-router-dom';
import { permissions as permissionKeys, accessTypes } from 'config/permissions';
import {
    Loading,
    SubNavigation,
    PrivateRoute,
    SubRouteLink,
    Can,
} from 'components/Lib';
import {
    getHighestPermissionKey,
    getSubGroupKey,
    getFirstSuitableKey,
    getPermissionsByGroupKey,
} from 'utils';

const { read } = accessTypes;
const Calls = lazy(() => import('./Calls'));
const Messages = lazy(() => import('./Messages'));
const Faq = lazy(() => import('./Faq'));
const Fop = lazy(() => import('./Fop'));
const Reports = lazy(() => import('./Reports'));

const base_path = '/call-center';

const paths = {
    calls: `${base_path}/calls`,
    procall_messages: `${base_path}/messages`,
    faq: `${base_path}/faq`,
    fop: `${base_path}/fop`,
    reports: `${base_path}/reports`,
};

const CallCenter = props => {
    const { permissionsList } = props;
    return (
        <>
            <SubNavigation>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        permissionsList.filter(
                            ({ group_key, sub_group_key }) =>
                                group_key === 'call_center' &&
                                sub_group_key === 'calls'
                        )
                    )}
                >
                    <SubRouteLink
                        path="/call-center/calls"
                        liStyle={{ paddingLeft: '15px' }}
                    >
                        Zənglər
                    </SubRouteLink>
                </Can>
                {/* <Can I={read} a={permissionKeys.procall_messages}>
                    <SubRouteLink
                        path="/call-center/messages"
                        liStyle={{ paddingLeft: '15px' }}
                    >
                        Mesajlar
                    </SubRouteLink>////
                </Can> */}
                <Can I={read} a={permissionKeys.faq}>
                    <SubRouteLink
                        path="/call-center/faq"
                        liStyle={{ paddingLeft: '15px' }}
                    >
                        FAQ
                    </SubRouteLink>
                </Can>
                <Can I={read} a={permissionKeys.procall_tracking_panel}>
                    <SubRouteLink
                        path="/call-center/fop"
                        liStyle={{ paddingLeft: '15px' }}
                    >
                        İzləmə paneli
                    </SubRouteLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        permissionsList.filter(
                            ({ group_key, sub_group_key }) =>
                                group_key === 'call_center' &&
                                sub_group_key === 'reports' // deyis
                        )
                    )}
                >
                    <SubRouteLink
                        path="/call-center/reports"
                        liStyle={{ paddingLeft: '15px' }}
                    >
                        Hesabatlar
                    </SubRouteLink>
                </Can>
            </SubNavigation>

            <Suspense fallback={<Loading />}>
                <Switch>
                    <Redirect
                        exact
                        from="/call-center"
                        to={
                            paths[
                            getSubGroupKey(
                                permissionsList,
                                getFirstSuitableKey(
                                    getPermissionsByGroupKey(
                                        permissionsList,
                                        'call_center'
                                    ),
                                    1
                                )
                            )
                            ]
                        }
                    />
                    <PrivateRoute
                        path={paths.calls}
                        component={Calls}
                        I={read}
                        a={getHighestPermissionKey(
                            permissionsList.filter(
                                ({ group_key, sub_group_key }) =>
                                    group_key === 'call_center' &&
                                    sub_group_key === 'calls'
                            )
                        )}
                    />
                    <PrivateRoute
                        path={paths.procall_messages}
                        component={Messages}
                        I={read}
                        a={permissionKeys.procall_messages}
                    />
                    <PrivateRoute
                        path={paths.faq}
                        component={Faq}
                        I={read}
                        a={permissionKeys.faq}
                    />
                    <PrivateRoute
                        path={paths.fop}
                        component={Fop}
                        I={read}
                        a={permissionKeys.procall_tracking_panel}
                    />
                    <PrivateRoute
                        path={paths.reports}
                        component={Reports}
                        I={read}
                        a={getHighestPermissionKey(
                            permissionsList.filter(
                                ({ group_key, sub_group_key }) =>
                                    group_key === 'call_center' &&
                                    sub_group_key === 'reports'
                            )
                        )}
                    />
                </Switch>
            </Suspense>
        </>
    );
};

const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
});

export default connect(
    mapStateToProps,
    null
)(CallCenter);
