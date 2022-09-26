/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect } from 'react';
import { Button, Table, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { ProModal } from 'components/Lib';
import {
  fetchMainCurrency,
  convertCurrency,
} from 'store/actions/settings/kassa';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from 'containers/Reports/tabs/styles.module.scss';
import OperationsDetails from './operationsDetails';
import CashboxInfoButton from './CashboxInfoButton';

function SalaryInvoices({
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
  const [totalSalary, setTotalSalary] = useState(undefined);
  useEffect(() => {
    if (profitContractInfo) {
      setTotalSalary(profitContractInfo?.salary_amount);
    }
  }, [profitContractInfo]);
  useEffect(() => {
    if (!mainCurrency.id) fetchMainCurrency();
  }, []);
  const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
    <div className={styles.opInvoiceContentFooter} style={{ color }}>
      <strong>{primary}</strong>
      <strong>{quantity}</strong>
      <strong style={{ marginRight: '10px', color: '#FF716A' }}>
        {secondary}
      </strong>
    </div>
  );
  const columns = [
    {
      title: '№',
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
    },
    {
      title: 'Sənəd',
      dataIndex: 'documentNumber',
    },
    {
      title: 'Kateqoriya',
      dataIndex: 'categoryName',
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'contactOrEmployee',
      ellipsis: true,
      render: value => (
        <Tooltip placement="topLeft" title={value || ''}>
          <span>{value || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      align: 'right',
      render: (value, row) => {
        const data = parseFloat(value).toFixed(2);
        return (
          <span style={{ color: '#FF716A' }}>
            {'-'}
            {data} {row.currencyCode}
          </span>
        );
      },
    },
    {
      title: `Məbləğ(${contract?.currency_code})`,
      dataIndex: 'amount',
      align: 'right',
      render: (value, row) => (
        <CashboxInfoButton
          fetchInfo={callback =>
            convertCurrency({
              params: {
                fromCurrencyId: row?.currencyId,
                toCurrencyId: contract?.currency_id,
                amount: value,
                dateTime: row?.dateOfTransaction,
              },

              onSuccessCallback: ({ data }) => {
                callback(data);
              },
            })
          }
        />
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
              defaultNumberFormat(totalSalary)
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
)(SalaryInvoices);
