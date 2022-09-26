import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Table } from 'antd';
import { IconButton } from 'components/Lib';
import { formatNumberToLocale } from 'utils';
import ExportJsonExcel from 'js-export-excel';
import styles from '../styles.module.scss';

const roundTo = require('round-to');

const FinOperations = props => {
  const { data, finOperations, finLoading, mainCurrency } = props;
  const [summaryData, setSummaryData] = useState({});
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: '80px',
      render: (value, row, index) => (row.isSummary ? 'Total' : index + 1),
    },
    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
      key: 'dateOfTransaction',
      align: 'left',
      width: '80px',
      render: value => value,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'invoicePaymentAmount',
      key: 'invoicePaymentAmount',
      align: 'right',
      width: '100px',
      render: (value, row) =>
        row.isSummary
          ? ''
          : `${formatNumberToLocale(roundTo(Number(value), 2))} ${
              row.currencyCode
            }`,
    },
    {
      title: `Məbləğ (${mainCurrency?.code})`,
      dataIndex: 'invoicePaymentAmountConvertedToInvoiceCurrency',
      key: 'invoicePaymentAmountConvertedToInvoiceCurrency',
      align: 'right',
      width: '140px',
      render: value =>
        `${formatNumberToLocale(roundTo(Number(value), 2))} ${
          mainCurrency?.code
        }`,
    },
    {
      title: 'Ödəniş növü',
      dataIndex: 'paymentTypeName',
      key: 'paymentTypeName',
      align: 'center',
      width: '120px',
    },
    {
      title: 'Əlavə məlumat',
      dataIndex: 'description',
      key: 'description',
      align: 'right',
      width: '120px',
      render: value => value || '-',
    },
  ];

  const handleExportButton = finOperations => {
    const data = finOperations || '';
    const option = {};
    const dataTable = data.map((dataItem, index) => ({
      Id: index + 1,
      Date: dataItem.dateOfTransaction,
      Amount: `${formatNumberToLocale(
        roundTo(Number(dataItem.invoicePaymentAmount), 2)
      )} ${dataItem.currencyCode}`,
      'Amount in main currency': `${formatNumberToLocale(
        roundTo(
          Number(dataItem.invoicePaymentAmountConvertedToInvoiceCurrency),
          2
        )
      )} ${dataItem.currencyCode}`,
      'Type of payment': dataItem.paymentTypeName,
      'Additional information': dataItem.description,
    }));

    option.fileName = 'vat-invoices';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Id',
          'Date',
          'Amount',
          'Amount in main currency',
          'Type of payment',
          'Additional information',
        ],
        sheetHeader: [
          'Id',
          'Date',
          'Amount',
          'Amount in main currency',
          'Type of payment',
          'Additional information',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };

  useEffect(() => {
    if (finOperations.length > 0) {
      setSummaryData({
        isSummary: true,
        id: 'Tural',
        invoicePaymentAmountConvertedToInvoiceCurrency: roundTo(
          finOperations.reduce(
            (initialValue, currentValue) =>
              initialValue +
              Number(
                currentValue.invoicePaymentAmountConvertedToInvoiceCurrency
              ),
            0
          ),
          2
        ),
        currencyCode: finOperations[0].currencyCode,
      });
    } else {
      setSummaryData({});
    }
  }, [finOperations]);
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
        <span
          style={{ fontSize: '24px', fontWeight: 'bold', marginRight: '50px' }}
        >
          Maliyyə əməliyyatları
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flexDirection: 'column',
            marginRight: '50px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#A4A4A4' }}>Müqavilə</span>
          <span style={{ fontSize: '14px', color: '#373737' }}>
            {data?.contractNo || '-'}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flexDirection: 'column',
            marginRight: '50px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#A4A4A4' }}>Qaimə</span>
          <span style={{ fontSize: '14px', color: '#373737' }}>
            {`${data?.invoiceNumber} (VAT)`}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginLeft: 'auto',
          }}
        >
          <IconButton
            buttonSize="large"
            icon="excel"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            buttonStyle={{ marginRight: '10px' }}
            onClick={() => handleExportButton(finOperations)}
          />
          {/* <IconButton
            buttonSize="large"
            icon="printer"
            iconWidth={18}
            iconHeight={18}
            onClick={window.print}
            className={styles.exportButton}
          /> */}
        </div>
      </div>

      <Row style={{ width: '100%', marginTop: 16 }}>
        <Col span={24}>
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={finOperations}
            loading={finLoading}
            className={styles.customWhiteTable}
            columns={columns}
            pagination={false}
            rowKey={record => record.id}
            rowClassName={styles.row}
          />
          {summaryData.id && (
            <Table
              scroll={{ x: 'max-content' }}
              dataSource={summaryData.id ? [summaryData] : []}
              // loading={isVatLoading}
              className={styles.totalTable}
              columns={columns}
              pagination={false}
              rowKey={record => record.id}
              rowClassName={styles.row}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = state => ({
  finLoading: state.vatInvoicesReducer.finLoading,
  finOperations: state.vatInvoicesReducer.finOperations,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
  mapStateToProps,
  {}
)(FinOperations);
