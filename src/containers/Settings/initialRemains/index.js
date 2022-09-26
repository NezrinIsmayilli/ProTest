import React, { Suspense, lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { getFirstSuitableKey, getPermissionsByGroupKey } from 'utils';
import {
    Sidebar,
    SidebarLink,
    SubRouteLink,
    MyLayout,
    Col,
    Can,
    Row,
    PrivateRoute,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { permissions, accessTypes } from 'config/permissions';
import SettingsSkeleton from '../SettingsSkeleton';
import DefaultSidebar from '../sidebar';

const InitialRemainsWarehouse = lazy(() =>
    import(
        /* webpackChunkName: "InitialRemainsWarehouse" */ './warehouse/initialRemainsWarehouse'
    )
);
const AddInitialRemainsWarehouse = lazy(() =>
    import(
        /* webpackChunkName: "AddInitialRemainsWarehouse" */ './warehouse/addInitialRemainsWarehouse'
    )
);
const InitialRemainsCashbox = lazy(() =>
    import(/* webpackChunkName: "InitialRemainsCashbox" */ './cashbox')
);
const InitialRemainsDebt = lazy(() =>
    import(/* webpackChunkName: "InitialRemainsDebt" */ './debt')
);

const base = '/settings/initial-remains';

const pathList = {
    initialRemains: '/initial-remains',
    sales_init_invoice: '/initial-remains-warehouse',
    addInitialRemainsWarehouse: '/initial-remains-warehouse/add',
    editInitialRemainsWarehouse: '/initial-remains-warehouse/edit/:id',
    transaction_initial_balance: '/initial-remains-cashbox',
    sales_initial_debt: '/initial-remains-debt',
};

function InitialRemains({
    permissionsList,
    profile,
    fetchBusinessUnitList,
    businessUnits,
}) {
    const location = useLocation();
    const { pathname } = location;
    const showNavAndSidebar = !/add|\/edit/.test(pathname);

    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
        });
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
    }, [fetchBusinessUnitList, profile.businessUnits]);

    return (
        <>
            {showNavAndSidebar && (
                <DefaultSidebar
                    businessUnits={businessUnits}
                    profile={profile}
                />
            )}
            <MyLayout>
                {showNavAndSidebar && (
                    <Row>
                        <Col>
                            <Can
                                I={accessTypes.read}
                                a={permissions.sales_init_invoice}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.sales_init_invoice}`}
                                    key="Anbar"
                                >
                                    Anbar
                                </SubRouteLink>
                            </Can>
                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_cashbox}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.transaction_initial_balance}`}
                                    key="Hesab"
                                >
                                    Hesab
                                </SubRouteLink>
                            </Can>
                            <Can
                                I={accessTypes.read}
                                a={permissions.sales_initial_debt}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.sales_initial_debt}`}
                                    key="Borc"
                                >
                                    Borc
                                </SubRouteLink>
                            </Can>
                        </Col>
                    </Row>
                )}

                <Row>
                    <Col>
                        <div className={showNavAndSidebar && 'fixMskScroll'}>
                            <Suspense fallback={<SettingsSkeleton />}>
                                <Switch>
                                    <Redirect
                                        exact
                                        from="/settings/initial-remains"
                                        to={`${base}${
                                            pathList[
                                                getFirstSuitableKey(
                                                    getPermissionsByGroupKey(
                                                        permissionsList,
                                                        'init_settings'
                                                    ),
                                                    1
                                                )
                                            ]
                                        }`}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.sales_init_invoice}`}
                                        component={InitialRemainsWarehouse}
                                        I={accessTypes.read}
                                        a={permissions.sales_init_invoice}
                                    />
                                    <PrivateRoute
                                        path={`${base}${pathList.addInitialRemainsWarehouse}`}
                                        component={AddInitialRemainsWarehouse}
                                        I={accessTypes.read}
                                        a={permissions.sales_init_invoice}
                                    />
                                    <PrivateRoute
                                        path={`${base}${pathList.editInitialRemainsWarehouse}`}
                                        component={AddInitialRemainsWarehouse}
                                        I={accessTypes.read}
                                        a={permissions.sales_init_invoice}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.transaction_initial_balance}`}
                                        component={InitialRemainsCashbox}
                                        I={accessTypes.read}
                                        a={
                                            permissions.transaction_initial_balance
                                        }
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.sales_initial_debt}`}
                                        component={InitialRemainsDebt}
                                        I={accessTypes.read}
                                        a={permissions.sales_initial_debt}
                                    />
                                </Switch>
                            </Suspense>
                        </div>
                    </Col>
                </Row>
            </MyLayout>
        </>
    );
}
const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
    mapStateToProps,
    { fetchBusinessUnitList }
)(InitialRemains);
