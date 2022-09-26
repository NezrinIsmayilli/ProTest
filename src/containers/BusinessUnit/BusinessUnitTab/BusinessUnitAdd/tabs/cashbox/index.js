import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Tooltip, Button } from 'antd';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import swal from '@sweetalert/with-react';
import {
  setSelectedUnitCashbox,
  deleteUnitCashbox,
} from 'store/actions/businessUnit';
import { FaPencilAlt } from 'react-icons/all';
import { fetchFilteredCashboxes } from 'store/actions/settings/kassa';
import { DeleteTwoTone } from '@ant-design/icons';
import { Table, ProButton, ProModal } from 'components/Lib';
import { UpdateCashbox } from './updateCashbox';
import { UpdateTransferModal } from './UpdateTransferModal';
import styles from '../../styles.module.scss';

const CashboxTable = props => {
  const {
    id,
    setSelectedUnitCashbox,
    deleteUnitCashbox,
    fetchFilteredCashboxes,
    selectedUnitCashbox,
  } = props;
  const [selectedCashbox, setSelectedCashbox] = useState([]);
  const [cashbox, setCashbox] = useState([]);
  const [transferCashbox, setTransferCashbox] = useState([]);
  const [fromTransfer, setFromTransfer] = useState(undefined);
  const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);
  const [cashboxType, setCashboxType] = useState(undefined);
  const [serialModalIsVisible, setSerialModalIsVisible] = useState(false);
  const [selectedCashboxRow, setSelectedCashboxRow] = useState({});

  useEffect(() => {
    fetchFilteredCashboxes({
      filters: { businessUnitIds: [0], inUse: 0, limit: 1000 },
      onSuccessCallback: ({ data }) => {
        setCashbox(data);
      },
    });
    fetchFilteredCashboxes({
      filters: { limit: 1000 },
      onSuccessCallback: ({ data }) => {
        setTransferCashbox(data);
      },
    });
  }, []);
  const toggleRoleModal = () => {
    setRoleModalIsVisible(prevValue => !prevValue);
    setCashboxType(undefined);
    setSelectedCashbox([]);
  };
  const handleModal = row => {
    setSelectedCashboxRow(row);
    toggleSerialModal();
  };
  const toggleSerialModal = () => {
    setSerialModalIsVisible(
      prevSerialModalIsVisible => !prevSerialModalIsVisible
    );
  };
  const onClick = id => {
    setRoleModalIsVisible(prevValue => !prevValue);
    setCashboxType(undefined);
    setSelectedCashbox([]);
    if (id) {
      setFromTransfer(id);
    }
  };
  const handleCashboxRemove = row => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        if (id && row.editId) {
          const newCashboxs = selectedUnitCashbox.filter(
            ({ id }) => id !== row.id
          );
          setSelectedUnitCashbox({
            newSelectedUnitCashbox: newCashboxs,
          });
          deleteUnitCashbox({
            id: row.id,
            onSuccess: () => {
              fetchFilteredCashboxes({
                filters: { businessUnitIds: [0], inUse: 0, limit: 1000 },
                onSuccessCallback: ({ data }) => {
                  setCashbox(data);
                },
              });
            },
          });
        } else {
          const newCashbox = selectedUnitCashbox.filter(
            ({ id }) => id !== row.id
          );
          setSelectedUnitCashbox({
            newSelectedUnitCashbox: newCashbox,
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
        title: 'Hesab növü',
        dataIndex: 'type',
        align: 'left',
        width: 130,
        render: value =>
          value === 1
            ? 'Nəğd'
            : value === 2
            ? 'Bank Transferi'
            : value === 3
            ? 'Kart ödənişi'
            : value === 4
            ? 'Digər'
            : '-',
      },
      {
        title: 'Hesab adı',
        dataIndex: 'name',
        align: 'center',
        width: 250,
        render: value => value,
      },
      {
        title: 'Transfer et',
        align: 'center',
        dataIndex: 'id',
        width: 100,
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
        title: 'Transfer hesabları',
        dataIndex: 'transferCashboxes',
        align: 'center',
        width: 200,
        render: (value, row) =>
          value && value.length > 0 ? (
            value.length > 1 ? (
              <div className={styles.transferStocks}>
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {value[0].cashboxName}
                  <Tooltip
                    placement="right"
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {value.map(cashbox => (
                          <span>{cashbox.cashboxName}</span>
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
                <span>{value[0].cashboxName}</span>
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
            onClick={() => handleCashboxRemove(row)}
            twoToneColor="#eb2f96"
          />
        ),
      },
    ];
  };
  return (
    <>
      <UpdateTransferModal
        selectedRow={selectedCashboxRow}
        isVisible={serialModalIsVisible}
        toggleModal={toggleSerialModal}
        selectedUnitCashbox={selectedUnitCashbox}
        setTransferCashbox={setTransferCashbox}
      />
      <ProModal
        maskClosable
        padding
        centered
        width={400}
        isVisible={roleModalIsVisible}
        handleModal={toggleRoleModal}
      >
        <UpdateCashbox
          fromTransfer={fromTransfer}
          cashbox={cashbox}
          transferCashbox={transferCashbox}
          selectedCashbox={selectedCashbox}
          setSelectedCashbox={setSelectedCashbox}
          toggleRoleModal={toggleRoleModal}
          setCashboxType={setCashboxType}
          cashboxType={cashboxType}
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
              Hesablar ({selectedUnitCashbox?.length})
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
              Hesab əlavə et
            </ProButton>
          </div>
          <Table
            columns={getColumns()}
            rowKey={row => row.id}
            dataSource={selectedUnitCashbox}
          />
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  selectedUnitCashbox: state.businessUnitReducer.selectedUnitCashbox,
});
export const Cashbox = connect(
  mapStateToProps,
  { fetchFilteredCashboxes, setSelectedUnitCashbox, deleteUnitCashbox }
)(CashboxTable);
