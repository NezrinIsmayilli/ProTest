import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { DeleteTwoTone } from '@ant-design/icons';
import { fetchUsers } from 'store/actions/users';
import swal from '@sweetalert/with-react';
import {
  setSelectedUnitUser,
  deleteUnitUser,
} from 'store/actions/businessUnit';
import { Tooltip } from 'antd';
import { Table, ProButton, ProModal } from 'components/Lib';
import { UpdateUsers } from './updateUser';
import styles from '../../styles.module.scss';

const UsersTable = props => {
  const {
    id,
    setSelectedUnitUser,
    deleteUnitUser,
    selectedUnitUser,
    fetchUsers,
  } = props;
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers({
      filters: {limit: 1000},
      onSuccessCallback: ({ data }) => {
        setUsers(data.filter(user => !user.isAdmin));
      },
    });
  }, []);

  const toggleRoleModal = () => {
    setRoleModalIsVisible(prevValue => !prevValue);
    setSelectedUsers([]);
  };
  const handleUserRemove = row => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        if (id && row.editId) {
          const newUsers = selectedUnitUser.filter(
            ({ tenantPersonId }) => tenantPersonId !== row.tenantPersonId
          );
          setSelectedUnitUser({
            newSelectedUnitUser: newUsers,
          });
          deleteUnitUser({
            id: row.id,
          });
        } else {
          const newUsers = selectedUnitUser.filter(
            ({ tenantPersonId }) => tenantPersonId !== row.tenantPersonId
          );
          setSelectedUnitUser({
            newSelectedUnitUser: newUsers,
          });
        }
      }
    });
  };
  const getColumns = () => {
    return [
      {
        title: '№',
        dataIndex: 'id',
        align: 'left',
        width: 80,
        render: (_value, _row, index) => index + 1,
      },
      {
        title: 'İstifadəçi adı',
        dataIndex: 'tenantPersonName',
        align: 'left',
        ellipsis: true,
        render: (value, row) => (
          <Tooltip
            placement="topLeft"
            title={
              `${value} ${
                row.tenantPersonLastname ? row.tenantPersonLastname : ''
              }` || ''
            }
          >
            <span>
              {`${value} ${
                row.tenantPersonLastname ? row.tenantPersonLastname : ''
              }` || '-'}
            </span>
          </Tooltip>
        ),
      },
      {
        title: 'Sil',
        dataIndex: 'tenantPersonId',
        width: 60,
        align: 'left',
        render: (value, row) => (
          <DeleteTwoTone
            style={{ fontSize: '16px', cursor: 'pointer' }}
            onClick={() => handleUserRemove(row)}
            twoToneColor="#eb2f96"
          />
        ),
      },
    ];
  };
  return (
    <>
      <ProModal
        maskClosable
        padding
        centered
        width={400}
        isVisible={roleModalIsVisible}
        handleModal={toggleRoleModal}
      >
        <UpdateUsers
          users={users}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          toggleRoleModal={toggleRoleModal}
        />
      </ProModal>
      <div className={styles.parentBox}>
        <div className={styles.paper}>
          <div
            style={{
              display: 'flex',
              marginBottom: '20px',
              alignItems: 'center',
            }}
          >
            <span className={styles.newOperationTitle}>
              İstifadəçilər ({selectedUnitUser?.length})
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              justifyContent: 'flex-end',
            }}
          >
            <ProButton
              style={{ margin: '10px 0' }}
              onClick={() => toggleRoleModal()}
            >
              İstifadəçi əlavə et
            </ProButton>
          </div>
          <Table
            columns={getColumns()}
            rowKey={row => row.id}
            dataSource={selectedUnitUser}
          />
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  selectedUnitUser: state.businessUnitReducer.selectedUnitUser,
});
export const Users = connect(
  mapStateToProps,
  { fetchUsers, setSelectedUnitUser, deleteUnitUser }
)(UsersTable);
