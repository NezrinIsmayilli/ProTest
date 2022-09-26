/* eslint-disable react-hooks/exhaustive-deps */
import React, { lazy, Fragment, Suspense } from 'react';
import { connect } from 'react-redux';
import {
    SubRouteLink,
    SubNavigation,
    Sidebar,
    PrivateRoute,
} from 'components/Lib';
import { Switch, Redirect, useLocation } from 'react-router-dom';
import Can from 'components/Lib/Can';
import { permissions as permissionKeys, accessTypes } from 'config/permissions';
import {
    // getLeastPermissionKey,
    typeOfOperations,
    getFirstSuitableKey,
    getHighestPermissionKey,
} from 'utils';
import SettingsSkeleton from '../Settings/SettingsSkeleton';

const SalesOperationsList = lazy(() =>
    /* webpackChunkName: "SalesBuys-Operations" */ import('./Operations')
);
const GoodTurnovers = lazy(() =>
    /* webpackChunkName: "SalesBuys-GoodTurnovers" */ import('./good-turnovers')
);
const SoldItems = lazy(() =>
    /* webpackChunkName: "SalesBuys-SoldItems" */ import('./sold-items')
);
const PurchasedItems = lazy(() =>
    /* webpackChunkName: "SalesBuys-PurchasedItems" */ import(
        './purchased-items'
    )
);
const ContractsList = lazy(() =>
    /* webpackChunkName: "SalesBuys-Contracts" */ import('./Contracts')
);
const ContractAdd = lazy(() =>
    /* webpackChunkName: "SalesBuys-AddContract" */ import(
        './Contracts/AddContract'
    )
);
const UpdateOperation = lazy(() =>
    /* webpackChunkName: "SalesBuys-AddContract" */ import(
        './Operations/OperationForm'
    )
);

const AddPaymentTable = lazy(() =>
    /* webpackChunkName: "SalesBuys-AddPaymentTable" */ import(
        './Operations/AddPaymentTable'
    )
);

const Production = lazy(() =>
    /* webpackChunkName: "SalesBuys-Production" */ import('./Production')
);
const AddProduction = lazy(() =>
    /* webpackChunkName: "SalesBuys-AddProduction" */ import(
        './Production/ProductionAdd'
    )
);

const base = '/sales';
const pathList = {
    operations: '/operations',
    addContract: '/contracts/add',
    editContract: '/contracts/edit',
    addOperation: '/operations/add',
    editOperation: '/operations/edit/:invoiceType/:id',
    addProduction: '/production/add',
    editProduction: '/production/edit',
    addPaymentTable: '/operations/creditTable/add/:invoiceId',
    editPaymentTable: '/operations/creditTable/edit/:invoiceId/:id',

    // By permission key
    purchase_invoice: '/operations',
    import_purchase: '/operations',
    sales_invoice: '/operations',
    return_from_customer_invoice: '/operations',
    return_to_supplier_invoice: '/operations',
    transfer_invoice: '/operations',
    remove_invoice: '/operations',
    sales_turnover: '/good-turnovers',
    sales_contract: '/contracts',
    purchase_report: '/purchased-items',
    sales_sold_items: '/sold-items',
    production_invoice: '/production',
};

