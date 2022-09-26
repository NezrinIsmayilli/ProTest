/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProModal } from 'components/Lib';
import { Button } from 'antd';
import { fetchFilteredStocks } from 'store/actions/stock';
import {
  setSelectedUnitStock,
  deleteUnitStockTransfer,
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
  setTransferStocks,
  selectedUnitStock,
  selectedRow,
  isVisible,
  toggleModal,
  fetchFilteredStocks,
  setSelectedUnitStock,
  deleteUnitStockTransfer,
}) => {
  const { id } = selectedRow;
  const [transferStocksList, setTransferStocksList] = useState([]);

  const handleModal = () => {
    toggleModal();
  };

  const removeTransferNumber = (index, editId) => {
    if (editId) {
      const newStocks = selectedUnitStock.map(item => {
        if (item.id === id) {
          return {
            ...item,
            transferStocks: item.transferStocks.filter(
              stock => stock.id !== index
            ),
          };
        }
        return item;
      });
      setSelectedUnitStock({
        newSelectedUnitStock: newStocks,
      });
      deleteUnitStockTransfer({
        id: index,
        onSuccess: () => {
          fetchFilteredStocks({
            onSuccessCallback: ({ data }) => {
              setTransferStocks(data);
            },
          });
        },
      });
      setTransferStocksList(prevTransferStocks =>
        prevTransferStocks.filter(({ id }) => id !== index)
      );
    } else {
      const newStocks = selectedUnitStock.map(item => {
        if (item.id === id) {
          return {
            ...item,
            transferStocks: item.transferStocks.filter(
              stock => stock.id !== index
            ),
          };
        }
        return item;
      });
      setSelectedUnitStock({
        newSelectedUnitStock: newStocks,
      });
      setTransferStocksList(prevTransferStocks =>
        prevTransferStocks.filter(({ id }) => id !== index)
      );
    }
  };

  useEffect(() => {
    if (isVisible) {
      setTransferStocksList(selectedRow.transferStocks || []);
    } else {
      setTransferStocksList([]);
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
          {transferStocksList.map((value, index) => (
            <SerialNumber
              index={value.id}
              onRemove={removeTransferNumber}
              value={value.stockName}
              key={index}
              editId={value.editId}
            />
          ))}
        </div>
        <div className={styles.serialNumberFooter}>
          <span>
            Toplam: <strong>{transferStocksList.length}</strong>
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
    fetchFilteredStocks,
    setSelectedUnitStock,
    deleteUnitStockTransfer,
  }
)(TransferModal);
