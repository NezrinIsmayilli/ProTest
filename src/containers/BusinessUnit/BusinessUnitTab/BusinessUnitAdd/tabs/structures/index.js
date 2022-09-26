import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { DeleteTwoTone } from '@ant-design/icons';
import { fetchFilteredStructures } from 'store/actions/structure';
import swal from '@sweetalert/with-react';
import {
  setSelectedUnitStructure,
  deleteUnitStructure,
} from 'store/actions/businessUnit';
import { Table, ProButton, ProModal } from 'components/Lib';
import { UpdateStructure } from './updateStructure';
import styles from '../../styles.module.scss';

const StructuresTable = props => {
  const {
    id,
    setSelectedUnitStructure,
    deleteUnitStructure,
    selectedUnitStructure,
    fetchFilteredStructures,
  } = props;
  const [selectedStructures, setSelectedStructures] = useState([]);
  const [structures, setStructures] = useState([]);
  const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);

  const toggleRoleModal = () => {
    setRoleModalIsVisible(prevValue => !prevValue);
    setSelectedStructures([]);
  };
  useEffect(() => {
    fetchFilteredStructures({
      filters: { businessUnitIds: [0] },
      onSuccessCallback: ({ data }) => {
        setStructures(data.filter(item => item.id !== 0));
      },
    });
  }, []);
  const handleUserRemove = row => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        if (id && row.editId) {
          const newStructures = selectedUnitStructure.filter(
            ({ id }) => id !== row.id
          );
          setSelectedUnitStructure({
            newSelectedUnitStructure: newStructures,
          });
          deleteUnitStructure({
            id: row.id,
          });
        } else {
          const newStructures = selectedUnitStructure.filter(
            ({ id }) => id !== row.id
          );
          setSelectedUnitStructure({
            newSelectedUnitStructure: newStructures,
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
        title: 'Bölmə adı',
        dataIndex: 'name',
        align: 'left',
        render: value => value,
      },
      {
        title: 'Sil',
        dataIndex: 'id',
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
        <UpdateStructure
          structures={structures}
          selectedStructures={selectedStructures}
          setSelectedStructures={setSelectedStructures}
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
              Bölmələr ({selectedUnitStructure?.length})
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
              Bölmə əlavə et
            </ProButton>
          </div>
          <Table
            columns={getColumns()}
            rowKey={row => row.id}
            dataSource={selectedUnitStructure}
          />
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  selectedUnitStructure: state.businessUnitReducer.selectedUnitStructure,
});
export const Structure = connect(
  mapStateToProps,
  { fetchFilteredStructures, setSelectedUnitStructure, deleteUnitStructure }
)(StructuresTable);
