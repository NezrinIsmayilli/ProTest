/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProModal } from 'components/Lib';
import { Button } from 'antd';
import { fetchFilteredCashboxes } from 'store/actions/settings/kassa';
import {
  setSelectedUnitCashbox,
  deleteUnitCashboxTransfer,
} from 'store/actions/businessUnit';
import styles from '../../styles.module.scss';

const SerialNumber = ({ value, index, onRemove, editId }) => (
  <div className={styles.serialNumber}>
    <span>{value}</span>
    <Button
      shape="circle"
      icon="minus"
      onClick={() => onRemove(index, editId)}
      className={styles.minusSerialNumberButton}
    />
  </div>
);

const TransferModal = ({
  setTransferCashbox,
  selectedUnitCashbox,
  selectedRow,
  isVisible,
  toggleModal,
  fetchFilteredCashboxes,
  setSelectedUnitCashbox,
  deleteUnitCashboxTransfer,
}) => {
  const { id } = selectedRow;
  const [transferCashboxList, setTransferCashboxList] = useState([]);

  const handleModal = () => {
    toggleModal();
  };

  const removeTransferNumber = (index, editId) => {
    if (editId) {
      const newCashboxes = selectedUnitCashbox.map(item => {
        if (item.id === id) {
          return {
            ...item,
            transferCashboxes: item.transferCashboxes.filter(
              cashbox => cashbox.id !== index
            ),
          };
        }
        return item;
      });
      setSelectedUnitCashbox({
        newSelectedUnitCashbox: newCashboxes,
      });
      deleteUnitCashboxTransfer({
        id: index,
        onSuccess: () => {
          fetchFilteredCashboxes({
            onSuccessCallback: ({ data }) => {
              setTransferCashbox(data);
            },
          });
        },
      });
      setTransferCashboxList(prevTransferCashbox =>
        prevTransferCashbox.filter(({ id }) => id !== index)
      );
    } else {
      const newCashboxes = selectedUnitCashbox.map(item => {
        if (item.id === id) {
          return {
            ...item,
            transferCashboxes: item.transferCashboxes.filter(
              cashbox => cashbox.id !== index
            ),
          };
        }
        return item;
      });
      setSelectedUnitCashbox({
        newSelectedUnitCashbox: newCashboxes,
      });
      setTransferCashboxList(prevTransferCashbox =>
        prevTransferCashbox.filter(({ id }) => id !== index)
      );
    }
  };

  useEffect(() => {
    if (isVisible) {
      setTransferCashboxList(selectedRow.transferCashboxes || []);
    } else {
      setTransferCashboxList([]);
    }
  }, [isVisible]);

  return (
    <ProModal
      maskClosable
      width={600}
      isVisible={isVisible}
      customStyles={styles.AddSerialNumbersModal}
      handleModal={handleModal}
    >
      <div className={styles.AddSerialNumbers}>
        <h2>Transfer anbarları</h2>
        <div className={styles.serialNumbers}>
          {transferCashboxList.map((value, index) => (
            <SerialNumber
              index={value.id}
              onRemove={removeTransferNumber}
              value={value.cashboxName}
              key={index}
              editId={value.editId}
            />
          ))}
        </div>
        <div className={styles.serialNumberFooter}>
          <span>
            Toplam: <strong>{transferCashboxList.length}</strong>
          </span>
        </div>
      </div>
    </ProModal>
  );
};

const mapStateToProps = state => ({});
export const UpdateTransferModal = connect(
  mapStateToProps,
  {
    fetchFilteredCashboxes,
    setSelectedUnitCashbox,
    deleteUnitCashboxTransfer,
  }
)(TransferModal);
