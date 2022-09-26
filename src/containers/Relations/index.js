import React, { Suspense, lazy, Fragment } from 'react';
import { Switch, Redirect, useLocation } from 'react-router-dom';
import {
	Loading,
	PrivateRoute,
	SubNavigation,
	SubRouteLink,
} from 'components/Lib';

import Can from 'components/Lib/Can';
import { permissions, accessTypes } from 'config/permissions';
import { connect } from 'react-redux';
import { getFirstSuitableKey } from 'utils';
import { useTranslation } from 'react-i18next';

const Contacts = lazy(() => import('./Contacts'));
const NewContact = lazy(() => import('./Contacts/NewContact'));
const EditContact = lazy(() => import('./Contacts/EditContact'));
const Partners = lazy(() => import('./Partners'));
const NewPartner = lazy(() => import('./Partners/NewPartner'));

const paths = {
	contact: '/relations/contacts',
	partner: '/relations/partners',
};
const Relations = props => {
	const { t } = useTranslation();
	const { permissionsList } = props;
	const location = useLocation();
	const { pathname } = location;
	const showNavAndSidebar = !/new|edit/.test(pathname);
	return (
		<>
			{showNavAndSidebar && (
				<Fragment>
					<SubNavigation>
						<Can I={accessTypes.read} a={permissions.contact}>
							<SubRouteLink
								path={paths.contact}
								liStyle={{ paddingRight: '15px' }}
							>
								{t('relations:main:contact')}
							</SubRouteLink>
						</Can>
						<Can I={accessTypes.read} a={permissions.partner}>
							<SubRouteLink path={paths.partner}>
								{t('relations:main:partner')}
							</SubRouteLink>
						</Can>
					</SubNavigation>
				</Fragment>
			)}
			<Suspense fallback={<Loading />}>
				<Switch>
					<Redirect
						exact
						from="/relations"
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
						path="/relations/contacts/new"
						component={NewContact}
						I={accessTypes.manage}
						a={permissions.contact}
					/>
					<PrivateRoute
						path="/relations/contacts/edit/:id"
						component={EditContact}
						I={accessTypes.manage}
						a={permissions.contact}
					/>
					<PrivateRoute
						path="/relations/partners/new"
						component={NewPartner}
						I={accessTypes.manage}
						a={permissions.partner}
					/>
					<PrivateRoute
						path="/relations/partners/edit/:id"
						component={NewPartner}
						I={accessTypes.manage}
						a={permissions.partner}
					/>
					<PrivateRoute
						path="/relations/contacts"
						component={Contacts}
						I={accessTypes.read}
						a={permissions.contact}
					/>
					<PrivateRoute
						path="/relations/partners"
						component={Partners}
						I={accessTypes.read}
						a={permissions.partner}
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
)(Relations);
