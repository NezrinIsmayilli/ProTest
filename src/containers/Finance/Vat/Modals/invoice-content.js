import React from 'react';
import { connect } from 'react-redux';
import { Col, Row, Table } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { IconButton } from 'components/Lib';
import ExportJsonExcel from 'js-export-excel';
import styles from '../styles.module.scss';

const roundTo = require('round-to');

const InvoiceContent = props => {
  const { data, contentLoading, summaryData, mergedInvoiceContent } = props;

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: '100px',
      render: (value, row, index) =>
        row.isSummary
          ? 'Toplam'
          : row.isDiscount || row.isVat || row.isEndPrice
          ? value
          : index + 1,
    },
    {
      title: 'Məhsul',
      dataIndex: 'productName',
      key: 'productName',
      align: 'left',
      width: '150px',
    },
    {
      title: 'Say',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: '80px',
      render: value =>
        value ? formatNumberToLocale(defaultNumberFormat(value)) : '',
    },
    {
      title: 'Ölçü vahidi',
      dataIndex: 'unitsOfMeasurementName',
      key: 'unitsOfMeasurementName',
      align: 'center',
      width: '70px',
      render: (value, row) =>
        row.isDiscount || row.isVat || row.isEndPrice ? '' : value || '-',
    },
    {
      title: 'Vahidin qiyməti',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      align: 'right',
      width: '80px',
      render: (value, row) =>
        value
          ? `${formatNumberToLocale(roundTo(Number(value), 2))} ${
              row.currencyCode
            }`
          : '',
    },
    {
      title: 'Toplam qiymət',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: '80px',
      render: (value, row) =>
        row.isSummary || row.isDiscount || row.isVat || row.isEndPrice
          ? value
            ? `${value} ${row.currencyCode}`
            : ''
          : row.quantity && row.pricePerUnit
          ? `${formatNumberToLocale(
              roundTo(Number(row.pricePerUnit) * Number(row.quantity), 2)
            )} ${row.currencyCode}`
          : '',
    },
  ];
  const handleExportButton = invoiceContent => {
    const data = invoiceContent || '';
    const option = {};
    const dataTable = data.map((dataItem, index) => ({
      Id: index + 1,
      'Name of goods': dataItem.productName,
      Quantity: dataItem.quantity,
      'Units of measuring': dataItem.unitsOfMeasurementName,
      'Price per unit': `${formatNumberToLocale(
        roundTo(Number(dataItem.pricePerUnit), 2)
      )} ${dataItem.currencyCode}`,
      'Total price': `${formatNumberToLocale(
        roundTo(Number(dataItem.pricePerUnit) * Number(dataItem.quantity), 2)
      )} ${dataItem.currencyCode}`,
    }));

    option.fileName = 'invoice-content';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Id',
          'Name of goods',
          'Quantity',
          'Units of measuring',
          'Price per unit',
          'Total price',
        ],
        sheetHeader: [
          'Id',
          'Name of goods',
          'Quantity',
          'Units of measuring',
          'Price per unit',
          'Total price',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
        <span
          style={{ fontSize: '24px', fontWeight: 'bold', marginRight: '50px' }}
        >
          Qaimənin tərkibi
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
            onClick={() => handleExportButton(mergedInvoiceContent)}
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
            dataSource={mergedInvoiceContent}
            // loading={isVatLoading}
            className={styles.customWhiteTable}
            columns={columns}
            pagination={false}
            rowKey={record => record.id}
            rowClassName={styles.row}
          />
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={summaryData}
            Loading={contentLoading}
            className={styles.totalTable}
            columns={columns}
            pagination={false}
            rowKey={record => record.id}
            rowClassName={styles.row}
          />
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = state => ({
  contentLoading: state.vatInvoicesReducer.contentLoading,
});

export default connect(
  mapStateToProps,
  {}
)(InvoiceContent);
