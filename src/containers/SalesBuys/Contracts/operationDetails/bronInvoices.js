/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect } from 'react';
import { Button, Table, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { DetailButton, ProModal } from 'components/Lib';
import {
  fetchMainCurrency,
  convertCurrency,
} from 'store/actions/settings/kassa';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from 'containers/Reports/tabs/styles.module.scss';
import moment from 'moment';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import BronDetails from 'containers/Warehouse/Bron/bronDetails';
import OperationsDetails from './operationsDetails';

function BronInvoices({
  isLoading,
  invoices,
  contractName,
  fetchMainCurrency,
  mainCurrency,
  fetchBusinessUnitList,
}) {
  const [details, setDetails] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);

  useEffect(() => {
    if (!mainCurrency.id) fetchMainCurrency();
    fetchBusinessUnitList({
      filters: {},
      onSuccess: res => {
        setAllBusinessUnits(res.data);
      },
    });
  }, []);

  const getStatusType = (isDeleted, bronEndDate) => {
    const bronDate = moment(bronEndDate, 'DD-MM-YYYY HH:mm:ss').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    if (isDeleted) {
      return (
        <span
          style={{
            color: '#C4C4C4',
            background: '#F8F8F8',
          }}
          className={styles.chip}
        >
          Silinib
        </span>
      );
    }
    if (bronEndDate && moment(bronDate) < moment()) {
      return (
        <span
          style={{
            color: '#B16FE4',
            background: '#F6EEFC',
          }}
          className={styles.chip}
        >
          Bitib
        </span>
      );
    }

    if (!bronEndDate || moment(bronDate) > moment()) {
      return (
        <span
          className={styles.chip}
          style={{
            color: '#F3B753',
            background: '#FDF7EA',
          }}
        >
          Aktiv
        </span>
      );
    }
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (value, row, index) => !row.isTotal && index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      width: 140,
      align: 'left',
      render: (value, row) => !row.isTotal && value?.split('  '),
    },
    {
      title: 'Anbar',
      dataIndex: 'stockName',
      width: 150,
      ellipsis: true,
      render: (value, row) => (
        <Tooltip placement="topLeft" title={value || ''}>
          <span>{row.isTotal ? null : value || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      width: 140,
      render: (value, row) => !row.isTotal && (value || '-'),
    },
    {
      title: `Məbləğ(${mainCurrency?.code})`,
      dataIndex: 'endPriceInMainCurrency',
      width: 130,
      align: 'right',
      render: (value, row) =>
        !row.isTotal &&
        (`${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        }` ||
          '-'),
    },
    {
      title: 'Başlama tarixi',
      dataIndex: 'operationDate',
      width: 140,
      align: 'left',
      render: (value, row) => !row.isTotal && value?.split('  '),
    },
    {
      title: 'Bitmə tarixi',
      dataIndex: 'bronEndDate',
      width: 140,
      align: 'left',
      render: (value, row) =>
        !row.isTotal && (value?.split('  ') || 'Müddətsiz'),
    },
    {
      title: 'Status',
      dataIndex: 'isDeleted',
      align: 'center',
      width: 120,
      render: (value, row) => getStatusType(value, row.bronEndDate),
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 85,
      align: 'center',
      render: (value, row) =>
        !row?.isTotal && (
          <DetailButton onClick={() => handleDetailsModal(row)} />
        ),
    },
  ];
  const handleDetailsModal = row => {
    setDetails(!details);
    setSelectedRow(row);
  };
  const componentRef = useRef();
  return (
    <>
      <ProModal
        maskClosable
        padding
        width={activeTab === 0 ? 760 : 1200}
        handleModal={handleDetailsModal}
        visible={details}
      >
        <BronDetails
          row={selectedRow}
          getStatusType={getStatusType}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCancel={handleDetailsModal}
          visible={details}
          allBusinessUnits={allBusinessUnits}
        />
      </ProModal>
      <ProModal>
        <OperationsDetails
          row={selectedRow}
          mainCurrencyCode={mainCurrency}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCancel={handleDetailsModal}
          visible={details}
        />
      </ProModal>

      <div
        ref={componentRef}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          className={styles.exportBox}
          style={{
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 40,
          }}
        >
          <div className={styles.exportBox}>
            <div
              className={styles.columnDetailItem}
              style={{ marginBottom: 6 }}
            >
              <label
                style={{
                  fontWeight: 600,
                  fontSize: 24,
                  lineHeight: '24px',
                  marginBottom: 10,
                  color: '#373737',
                }}
              >
                {contractName}
              </label>

              <span
                style={{
                  fontSize: 18,
                  lineHeight: '16px',

                  color: '#CBCBCB',
                }}
              >
                Satış
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              className={styles.customSquareButton}
              shape="circle"
              icon="file-excel"
            />
          </div>
        </div>

        <div
          className={styles.opInvTable}
          style={{
            width: 'calc(100% + 30px)',
            marginTop: 32,
            maxHeight: 600,
            paddingRight: 8,
            overflowY: 'auto',
            marginRight: -16,
          }}
        >
          <Table
            loading={isLoading}
            scroll={{ x: 'max-content' }}
            dataSource={invoices || []}
            className={styles.opInvoiceContentTable}
            columns={columns}
            pagination={false}
            rowKey={record => record.id}
            rowClassName={styles.row}
          />
        </div>
      </div>
    </>
  );
}

const mapStateToProps = state => ({
  mainCurrency: state.kassaReducer.mainCurrency,
  isLoading: state.salesAndBuysReducer.isLoading,
});
export default connect(
  mapStateToProps,
  { fetchMainCurrency, convertCurrency, fetchBusinessUnitList }
)(BronInvoices);
