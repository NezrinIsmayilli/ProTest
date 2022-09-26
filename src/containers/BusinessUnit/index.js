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
import { getFirstSuitableKey } from 'utils';
import SettingsSkeleton from '../Settings/SettingsSkeleton';

const BusinessUnitTab = lazy(() =>
  /* webpackChunkName: "BusinessUnitTab" */ import('./BusinessUnitTab')
);
const AddBusinessUnit = lazy(() =>
  /* webpackChunkName: "BusinessUnitAdd" */ import(
    './BusinessUnitTab/BusinessUnitAdd'
  )
);
const base = '/business_unit';
const pathList = {
  business_unit: `${base}/business_unit`,
  addBusinessUnit: `${base}/business_unit/add`,
  editBusinessUnit: `${base}/business_unit/edit`,
};

const BusinessUnit = props => {
  const { permissions } = props;
  const location = useLocation();
  const { pathname } = location;
  const showNavAndSidebar = !/add|edit/.test(pathname);

  return (
    <>
      {showNavAndSidebar && (
        <Fragment>
          <SubNavigation>
            <Can I={accessTypes.read} a={permissionKeys.business_unit}>
              <SubRouteLink
                path={pathList.business_unit}
                liStyle={{ paddingRight: '15px' }}
              >
                Biznes blok
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
            from="/business_unit"
            to={
              pathList[
                getFirstSuitableKey(
                  permissions.filter(
                    permission => permission.group_key === 'business_unit'
                  ),
                  1
                )
              ]
            }
          />
          <PrivateRoute
            exact
            path={pathList.business_unit}
            I={accessTypes.read}
            a={permissionKeys.business_unit}
            component={BusinessUnitTab}
          />
          <PrivateRoute
            path={pathList.addBusinessUnit}
            component={AddBusinessUnit}
            I={accessTypes.manage}
            a={permissionKeys.business_unit}
          />
          <PrivateRoute
            path={pathList.editBusinessUnit}
            component={AddBusinessUnit}
            I={accessTypes.manage}
            a={permissionKeys.business_unit}
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
)(BusinessUnit);
