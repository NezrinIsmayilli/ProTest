import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { DeleteTwoTone } from '@ant-design/icons';
import { Tooltip, Button } from 'antd';
import swal from '@sweetalert/with-react';
import { FaPencilAlt } from 'react-icons/all';
import {
  setSelectedUnitStock,
  deleteUnitStock,
} from 'store/actions/businessUnit';
import { fetchFilteredStocks } from 'store/actions/stock';
import { Table, ProButton, ProModal } from 'components/Lib';
import { UpdateStocks } from './updateStocks';
import { UpdateTransferModal } from './UpdateTransferModal';
import styles from '../../styles.module.scss';

const StocksTable = props => {
  const {
    id,
    setSelectedUnitStock,
    deleteUnitStock,
    fetchFilteredStocks,
    selectedUnitStock,
  } = props;
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transferStocks, setTransferStocks] = useState([]);
  const [fromTransfer, setFromTransfer] = useState(undefined);
  const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);
  const [serialModalIsVisible, setSerialModalIsVisible] = useState(false);
  const [selectedTransferRow, setSelectedTransferRow] = useState({});

  useEffect(() => {
    fetchFilteredStocks({
      filters: { businessUnitIds: [0], inUse: 0 },
      onSuccessCallback: ({ data }) => {
        setStocks(data);
      },
    });
    fetchFilteredStocks({
      filters: { limit: 1000 },
      onSuccessCallback: ({ data }) => {
        setTransferStocks(data);
      },
    });
  }, []);
  const toggleRoleModal = () => {
    setRoleModalIsVisible(prevValue => !prevValue);
    setSelectedStocks([]);
  };
  const onClick = id => {
    setRoleModalIsVisible(prevValue => !prevValue);
    setSelectedStocks([]);
    if (id) {
      setFromTransfer(id);
    }
  };
  const handleModal = row => {
    setSelectedTransferRow(row);
    toggleSerialModal();
  };
  const toggleSerialModal = () => {
    setSerialModalIsVisible(
      prevSerialModalIsVisible => !prevSerialModalIsVisible
    );
  };
  const handleStockRemove = row => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        if (id && row.editId) {
          const newStocks = selectedUnitStock.filter(({ id }) => id !== row.id);
          setSelectedUnitStock({
            newSelectedUnitStock: newStocks,
          });
          deleteUnitStock({
            id: row.id,
            onSuccess: () => {
              fetchFilteredStocks({
                filters: { businessUnitIds: [0], inUse: 0 },
                onSuccessCallback: ({ data }) => {
                  setStocks(data);
                },
              });
            },
          });
        } else {
          const newStocks = selectedUnitStock.filter(({ id }) => id !== row.id);
          setSelectedUnitStock({
            newSelectedUnitStock: newStocks,
          });
        }
      }
    });
  };
  useEffect(() => {
    if (!roleModalIsVisible) {
      setFromTransfer(undefined);
    }
  }, [roleModalIsVisible]);
  const getColumns = () => {
    return [
      {
        title: '№',
        dataIndex: 'id',
        align: 'left',
        width: 70,
        render: (_value, _row, index) => index + 1,
      },
      {
        title: 'Anbar adı',
        dataIndex: 'name',
        align: 'left',
        width: 250,
        render: value => value,
      },
      {
        title: 'Transfer et',
        align: 'center',
        width: 150,
        dataIndex: 'id',
        render: value => (
          <div>
            <PlusIcon
              width="16px"
              height="16px"
              onClick={() => onClick(value)}
              className={styles.invoiceIcon}
            />
          </div>
        ),
      },
      {
        title: 'Transfer anbarları',
        dataIndex: 'transferStocks',
        align: 'center',
        render: (value, row) =>
          value && value.length > 0 ? (
            value.length > 1 ? (
              <div className={styles.transferStocks}>
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {value[0].stockName}
                  <Tooltip
                    placement="right"
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {value.map(stock => (
                          <span>{stock.stockName}</span>
                        ))}
                      </div>
                    }
                  >
                    <span className={styles.serialNumberCount}>
                      {value.length}
                    </span>
                  </Tooltip>
                </div>
                <Button
                  className={styles.btn}
                  onClick={() => {
                    handleModal(row);
                  }}
                >
                  <FaPencilAlt />
                </Button>
              </div>
            ) : (
              <div className={styles.transferStocks}>
                <span>{value[0].stockName}</span>
                <Button
                  className={styles.btn}
                  onClick={() => {
                    handleModal(row);
                  }}
                >
                  <FaPencilAlt />
                </Button>
              </div>
            )
          ) : (
            '-'
          ),
      },
      {
        title: 'Sil',
        dataIndex: 'id',
        width: 60,
        align: 'left',
        render: (value, row) => (
          <DeleteTwoTone
            style={{ fontSize: '16px', cursor: 'pointer' }}
            onClick={() => handleStockRemove(row)}
            twoToneColor="#eb2f96"
          />
        ),
      },
    ];
  };
  return (
    <>
      <UpdateTransferModal
        selectedRow={selectedTransferRow}
        isVisible={serialModalIsVisible}
        toggleModal={toggleSerialModal}
        selectedUnitStock={selectedUnitStock}
        setTransferStocks={setTransferStocks}
      />
      <ProModal
        maskClosable
        padding
        centered
        width={400}
        isVisible={roleModalIsVisible}
        handleModal={toggleRoleModal}
      >
        <UpdateStocks
          fromTransfer={fromTransfer}
          stocks={stocks}
          transferStocks={transferStocks}
          selectedStocks={selectedStocks}
          setSelectedStocks={setSelectedStocks}
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
              Anbarlar ({selectedUnitStock?.length})
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
              Anbar əlavə et
            </ProButton>
          </div>
          <Table
            columns={getColumns()}
            rowKey={row => row.id}
            dataSource={selectedUnitStock}
          />
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  selectedUnitStock: state.businessUnitReducer.selectedUnitStock,
});
export const Stocks = connect(
  mapStateToProps,
  {
    fetchFilteredStocks,
    setSelectedUnitStock,
    deleteUnitStock,
  }
)(StocksTable);
