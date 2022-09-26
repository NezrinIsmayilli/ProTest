import React, { useState, useEffect } from 'react';
import { Table, ProButton, ProModal, Can } from 'components/Lib';
import { Button, Tooltip } from 'antd';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import {
  fetchOperatorGroup,
  deleteOperatorGroup,
  fetchSelectedOperatorGroup,
} from 'store/actions/settings/operatorGroup';
import { permissions, accessTypes } from 'config/permissions';

import swal from '@sweetalert/with-react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import AddGroup from './addGroup';
import styles from './styles.module.scss';

const { manage } = accessTypes;

const OperatorGroup = props => {
  const {
    fetchOperatorGroup,
    deleteOperatorGroup,
    fetchSelectedOperatorGroup,
    operatorGroup,
    fetchOperatorGroupLoading,
  } = props;
  useEffect(() => {
    if (operatorGroup.length === 0) fetchOperatorGroup();
  }, []);

  const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);
  const [selectedOperatorGroup, setSelectedOperatorGroup] = useState([]);
  const [selectedId, setSelectedId] = useState(undefined);
  useEffect(() => {
    if (roleModalIsVisible === false) setSelectedOperatorGroup([]);
  }, [roleModalIsVisible]);
  const handleRemoveOperatorGroup = id => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteOperatorGroup({
          id,
          onFailureCallback: error => {
            if (
              error?.response?.data?.error?.type ===
              'callcenter.delete.linked.self.ivr_action'
            ) {
              toast.error(
                'Bu operator qrupu mövcud İVR-lardan birinin tərkibində olduğu üçün silinə bilməz'
              );
            }
          },
        });
      }
    });
  };
  const editClick = (id, row) => {
    if (id) {
      fetchSelectedOperatorGroup({
        id,
        onSuccessCallback: ({ data }) => {
          setSelectedOperatorGroup([data]);
        },
      });
      setSelectedId(id);
    }
    toggleRoleModal();
  };
  const toggleRoleModal = () => {
    setRoleModalIsVisible(prevValue => !prevValue);
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 80,
      render: (value, item, index) => index + 1,
    },
    {
      title: `Qrup adı`,
      dataIndex: 'name',
      align: 'left',
      render: value => value || '',
    },
    {
      title: 'Operatorlar',
      dataIndex: 'agents',
      align: 'left',
      render: value =>
        value ? (
          value.length > 1 ? (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              {`${value[0]?.prospectTenantPerson.name} ${value[0]
                ?.prospectTenantPerson.lastName || ''}`}
              <Tooltip
                placement="right"
                title={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {value.map(item => (
                      <span>{`${item?.prospectTenantPerson?.name || ''} ${item
                        ?.prospectTenantPerson.lastName || ''}`}</span>
                    ))}
                  </div>
                }
              >
                <span className={styles.serialNumberCount}>{value.length}</span>
              </Tooltip>
            </div>
          ) : (
            `${value[0]?.prospectTenantPerson.name} ${value[0]
              ?.prospectTenantPerson.lastName || ''}`
          )
        ) : (
          '-'
        ),
    },
    {
      title: (
        <Can I={manage} a={permissions.msk_callcenter}>
          Seç
        </Can>
      ),
      dataIndex: 'id',
      key: 'delete',
      align: 'left',
      width: 100,
      render: (value, row) => (
        <Can I={manage} a={permissions.msk_callcenter}>
          <div style={{ display: 'flex' }}>
            <Button
              style={{ padding: '5px' }}
              type="button"
              className={styles.trashIcon}
              onClick={() => handleRemoveOperatorGroup(value)}
            >
              <FaTrash />
            </Button>
            <Button
              style={{ padding: '5px' }}
              type="button"
              className={styles.editIcon}
              onClick={() => editClick(value, row)}
            >
              <FaPencilAlt />
            </Button>
          </div>
        </Can>
      ),
    },
  ];
  return (
    <div>
      <ProModal
        maskClosable
        style={{ marginTop: '100px' }}
        padding
        centered
        width={700}
        isVisible={roleModalIsVisible}
        handleModal={toggleRoleModal}
      >
        <AddGroup
          toggleRoleModal={toggleRoleModal}
          selectedOperatorGroup={selectedOperatorGroup}
          selectedId={selectedId}
        />
      </ProModal>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Can I={manage} a={permissions.msk_callcenter}>
          <ProButton
            style={{ margin: '10px 0' }}
            onClick={() => toggleRoleModal()}
          >
            Yeni qrup
          </ProButton>
        </Can>
      </div>
      <Table
        columns={columns}
        dataSource={operatorGroup}
        scroll={{ x: 'none' }}
        loading={fetchOperatorGroupLoading}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  fetchOperatorGroupLoading: state.loadings.fetchOperatorGroup,
  operatorGroup: state.OperatorGroupReducer.operatorGroup,
});

export default connect(
  mapStateToProps,
  { fetchOperatorGroup, deleteOperatorGroup, fetchSelectedOperatorGroup }
)(OperatorGroup);
