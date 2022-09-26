import React, { Suspense, lazy, Fragment } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    SubRouteLink,
    MyLayout,
    Col,
    Can,
    Row,
    PrivateRoute,
} from 'components/Lib';
import { getFirstSuitableKey, getPermissionsByGroupKey } from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import SettingsSkeleton from '../SettingsSkeleton';
import DefaultSidebar from '../sidebar';

const Kassa = lazy(() =>
    import(/* webpackChunkName: "SettingsKassa" */ '../kassa')
);
const Occupation = lazy(() =>
    import(/* webpackChunkName: "SettingsVezifeler" */ '../Occupation')
);
const Anbar = lazy(() =>
    import(/* webpackChunkName: "SettingsAnbar" */ '../anbar/Anbar')
);
const Mehsul = lazy(() =>
    import(/* webpackChunkName: "SettingsMehsul" */ '../mehsul')
);
const Credit = lazy(() =>
    import(/* webpackChunkName: "SettingsCredit" */ '../credit')
);

const Muqavile = lazy(() =>
    import(/* webpackChunkName: "SettingsMuqavile" */ '../muqavile/Muqavile')
);
// const Sifarish = lazy(() =>
//   import(/* webpackChunkName: "SettingsSifarish" */ './Sifarish')
// );
const HR = lazy(() => import(/* webpackChunkName: "SettingsHR" */ '../hr'));
const Notification = lazy(() => import('../notification'));
const SerialNumberPrefix = lazy(() =>
    import(
        /* webpackChunkName: "SettingsSerialNumberPrefix" */ '../serialNumberPrefix'
    )
);
const UpdateForm = lazy(() =>
    import(
        /* webpackChunkName: "SettingsSerialNumberPrefix" */ '../serialNumberPrefix/updateForm'
    )
);
const Roles = lazy(() =>
    import(/* webpackChunkName: "SettingsRoles" */ '../roles')
);
const OrderRoles = lazy(() =>
    import(/* webpackChunkName: "OrderRoles" */ '../order-roles')
);

const Calls = lazy(() => import(/* webpackChunkName: "Calls" */ '../calls'));

const Integration = lazy(() =>
    import(/* webpackChunkName: "Integration" */ '../integration')
);

const Faq = lazy(() => import(/* webpackChunkName: "Faq" */ '../faq'));

const InitialRemains = lazy(() =>
    import(/* webpackChunkName: "InitialRemains" */ '../initialRemains')
);

const base = '/settings/msk';

const pathList = {
    msk_cashbox: '/cashbox',
    msk_occupations: '/positions',
    msk_warehouse: '/storehouse',
    msk_product: '/product',
    credits: '/credit',
    msk_contract: '/contract',
    msk_permissions: '/groups',
    msk_order: '/order-roles',
    msk_hrm: '/hr',
    telegram_notifications: '/notification',
    msk_documents: '/documents',
    addForm: '/forms/add',
    editForm: '/forms/edit/:invoiceType/:id',
    msk_callcenter: '/calls',
    msk_integrations: '/integration',
    initialRemains: '/initial-remains',
    msk_faq: '/faq',
};

