import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Sidebar, SidebarLink } from 'components/Lib';

const DefaultSideBar = props => {
  const { tenant, permissionsList } = props;
  const getPath = path => `/profile/${path}`;
  const permissionsListReq = permissionsList.filter(
    permission => permission.key === 'tenant_requisites'
  );
  console.log(permissionsListReq[0]?.permission);
  return (
    <Sidebar title="Info">
      <SidebarLink path={getPath('main')} name="Şəxsi məlumat" />
      <SidebarLink path={getPath('security')} name="Təhlükəsizlik və giriş" />

      {tenant?.isAdmin ? (
        <SidebarLink path={getPath('company')} name="Şirkət haqqında" />
      ) : null}
      {tenant?.isAdmin && permissionsListReq[0]?.permission === 1 ? (
        <SidebarLink path={getPath('requisites')} name="Rekvizitlər" />
      ) : permissionsListReq[0]?.permission === 0 ? null : (
        <SidebarLink path={getPath('requisites')} name="Rekvizitlər" />
      )}
      {tenant?.isAdmin ? (
        <Fragment>
          <SidebarLink path={getPath('invoice')} name="Ödənişlər" />
          <SidebarLink path={getPath('logs')} name="Audit log" />
          <SidebarLink path={getPath('apps')} name="Tətbiqlər" />
          <SidebarLink
            path={getPath('operations')}
            name="Əməliyyatların silinməsi"
          />
          {/* <SidebarLink path={getPath('plans')} name="Paketlər" /> */}
        </Fragment>
      ) : null}
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  tenant: state.tenantReducer.tenant,
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  {}
)(DefaultSideBar);
