import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  createTenantPersonRole,
  fetchTenantPersonRoles,
} from 'store/actions/settings/order-roles';
import { ProSelect, ProButton } from 'components/Lib';
import styles from '../styles.module.scss';

const UpdateRoleModal = props => {
  const {
    roleType,
    createTenantPersonRole,
    warehousemen,
    operators,
    expeditors,
    users,
    toggleRoleModal,
    loadingCreateTenantPersonRole,
    fetchTenantPersonRoles,
  } = props;

  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSelectUser = userIds => {
    const newUsers = userIds.map(userId =>
      users.find(user => user.id === userId)
    );
    setSelectedUsers(prevSelectedUsers => [
      ...prevSelectedUsers,
      ...newUsers.map(newUser => ({ ...newUser, tenantPersonId: newUser.id })),
    ]);
  };

  const handleSelectedUserChange = selectedUserIds => {
    setSelectedUsers(prevSelectedUsers => [
      ...prevSelectedUsers.filter(({ tenantPersonId }) =>
        selectedUserIds.includes(tenantPersonId)
      ),
    ]);
  };
  const handleCreateTenantPersonRole = () => {
    const data = {
      role: roleType,
      tenantPerson_ul: selectedUsers.map(
        selectedUser => selectedUser.tenantPersonId
      ),
    };

    createTenantPersonRole({
      data,
      onSuccessCallback: () => {
        toggleRoleModal();
        fetchTenantPersonRoles();
        setSelectedUsers([]);
      },
    });
  };

  return (
    <div className={styles.UpdateRole}>
      <h2>Əlavə et</h2>
      <div>
        <span className={styles.selectLabel}>İstifadəçilər</span>
        <ProSelect
          mode="multiple"
          value={[]}
          keys={['name', 'lastName', 'patronymic']}
          className={styles.selectBox}
          onChange={handleSelectUser}
          data={users.filter(
            user =>
              ![
                ...selectedUsers,
                ...warehousemen,
                ...operators,
                ...expeditors,
              ].find(selectedUser => selectedUser.tenantPersonId === user.id)
          )}
        />
      </div>
      <div>
        <span className={styles.selectLabel}>Seçilmiş istifadəçilər</span>
        <ProSelect
          className={styles.selectBox}
          mode="multiple"
          keys={['name', 'lastName', 'patronymic']}
          onChange={handleSelectedUserChange}
          value={selectedUsers.map(selectedUser => selectedUser.tenantPersonId)}
          data={selectedUsers}
        />
      </div>
      <div>
        <ProButton
          disabled={selectedUsers.length === 0}
          loading={loadingCreateTenantPersonRole}
          onClick={handleCreateTenantPersonRole}
        >
          Təsdiq et
        </ProButton>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  users: state.usersReducer.users,
  warehousemen: state.orderRolesReducer.warehousemen,
  operators: state.orderRolesReducer.operators,
  expeditors: state.orderRolesReducer.expeditors,
  loadingCreateTenantPersonRole: state.loadings.createTenantPersonRole,
});

export const UpdateRole = connect(
  mapStateToProps,
  {
    createTenantPersonRole,
    fetchTenantPersonRoles,
  }
)(UpdateRoleModal);