const MSK = props => {
    const { permissionsList } = props;
    const location = useLocation();
    const { pathname } = location;
    const showNavAndSidebar = !/add|\/edit/.test(pathname);

    return (
        <>
            {showNavAndSidebar && <DefaultSidebar />}
            <MyLayout>
                {showNavAndSidebar && (
                    <Row>
                        <Col>
                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_cashbox}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_cashbox}`}
                                    key="Kassa"
                                >
                                    Kassa
                                </SubRouteLink>
                            </Can>

                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_occupations}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_occupations}`}
                                    key="Vəzifələr"
                                >
                                    Vəzifələr
                                </SubRouteLink>
                            </Can>

                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_warehouse}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_warehouse}`}
                                    key="Anbar"
                                >
                                    Anbar
                                </SubRouteLink>
                            </Can>

                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_product}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_product}`}
                                    key="Məhsul"
                                >
                                    Məhsul
                                </SubRouteLink>
                            </Can>

                            <Can I={accessTypes.read} a={permissions.credits}>
                                <SubRouteLink
                                    path={`${base}${pathList.credits}`}
                                    key="Credit"
                                >
                                    Kredit
                                </SubRouteLink>
                            </Can>

                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_contract}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_contract}`}
                                    key="Müqavilə"
                                >
                                    Müqavilə
                                </SubRouteLink>
                            </Can>

                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_permissions}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_permissions}`}
                                    key="İstifadəçi hüquqları"
                                >
                                    İstifadəçi hüquqları
                                </SubRouteLink>
                            </Can>

                            <Can I={accessTypes.read} a={permissions.msk_hrm}>
                                <SubRouteLink
                                    path={`${base}${pathList.msk_hrm}`}
                                    key="İnsan resursları"
                                >
                                    İnsan resursları
                                </SubRouteLink>
                            </Can>
                            <Can
                                I={accessTypes.read}
                                a={permissions.telegram_notifications}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.telegram_notifications}`}
                                    key="Bildirişlər"
                                >
                                    Bildirişlər
                                </SubRouteLink>
                            </Can>

                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_documents}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_documents}`}
                                    key="Sənədlər"
                                >
                                    Sənədlər
                                </SubRouteLink>
                            </Can>

                            <Can I={accessTypes.read} a={permissions.msk_order}>
                                <SubRouteLink
                                    path={`${base}${pathList.msk_order}`}
                                    key="Sənədlər"
                                >
                                    Sifariş tənzimləmələri
                                </SubRouteLink>
                            </Can>
                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_callcenter}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_callcenter}`}
                                    key="Zənglər"
                                >
                                    Əlaqə mərkəzi
                                </SubRouteLink>
                            </Can>
                            <Can
                                I={accessTypes.read}
                                a={permissions.msk_integrations}
                            >
                                <SubRouteLink
                                    path={`${base}${pathList.msk_integrations}`}
                                    key="İnteqrasiya"
                                >
                                    İnteqrasiya
                                </SubRouteLink>
                            </Can>
                            <Can I={accessTypes.read} a={permissions.msk_faq}>
                                <SubRouteLink
                                    path={`${base}${pathList.msk_faq}`}
                                    key="İnteqrasiya"
                                >
                                    FAQ
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
                                        from="/settings/msk"
                                        to={`${base}${pathList[
                                            getFirstSuitableKey(
                                                getPermissionsByGroupKey(
                                                    permissionsList,
                                                    'settings'
                                                ),
                                                1
                                            )
                                            ]
                                            }`}
                                    />
                                    <PrivateRoute
                                        path={`${base}${pathList.msk_cashbox}`}
                                        I={accessTypes.read}
                                        a={permissions.msk_cashbox}
                                        component={Kassa}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_occupations}`}
                                        I={accessTypes.read}
                                        a={permissions.msk_occupations}
                                        component={Occupation}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_warehouse}`}
                                        I={accessTypes.read}
                                        a={permissions.msk_warehouse}
                                        component={Anbar}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_product}`}
                                        I={accessTypes.read}
                                        a={permissions.msk_product}
                                        component={Mehsul}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.credits}`}
                                        I={accessTypes.read}
                                        a={permissions.credits}
                                        component={Credit}
                                    />
                                    <PrivateRoute
                                        I={accessTypes.read}
                                        a={permissions.msk_contract}
                                        exact
                                        path={`${base}${pathList.msk_contract}`}
                                        component={Muqavile}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_permissions}`}
                                        component={Roles}
                                        I={accessTypes.read}
                                        a={permissions.msk_permissions}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_hrm}`}
                                        component={HR}
                                        I={accessTypes.read}
                                        a={permissions.msk_hrm}
                                    />
                                    <PrivateRoute
                                        I={accessTypes.read}
                                        a={permissions.telegram_notifications}
                                        exact
                                        path={`${base}${pathList.telegram_notifications}`}
                                        component={Notification}
                                    />
                                    <PrivateRoute
                                        I={accessTypes.read}
                                        a={permissions.msk_documents}
                                        exact
                                        path={`${base}${pathList.msk_documents}`}
                                        component={SerialNumberPrefix}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_order}`}
                                        component={OrderRoles}
                                        I={accessTypes.read}
                                        a={permissions.msk_order}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_callcenter}`}
                                        component={Calls}
                                        I={accessTypes.read}
                                        a={permissions.msk_callcenter}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.addForm}`}
                                        component={UpdateForm}
                                        I={accessTypes.manage}
                                        a={permissions.msk_documents}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.editForm}`}
                                        component={UpdateForm}
                                        I={accessTypes.manage}
                                        a={permissions.msk_documents}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_integrations}`}
                                        component={Integration}
                                        I={accessTypes.read}
                                        a={permissions.msk_integrations}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.msk_faq}`}
                                        component={Faq}
                                        I={accessTypes.read}
                                        a={permissions.msk_faq}
                                    />
                                    <PrivateRoute
                                        exact
                                        path={`${base}${pathList.initialRemains}`}
                                        component={InitialRemains}
                                        I={accessTypes.read}
                                        a={permissions.msk_integrations}
                                    />
                                </Switch>
                            </Suspense>
                        </div>
                    </Col>
                </Row>
            </MyLayout>
        </>
    );
};

const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
});

export default connect(
    mapStateToProps,
    {}
)(MSK);
