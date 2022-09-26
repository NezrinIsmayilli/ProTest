import React, { Suspense, lazy, Fragment } from 'react';
import {
	Sidebar,
	SubRouteLink,
	SubNavigation,
	PrivateRoute,
} from 'components/Lib';
import { connect } from 'react-redux';
import { Switch, Redirect, useLocation } from 'react-router-dom';
import { permissions, accessTypes } from 'config/permissions';
import Can from 'components/Lib/Can';
import { getFirstSuitableKey } from 'utils';
import SettingsSkeleton from '../Settings/SettingsSkeleton';

const Stocks = lazy(() => import('./Stocks'));
const WarehouseList = lazy(() => import('./stocks-turnovers'));
const Catalog = lazy(() => import('./Catalog'));
const Products = lazy(() => import('./Products'));
const AddProduct = lazy(() => import('./Products/AddProduct'));
const Bron = lazy(() => import('./Bron'));
const AddBron = lazy(() => import('./Bron/AddBron'));

const pathList = {
	stock: '/warehouse/warehouse',
	stock_turnover: '/warehouse/warehouse-turnovers',
	stock_product: '/warehouse/products',
	stock_product_catalog: '/warehouse/catalog',
	bron_invoice: '/warehouse/bron',
	addBron: '/warehouse/bron/add',
	editBron: '/warehouse/bron/edit/:id',
};

const Warehouse = props => {
	const { permissionsList } = props;
	const location = useLocation();
	const { pathname } = location;
	const showNavAndSidebar = !/add|edit/.test(pathname);
	return (
		<>
			{showNavAndSidebar && (
				<Fragment>
					<SubNavigation>
						<Can I={accessTypes.read} a={permissions.stock}>
							<SubRouteLink
								path={pathList.stock}
								key="Warehouse"
								liStyle={{ paddingRight: '15px' }}
							>
								Anbarlar
							</SubRouteLink>
						</Can>
						<Can I={accessTypes.read} a={permissions.stock_turnover}>
							<SubRouteLink
								path={pathList.stock_turnover}
								key="stocks-turnovers"
								liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
							>
								Anbar hesabatı
							</SubRouteLink>
						</Can>
						<Can I={accessTypes.read} a={permissions.stock_product_catalog}>
							<SubRouteLink
								path={pathList.stock_product_catalog}
								key="catalog"
								liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
							>
								Kataloq
							</SubRouteLink>
						</Can>
						<Can I={accessTypes.read} a={permissions.stock_product}>
							<SubRouteLink
								path={pathList.stock_product}
								key="Products"
								liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
							>
								Məhsullar
							</SubRouteLink>
						</Can>
						<Can I={accessTypes.read} a={permissions.bron_invoice}>
							<SubRouteLink
								path={pathList.bron_invoice}
								key="Bron"
								liStyle={{ paddingLeft: '15px', paddingRight: '15px' }}
							>
								Bron
							</SubRouteLink>
						</Can>
					</SubNavigation>
					<Sidebar />
				</Fragment>
			)}
			<Suspense fallback={<SettingsSkeleton />}>
				<Switch>
					<Redirect
						exact
						from="/warehouse"
						to={
							pathList[
							getFirstSuitableKey(
								permissionsList.filter(permission =>
									Object.keys(pathList).includes(permission.key)
								),
								1
							)
							]
						}
					/>
					<PrivateRoute
						path={pathList.stock}
						component={Stocks}
						I={accessTypes.read}
						a={permissions.stock}
					/>
					<PrivateRoute
						path={pathList.stock_turnover}
						component={WarehouseList}
						I={accessTypes.read}
						a={permissions.stock_turnover}
					/>
					<PrivateRoute
						path={pathList.stock_product_catalog}
						component={Catalog}
						I={accessTypes.read}
						a={permissions.stock_product_catalog}
					/>
					<PrivateRoute
						path={pathList.stock_product}
						component={Products}
						I={accessTypes.read}
						a={permissions.stock_product}
					/>
					<PrivateRoute
						path="/warehouse/product/add"
						component={AddProduct}
						I={accessTypes.manage}
						a={permissions.stock_product}
					/>
					<PrivateRoute
						exact
						path={pathList.bron_invoice}
						component={Bron}
						I={accessTypes.read}
						a={permissions.bron_invoice}
					/>
					<PrivateRoute
						path={pathList.addBron}
						component={AddBron}
						I={accessTypes.manage}
						a={permissions.bron_invoice}
					/>
					<PrivateRoute
						exact
						path={pathList.editBron}
						component={AddBron}
						I={accessTypes.manage}
						a={permissions.bron_invoice}
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
)(Warehouse);