const SalesBuys = props => {
    const { permissions } = props;
    const location = useLocation();
    const { pathname } = location;
    const showNavAndSidebar = !/add|edit/.test(pathname);

    return (
        <>
            {showNavAndSidebar && (
                <Fragment>
                    <SubNavigation>
                        <Can
                            I={accessTypes.read}
                            a={getHighestPermissionKey(
                                permissions.filter(permission =>
                                    typeOfOperations
                                        .map(operation => operation.key)
                                        .includes(permission.key)
                                )
                            )}
                        >
                            <SubRouteLink
                                path={`${base}${pathList.operations}`}
                                key="Operations"
                                liStyle={{ paddingRight: '15px' }}
                            >
                                Əməliyyatlar
                            </SubRouteLink>
                        </Can>

                        <Can
                            I={accessTypes.read}
                            a={permissionKeys.sales_turnover}
                        >
                            <SubRouteLink
                                path={`${base}${pathList.sales_turnover}`}
                                key="sales_turnover"
                                liStyle={{
                                    paddingLeft: '15px',
                                    paddingRight: '15px',
                                }}
                            >
                                Dövriyyə
                            </SubRouteLink>
                        </Can>
                        <Can
                            I={accessTypes.read}
                            a={permissionKeys.sales_sold_items}
                        >
                            <SubRouteLink
                                path={`${base}${pathList.sales_sold_items}`}
                                key="sold-items"
                                liStyle={{
                                    paddingLeft: '15px',
                                    paddingRight: '15px',
                                }}
                            >
                                Satışlar
                            </SubRouteLink>
                        </Can>
                        <Can
                            I={accessTypes.read}
                            a={permissionKeys.purchase_report}
                        >
                            <SubRouteLink
                                path={`${base}${pathList.purchase_report}`}
                                key="purchase_report"
                                liStyle={{
                                    paddingLeft: '15px',
                                    paddingRight: '15px',
                                }}
                            >
                                Alışlar
                            </SubRouteLink>
                        </Can>
                        <Can
                            I={accessTypes.read}
                            a={permissionKeys.sales_contract}
                        >
                            <SubRouteLink
                                path={`${base}${pathList.sales_contract}`}
                                key="sales_contract"
                                liStyle={{
                                    paddingLeft: '15px',
                                    paddingRight: '15px',
                                }}
                            >
                                Müqavilələr
                            </SubRouteLink>
                        </Can>
                        <Can
                            I={accessTypes.read}
                            a={permissionKeys.production_invoice}
                        >
                            <SubRouteLink
                                path={`${base}${pathList.production_invoice}`}
                                key="production_invoice"
                                liStyle={{
                                    paddingLeft: '15px',
                                    paddingRight: '15px',
                                }}
                            >
                                İstehsalat
                            </SubRouteLink>
                        </Can>
                    </SubNavigation>
                    <Sidebar />
                </Fragment>
            )}
            <Suspense fallback={<SettingsSkeleton />}>
                <Switch>
                    {/* <PrivateRoute
            path={`${base}${pathList.addOperations}`}
            component={SalesOperationsAdd}
            I={accessTypes.manage}
            a={getHighestPermissionKey(
              permissions.filter(permission =>
                typeOfOperations
                  .map(operation => operation.key)
                  .includes(permission.key)
              )
            )}
          /> */}
                    <PrivateRoute
                        exact
                        path={`${base}${pathList.addOperation}`}
                        component={UpdateOperation}
                        I={accessTypes.manage}
                        a={getHighestPermissionKey(
                            permissions.filter(permission =>
                                typeOfOperations
                                    .map(operation => operation.key)
                                    .includes(permission.key)
                            )
                        )}
                    />
                    <PrivateRoute
                        exact
                        path={`${base}${pathList.editOperation}`}
                        component={UpdateOperation}
                        I={accessTypes.manage}
                        a={getHighestPermissionKey(
                            permissions.filter(permission =>
                                typeOfOperations
                                    .map(operation => operation.key)
                                    .includes(permission.key)
                            )
                        )}
                    />
                    <PrivateRoute
                        exact
                        path={`${base}${pathList.addPaymentTable}`}
                        component={AddPaymentTable}
                        I={accessTypes.manage}
                        a={getHighestPermissionKey(
                            permissions.filter(permission =>
                                typeOfOperations
                                    .map(operation => operation.key)
                                    .includes(permission.key)
                            )
                        )}
                    />
                    <PrivateRoute
                        exact
                        path={`${base}${pathList.editPaymentTable}`}
                        component={AddPaymentTable}
                        I={accessTypes.manage}
                        a={getHighestPermissionKey(
                            permissions.filter(permission =>
                                typeOfOperations
                                    .map(operation => operation.key)
                                    .includes(permission.key)
                            )
                        )}
                    />
                    <PrivateRoute
                        path={`${base}${pathList.sales_invoice}`}
                        component={SalesOperationsList}
                        I={accessTypes.read}
                        a={getHighestPermissionKey(
                            permissions.filter(
                                ({ group_key, sub_group_key }) =>
                                    group_key === 'sales' &&
                                    sub_group_key === 'operations'
                            )
                        )}
                    />

                    <PrivateRoute
                        path={`${base}${pathList.sales_turnover}`}
                        component={GoodTurnovers}
                        I={accessTypes.read}
                        a={permissionKeys.sales_turnover}
                    />

                    {/* Sold Items  */}
                    <PrivateRoute
                        path={`${base}${pathList.sales_sold_items}`}
                        component={SoldItems}
                        I={accessTypes.read}
                        a={permissionKeys.sales_sold_items}
                    />

                    {/* Purchased Items  */}
                    <PrivateRoute
                        path={`${base}${pathList.purchase_report}`}
                        component={PurchasedItems}
                        I={accessTypes.read}
                        a={permissionKeys.purchase_report}
                    />

                    {/* Contracts */}
                    <PrivateRoute
                        path={`${base}${pathList.addContract}`}
                        component={ContractAdd}
                        I={accessTypes.manage}
                        a={permissionKeys.sales_contract}
                    />
                    <PrivateRoute
                        path={`${base}${pathList.editContract}`}
                        component={ContractAdd}
                        I={accessTypes.manage}
                        a={permissionKeys.sales_contract}
                    />
                    <PrivateRoute
                        path={`${base}${pathList.sales_contract}`}
                        component={ContractsList}
                        I={accessTypes.read}
                        a={permissionKeys.sales_contract}
                    />
                    <PrivateRoute
                        path={`${base}${pathList.contracts}`}
                        component={ContractsList}
                        I={accessTypes.read}
                        a={permissionKeys.sales_contract}
                    />
                    <PrivateRoute
                        exact
                        path={`${base}${pathList.production_invoice}`}
                        component={Production}
                        I={accessTypes.read}
                        a={permissionKeys.production_invoice}
                    />
                    <PrivateRoute
                        path={`${base}${pathList.addProduction}`}
                        component={AddProduction}
                        I={accessTypes.manage}
                        a={permissionKeys.production_invoice}
                    />
                    <PrivateRoute
                        path={`${base}${pathList.editProduction}`}
                        component={AddProduction}
                        I={accessTypes.manage}
                        a={permissionKeys.production_invoice}
                    />
                    <Redirect
                        exact
                        from="/sales"
                        to={
                            getFirstSuitableKey(
                                permissions.filter(
                                    permission =>
                                        permission.group_key === 'sales'
                                )
                            ) === 'production_invoice'
                                ? `${base}/operations`
                                : `${base}${
                                      pathList[
                                          getFirstSuitableKey(
                                              permissions.filter(
                                                  permission =>
                                                      permission.group_key ===
                                                      'sales'
                                              )
                                          )
                                      ]
                                  }`
                        }
                    />
                </Switch>
            </Suspense>
        </>
    );
};

const mapStateToProps = state => ({
    permissions: state.permissionsReducer.permissions,
});
export default connect(
    mapStateToProps,
    {}
)(SalesBuys);
