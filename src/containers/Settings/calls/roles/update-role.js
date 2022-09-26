import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    createCallRole,
    fetchCallRoles,
} from 'store/actions/settings/call-roles';
import { ProSelect, ProButton } from 'components/Lib';
import styles from '../styles.module.scss';

const UpdateRoleModal = props => {
    const {
        isLoading,
        roleType,
        createCallRole,
        executors,
        operators,
        operatorUsers,
        supervisors,
        toggleRoleModal,
        loadingCreateCallRole,
        fetchCallRoles,
        selectedUsers,
        setSelectedUsers,
    } = props;

    const handleSelectUser = userIds => {
        const [userId] = userIds;
        const newUsers = operatorUsers.find(user => user.id === userId);
        setSelectedUsers(prevSelectedUsers => [...prevSelectedUsers, newUsers]);
    };
    const handleSelectedUserChange = selectedUserIds => {
        const newUsers = selectedUsers.filter(user =>
            selectedUserIds.includes(user.id)
        );
        setSelectedUsers(newUsers);
    };
    const handleCreateCallRole = () => {
        const data = {
            role: roleType,
            operators: selectedUsers.map(selectedUser => selectedUser.id),
        };

        createCallRole({
            data,
            onSuccessCallback: () => {
                toggleRoleModal();
                fetchCallRoles();
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
                    loading={isLoading}
                    mode="multiple"
                    value={[]}
                    keys={['name', 'lastName', 'patronymic']}
                    className={styles.selectBox}
                    onChange={handleSelectUser}
                    data={operatorUsers
                        .filter(
                            user =>
                                ![
                                    ...selectedUsers.map(
                                        selectedProduct => selectedProduct.id
                                    ),
                                    ...supervisors.map(
                                        selectedProduct =>
                                            selectedProduct?.operator?.id
                                    ),
                                    ...operators.map(
                                        selectedProduct =>
                                            selectedProduct?.operator?.id
                                    ),
                                    ...executors.map(
                                        selectedProduct =>
                                            selectedProduct?.operator?.id
                                    ),
                                ].includes(user.id)
                        )
                        .map(operatorUser => ({
                            ...operatorUser,
                            name: operatorUser.prospectTenantPerson?.name,
                            lastName:
                                operatorUser.prospectTenantPerson?.lastName,
                            patronymic:
                                operatorUser.prospectTenantPerson?.patronymic,
                        }))}
                />
            </div>
            <div>
                <span className={styles.selectLabel}>
                    Seçilmiş istifadəçilər
                </span>
                <ProSelect
                    className={styles.selectBox}
                    mode="multiple"
                    keys={['name', 'lastName', 'patronymic']}
                    onChange={handleSelectedUserChange}
                    value={selectedUsers
                        .map(selectedUser => ({
                            ...selectedUser,
                            name: selectedUser.prospectTenantPerson?.name,
                            lastName:
                                selectedUser.prospectTenantPerson?.lastName,
                            patronymic:
                                selectedUser.prospectTenantPerson?.patronymic,
                        }))
                        .map(selected => selected.id)}
                    data={selectedUsers.map(selectedUser => ({
                        ...selectedUser,
                        name: selectedUser.prospectTenantPerson?.name,
                        lastName: selectedUser.prospectTenantPerson?.lastName,
                        patronymic:
                            selectedUser.prospectTenantPerson?.patronymic,
                    }))}
                />
            </div>
            <div>
                <ProButton
                    disabled={selectedUsers.length === 0}
                    loading={loadingCreateCallRole}
                    onClick={handleCreateCallRole}
                >
                    Təsdiq et
                </ProButton>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    users: state.usersReducer.users,
    supervisors: state.callRolesReducer.supervisors,
    operators: state.callRolesReducer.operators,
    executors: state.callRolesReducer.executors,
    isLoading: state.loadings.fetchCallOperators,
    loadingCreateCallRole: state.loadings.createCallRole,
});

export const UpdateRole = connect(
    mapStateToProps,
    {
        createCallRole,
        fetchCallRoles,
    }
)(UpdateRoleModal);
