import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  fetchTenantPersonRoles,
  deleteTenantPersonRole,
} from 'store/actions/settings/order-roles';
import swal from '@sweetalert/with-react';
import {
  CustomHeader,
  SettingsCollapse,
  SettingsPanel,
  ProModal,
} from 'components/Lib';
import { fetchUsers } from 'store/actions/users';
import { TenantRole, UpdateRole } from './index';
import styles from '../styles.module.scss';

const roleTypes = [
  {
    label: 'Anbardar',
    type: 1,
  },
  {
    label: 'Ekspeditor',
    type: 2,
  },
  {
    label: 'Operator',
    type: 3,
  },
];
const RolesList = props => {
  const {
    warehousemen,
    expeditors,
    operators,
    deleteTenantPersonRole,
    fetchUsers,
    fetchTenantPersonRoles,
  } = props;

  const [roleType, setRoleType] = useState(undefined);
  const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);

  const toggleRoleModal = roleType => {
    setRoleType(roleType);
    setRoleModalIsVisible(prevValue => !prevValue);
  };

  const handleRemoveTenantPersonRole = id => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteTenantPersonRole({
          id,
          onSuccessCallback: () => {
            fetchTenantPersonRoles();
          },
        });
      }
    });
  };
  useEffect(() => {
    fetchUsers();
    fetchTenantPersonRoles();
  }, []);
  return (
    <div className={styles.OrderRoles}>
      <ProModal
        maskClosable
        padding
        centered
        width={400}
        isVisible={roleModalIsVisible}
        handleModal={toggleRoleModal}
      >
        <UpdateRole roleType={roleType} toggleRoleModal={toggleRoleModal} />
      </ProModal>
      <SettingsCollapse accordion={false}>
        {roleTypes.map(({ label, type }) => (
          <SettingsPanel
            header={
              <CustomHeader
                title={`${label}lar (${
                  type === 1
                    ? warehousemen.length
                    : type === 2
                    ? expeditors.length
                    : operators.length
                })`}
              />
            }
            key={String(type)}
          >
            <TenantRole
              label={label}
              type={type}
              data={
                type === 1 ? warehousemen : type === 2 ? expeditors : operators
              }
              toggleRoleModal={toggleRoleModal}
              handleRemoveTenantPersonRole={handleRemoveTenantPersonRole}
            />
          </SettingsPanel>
        ))}
      </SettingsCollapse>
    </div>
  );
};

const mapStateToProps = state => ({
  warehousemen: state.orderRolesReducer.warehousemen,
  expeditors: state.orderRolesReducer.expeditors,
  operators: state.orderRolesReducer.operators,
});

export const Roles = connect(
  mapStateToProps,
  {
    fetchUsers,
    fetchTenantPersonRoles,
    deleteTenantPersonRole,
  }
)(RolesList);
