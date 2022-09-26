import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { DeleteTwoTone } from '@ant-design/icons';
import { fetchProductPriceTypes } from 'store/actions/settings/mehsul';
import swal from '@sweetalert/with-react';
import {
  setSelectedUnitPriceType,
  deleteUnitPriceType,
} from 'store/actions/businessUnit';
import { Table, ProButton, ProModal } from 'components/Lib';
import { UpdatePriceType } from './updatePriceType';
import styles from '../../styles.module.scss';

const PriceTypeTable = props => {
  const {
    id,
    setSelectedUnitPriceType,
    deleteUnitPriceType,
    selectedUnitPriceType,
    fetchProductPriceTypes,
    priceTypes,
    defaultPriceType,
    setDefaultPriceType,
  } = props;
  const [selectedPriceTypes, setSelectedPriceTypes] = useState([]);
  const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);

  useEffect(() => {
    fetchProductPriceTypes();
  }, []);

  useEffect(() => {
    if (!id) {
      setDefaultPriceType(
        priceTypes
          .filter(priceType => !priceType.isDeletable)
          .map(type => ({
            priceTypeId: type.id,
            priceTypeName: type.name,
          }))
      );
    }
  }, [priceTypes]);

  const toggleRoleModal = () => {
    setRoleModalIsVisible(prevValue => !prevValue);
    setSelectedPriceTypes([]);
  };
  const handlePriceTypeRemove = row => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        if (id && row.editId) {
          const newPriceTypes = selectedUnitPriceType.filter(
            ({ priceTypeId }) => priceTypeId !== row.priceTypeId
          );
          setSelectedUnitPriceType({
            newSelectedUnitPriceType: newPriceTypes,
          });
          deleteUnitPriceType({
            id: row.id,
          });
        } else {
          const newPriceTypes = selectedUnitPriceType.filter(
            ({ priceTypeId }) => priceTypeId !== row.priceTypeId
          );
          const newDefaultPriceType = defaultPriceType.filter(
            ({ priceTypeId }) => priceTypeId !== row.priceTypeId
          );
          setSelectedUnitPriceType({
            newSelectedUnitPriceType: newPriceTypes,
          });
          setDefaultPriceType(newDefaultPriceType);
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
        title: 'Qiymət tipi',
        dataIndex: 'priceTypeName',
        align: 'left',
        render: (value, row) => value,
      },
      {
        title: 'Sil',
        dataIndex: 'priceTypeId',
        width: 60,
        align: 'left',
        render: (value, row) => (
          <DeleteTwoTone
            style={{ fontSize: '16px', cursor: 'pointer' }}
            onClick={() => handlePriceTypeRemove(row)}
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
        <UpdatePriceType
          selectedPriceTypes={selectedPriceTypes}
          setSelectedPriceTypes={setSelectedPriceTypes}
          defaultPriceType={defaultPriceType}
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
              Qiymət tipi ({selectedUnitPriceType?.length})
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
              Qiymət tipi əlavə et
            </ProButton>
          </div>
          <Table
            columns={getColumns()}
            rowKey={row => row.id}
            dataSource={
              id
                ? selectedUnitPriceType
                : [...defaultPriceType, ...selectedUnitPriceType]
            }
          />
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  selectedUnitPriceType: state.businessUnitReducer.selectedUnitPriceType,
  priceTypes: state.mehsulReducer.productPriceTypes,
});
export const PriceType = connect(
  mapStateToProps,
  { fetchProductPriceTypes, setSelectedUnitPriceType, deleteUnitPriceType }
)(PriceTypeTable);
