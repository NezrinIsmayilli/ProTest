import React, { lazy } from 'react';
import { connect } from 'react-redux';
import { Sidebar, SidebarLink, Can } from 'components/Lib';
import { getHighestPermissionKey } from 'utils';
import { accessTypes } from 'config/permissions';

const { read } = accessTypes;

const InitialRemainsWarehouseSideBar = lazy(() =>
    import(
        /* webpackChunkName: "InitialRemainsWarehouseSideBar" */ '../initialRemains/warehouse/sidebar'
    )
);
const InitialRemainsCashboxSideBar = lazy(() =>
    import(
        /* webpackChunkName: "InitialRemainsCashboxSideBar" */ '../initialRemains/cashbox/sidebar'
    )
);
const InitialRemainsDebtSideBar = lazy(() =>
    import(
        /* webpackChunkName: "InitialRemainsDebtSideBar" */ '../initialRemains/debt/sidebar'
    )
);

const DefaultSideBar = props => {
    const { permissionsList } = props;
    const getPath = path => `/settings/${path}`;

    const { pathname } = window.location;

    return (
        <>
            <Sidebar title="Nizamlamalar">
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        permissionsList.filter(
                            ({ group_key, sub_group_key }) =>
                                group_key === 'settings' &&
                                sub_group_key === 'msk'
                        )
                    )}
                >
                    <SidebarLink path={getPath('msk')} name="MSK" />
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        permissionsList.filter(
                            ({ group_key, sub_group_key }) =>
                                group_key === 'init_settings' &&
                                sub_group_key === 'initial_remains'
                        )
                    )}
                >
                    <SidebarLink
                        path={getPath('initial-remains')}
                        name="İlkin qalıqlar"
                    />
                </Can>
                {pathname.includes('initial-remains-warehouse') && (
                    <InitialRemainsWarehouseSideBar />
                )}
                {pathname.includes('initial-remains-cashbox') && (
                    <InitialRemainsCashboxSideBar />
                )}
                {pathname.includes('initial-remains-debt') && (
                    <InitialRemainsDebtSideBar />
                )}
            </Sidebar>
        </>
    );
};

const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
});

export default connect(mapStateToProps)(DefaultSideBar);
