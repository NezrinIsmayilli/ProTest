import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Table, ProFilterButton } from 'components/Lib';
import { ReactComponent as TrashIcon } from 'assets/img/icons/trash-main.svg';
import swal from '@sweetalert/with-react';
import { Modal, Button } from 'antd';
import {
  fetchHRMReports,
  fetchHRMReportsHistory,
  deleteHRMReportsHistoryItem,
} from 'store/actions/hrm/report';
import {
  toastHelper,
  reportHistoryOperationStatus,
  getSalaryOperationTypeName,
  formatNumberToLocale,
  defaultNumberFormat,
} from 'utils';
import { history } from 'utils/history';
import styles from './styles.module.scss';
import { toast } from 'react-toastify';

const returnUrl = '/hrm/report/salary';

function SalaryHistory(props) {
  const {
    fetchHRMReportsHistory,
    open,
    handleCancel,
    deleteHRMReportsHistoryItem,
    nonDeletedHistory,
    deletedHistory,
    selectedYear,
    selectedMonth,
    setDeletedHistory,
    setNonDeletedHistory,
    isLoadingHistory,
    isLoadingHistoryDeleted,
    fetchHRMReports,
  } = props;
  const [activeTab, setActiveTab] = useState(1);
  function handleDeleteHRMReportsHistoryItem(type, id) {
    deleteHRMReportsHistoryItem(
      type,
      id,
      onSuccessCallBack('Əməliyyat müvəffəqiyyətlə silindi'),
            ({ error }) => {
                if (
                    error?.response?.data?.error?.message ===
                    'The data is archived'
                )
                    toast.error('Əməkdaş arxiv olunduğu üçün silinə bilməz.');
            }
    );
  }

  function onSuccessCallBack(message) {
    return () => {
      fetchHRMReportsHistory({
        year: selectedYear,
        month: selectedMonth,
        deleted: reportHistoryOperationStatus.Non_Deleted,
        onSuccessCallback: ({ data }) => {
          setNonDeletedHistory(data);
        },
      });
      fetchHRMReportsHistory({
        label: 'reportsHistoryDeleted',
        year: selectedYear,
        month: selectedMonth,
        deleted: reportHistoryOperationStatus.Deleted,
        onSuccessCallback: ({ data }) => {
          setDeletedHistory(data);
        },
      });
      fetchHRMReports(selectedYear, selectedMonth);
      return toastHelper(history, returnUrl, message);
    };
  }

  const handleRemoveOperation = record => {
    swal({
      title: 'Diqqət!',
      text: 'Əməliyyatı silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        handleDeleteHRMReportsHistoryItem(record.type, record.id);
      }
    });
  };
  const columns = [
    {
      title: '№',
      width: 80,
      key: record => record.id,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      align: 'left',
      width: 140,
    },
    {
      title: 'Əməliyyat',
      dataIndex: 'type',
      align: 'left',
      width: 120,
      render: (text, record) => getSalaryOperationTypeName(record.type),
    },
    {
      title: 'Mənbə',
      dataIndex: 'type',
      key: 'source',
      align: 'left',
      width: 120,
      render: (text, record) => text === 'salary-addition-production' ? 'İstesalat' : 'Əməkhaqqı cədvəli',
    },
    {
      title: 'Əməkdaş',
      dataIndex: 'name',
      align: 'left',
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      render: (text, record) => `${record.name || ''} ${record.surname || ''}`,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      align: 'left',
      width: 120,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          row.currencyCode
        }`,
    },
    {
      title: 'Qeyd',
      dataIndex: 'note',
      align: 'center',
      width: 120,
      render: (text, record) => text || '-',
    },
    {
      title: 'Seç',
      key: 'id',
      align: 'left',
      width: 70,
      render: (text, record) => (
        <Button
          style={{ background: 'transparent', border: 'none' }}
          onClick={() => handleRemoveOperation(text)}
          disabled={!record?.canDelete}
        >
          <TrashIcon className={styles.trashIcon} fill="red"/>
        </Button>
      ),
    },
  ];

  const removedColumns = [
    {
      title: '№',
      align: 'left',
      width: 60,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      align: 'left',
      width: 120,
    },
    {
      title: 'Silinib',
      dataIndex: 'deletedAt',
      align: 'left',
      width: 120,
    },
    {
      title: 'Əməliyyat',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      render: (text, record) => getSalaryOperationTypeName(record.type),
    },
    {
      title: 'Mənbə',
      dataIndex: 'type',
      key: 'source',
      align: 'left',
      width: 120,
      render: (text, record) => text === 'salary-addition-production' ? 'İstesalat' : 'Əməkhaqqı cədvəli',
    },
    {
      title: 'Əməkdaş',
      dataIndex: 'name',
      align: 'left',
      width: 100,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record) => `${record.name || ''} ${record.surname || ''}`,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      align: 'right',
      width: 100,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          row.currencyCode
        }`,
    },
  ];
  return (
    <Modal
      title=""
      visible={open}
      closable
      maskClosable
      footer={null}
      width={1100}
      height={600}
      bodyStyle={{ padding: '0' }}
      onCancel={handleCancel}
    >
      <div className={styles.padding24}>
        <div className={styles.rowBox}>
          <div>
            <ProFilterButton
              active={activeTab === 1}
              onClick={() => {
                setActiveTab(1);
              }}
            >
              Əməliyyatlar ({nonDeletedHistory.length})
            </ProFilterButton>
            <ProFilterButton
              active={activeTab === 2}
              onClick={() => {
                setActiveTab(2);
              }}
            >
              Silinənlər ({deletedHistory.length})
            </ProFilterButton>
          </div>
        </div>
        <Table
          loading={activeTab === 1 ? isLoadingHistory : isLoadingHistoryDeleted}
          // rowClassName={styles.reportHistoryRow}
          rowKey={record => record.id}
          columns={activeTab === 1 ? columns : removedColumns}
          dataSource={activeTab === 1 ? nonDeletedHistory : deletedHistory}
        />
      </div>
    </Modal>
  );
}

const mapStateToProps = state => ({
  isLoadingHistory: !!state.loadings.reportsHistory,
  isLoadingHistoryDeleted: state.loadings.reportsHistoryDeleted,
});
export default connect(
  mapStateToProps,
  {
    deleteHRMReportsHistoryItem,
    fetchHRMReportsHistory,
    fetchHRMReports,
  }
)(SalaryHistory);
