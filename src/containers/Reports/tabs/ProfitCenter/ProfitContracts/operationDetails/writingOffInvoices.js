/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect } from 'react';
import { Button, Table } from 'antd';
import { connect } from 'react-redux';
import { DetailButton, ProModal } from 'components/Lib';
import {
  fetchMainCurrency,
  convertCurrency,
} from 'store/actions/settings/kassa';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from 'containers/Reports/tabs/styles.module.scss';
import OperationsDetails from './operationsDetails';
import CashboxInfoButton from './CashboxInfoButton';

function WritingOffInvoices({
  isLoading,
  invoices,
  contractName,
  fetchMainCurrency,
  mainCurrency,
  contract,
  convertCurrency,
  profitContractInfo,
}) {
  const [details, setDetails] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [totalWritingOff, setTotalWritingOff] = useState(undefined);
  useEffect(() => {
    if (profitContractInfo) {
      setTotalWritingOff(profitContractInfo?.writing_off_amount);
    }
  }, [profitContractInfo]);
  useEffect(() => {
    if (!mainCurrency.id) fetchMainCurrency();
  }, []);
  const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
    <div className={styles.opInvoiceContentFooter} style={{ color }}>
      <strong>{primary}</strong>
      <strong>{quantity}</strong>
      <strong style={{ marginRight: '350px', color: '#FF716A' }}>
        {secondary}
      </strong>
    </div>
  );
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (value, row, index) => !row.isTotal && index + 1,
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      width: 140,
      render: (value, row) => !row.isTotal && value,
    },
    {
      title: 'Tarix',
      dataIndex: 'operationDate',
      width: 140,
      align: 'left',
      render: (value, row) => !row.isTotal && value?.split('  '),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'endPrice',
      align: 'right',
      width: 130,
      render: value => (
        <span style={{ color: '#FF716A' }}>
          -{formatNumberToLocale(defaultNumberFormat(value))}{' '}
          {mainCurrency?.code}
        </span>
      ),
    },
    {
      title: `Məbləğ(${contract?.currency_code})`,
      dataIndex: 'amount',
      width: 130,
      align: 'right',
      render: (value, row) => (
        <CashboxInfoButton
          fetchInfo={callback =>
            convertCurrency({
              params: {
                fromCurrencyId: mainCurrency?.id,
                toCurrencyId: contract?.currency_id,
                amount: value,
                dateTime: row?.operationDate,
              },
              onSuccessCallback: ({ data }) => {
                callback(data);
              },
              onFailureCallback: error => {
                callback(undefined);
              },
            })
          }
        />
      ),
    },
    {
      title: 'Satış meneceri',
      dataIndex: 'salesmanLastName',
      width: 150,
      align: 'left',
      render: (value, { salesmanName, isTotal }) =>
        !isTotal && `${salesmanName} ${value}`,
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
        isVisible={details}
        handleModal={handleDetailsModal}
        width={activeTab === 0 ? 760 : 1200}
      >
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
          <FooterRow
            primary="Toplam"
            secondary={`-${formatNumberToLocale(
              defaultNumberFormat(totalWritingOff)
            )} ${contract?.currency_code || '-'}`}
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
  { fetchMainCurrency, convertCurrency }
)(WritingOffInvoices);
