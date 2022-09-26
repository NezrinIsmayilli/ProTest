import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Tooltip, Icon, Button } from 'antd';
import { FiLink } from 'react-icons/fi';
import { Table } from 'components/Lib';
import swal from '@sweetalert/with-react';
import { inviteUser, deleteUserById, fetchUsers } from 'store/actions/users';
import { fetchFilteredWorkers } from 'store/actions/hrm/workers';
// icons
import { permissions, accessTypes } from 'config/permissions';
import { useTranslation } from 'react-i18next';
// import { permissions, accessTypes } from 'config/permissions';
// import { connectTypes, userConnectTypesNames } from 'utils';
import MoreDetails from '../MoreDetails';

function UsersTable(props) {
    const { t } = useTranslation();
    const {
        // data
        filters,
        isVisible,
        setIsVisible,
        users,
        visibleColumns,
        getColumns,
        selectedRow,
        usersLoading,
        deleteUserById,
        fetchUsers,
        fetchFilteredWorkers,
        // actions
        // inviteUser
        openModal,
        setWorker,
        setRoles,
        handleFilterData,
        allBusinessUnits,
    } = props;

    return (
        <Row gutter={32}>
            <Col className="paddingBottom70">
                <MoreDetails
                    visible={isVisible}
                    row={selectedRow}
                    users={users}
                    setIsVisible={setIsVisible}
                    allBusinessUnits={allBusinessUnits}
                />{' '}
                <Table
                    loading={usersLoading}
                    dataSource={handleFilterData(users)}
                    rowKey={record => record.id}
                    columns={getColumns({ column: visibleColumns })}
                />{' '}
            </Col>{' '}
        </Row>
    );
}

const mapStateToProps = state => ({
    users: state.usersReducer.users,
    usersLoading: !!state.loadings.fetchUsers,
    filters: state.usersReducer.filters,
});

export default connect(
    mapStateToProps,
    {
        inviteUser,
        deleteUserById,
        fetchUsers,
        fetchFilteredWorkers,
    }
)(UsersTable);
