import React from 'react';
import { Table, ProButton, Can } from 'components/Lib';
import { DeleteTwoTone } from '@ant-design/icons';
import { accessTypes, permissions } from 'config/permissions';
import { connect } from 'react-redux';
import styles from '../styles.module.scss';

const Role = props => {
  const {
    label,
    data,
    type,
    toggleRoleModal,
    handleRemoveTenantPersonRole,
    permissions: permissionKeys,
    // Loadings
    fetchTenantPersonRolesLoading,
    deleteTenantPersonRoleLoading,
  } = props;
  const isReadOnly =
    permissionKeys.find(permission => permission.key === 'msk_order')
      .permission === 1;

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 80,
      render: (value, item, index) => index + 1,
    },
    {
      title: `${label}lar`,
      dataIndex: 'tenantPersonName',
      align: 'left',
      render: (value, { tenantPersonLastName, tenantPersonPatronymic }) =>
        `${value || ''} ${tenantPersonLastName ||
          ''} ${tenantPersonPatronymic || ''}`,
    },
    !isReadOnly
      ? {
          title: 'Sil',
          dataIndex: 'id',
          key: 'delete',
          align: 'left',
          width: 60,
          render: value => (
            <DeleteTwoTone
              style={{ fontSize: '16px', cursor: 'pointer' }}
              onClick={() => handleRemoveTenantPersonRole(value)}
              twoToneColor="#eb2f96"
            />
          ),
        }
      : {},
  ];
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Can I={accessTypes.manage} a={permissions.msk_order}>
          <ProButton
            style={{ margin: '10px 0' }}
            onClick={() => toggleRoleModal(type)}
          >
            {label} əlavə et
          </ProButton>
        </Can>
      </div>
      <Table
        className={styles.orderRoleTable}
        columns={columns}
        dataSource={data}
        scroll={{ x: 'none' }}
        loading={deleteTenantPersonRoleLoading || fetchTenantPersonRolesLoading}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  deleteTenantPersonRoleLoading: state.loadings.deleteTenantPersonRole,
  fetchTenantPersonRolesLoading: state.loadings.fetchTenantPersonRoles,
  permissions: state.permissionsReducer.permissions,
});

export const TenantRole = connect(
  mapStateToProps,
  {}
)(Role);
