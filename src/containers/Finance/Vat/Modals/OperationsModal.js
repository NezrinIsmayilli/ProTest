import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { Modal, Row, Col, Button, Table } from 'antd';
import { IconButton, CustomTag } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { ReactComponent as Payment } from 'assets/img/icons/paymentIcon.svg';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { permissions } from 'config/permissions';
import ThreeDot from '../ThreeDots';
import styles from '../styles.module.scss';
import TransactionModal from './TransactionModal';

const roundTo = require('round-to');
const math = require('exact-math');

const OperationsModal = props => {
  const {
    visible,
    setIsVisible,
    type = 'recievables',
    isVatLoading,
    vatOperations,
    permissionsByKeyValue,
  } = props;

  const history = useHistory();
  const isPaymentDisabled =
    permissionsByKeyValue[permissions.transaction_invoice_payment]
      ?.permission !== 2;
  const [transactionModalIsVisible, setTransactionModalIsVisible] = useState(
    false
  );
  const [transactionType, setTransactionType] = useState(1);
  const [selectedRow, setSelectedRow] = useState();
  const [summaryData, setSummaryData] = useState({});
  const [exSalesInvoiceList, setExSalesInvoiceList] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const columnClone = ['contractNo','invoiceNumber','operationDate','taxPaymentStatus','taxAmount','paidTaxAmount','paidInPercentage','toBePaid'];
  const handleThreeDotClick = (
    setTransactionType,
    setTransactionModalIsVisible,
    type,
    row
  ) => {
    setTransactionType(type);
    setSelectedRow(row);
    setTransactionModalIsVisible(true);
  };

  const getStatusLabel = invoiceType =>
    invoiceType === 1
      ? 'Açıq'
      : invoiceType === 2
      ? 'Qismən ödənilib'
      : 'Ödənilib';
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 100,
      render: (value, row, index) => (row.isSummary ? 'Toplam' : index + 1),
    },
    {
      title: 'Müqavilə',
      dataIndex: 'contractNo',
      align: 'center',
      width: 120,
      render: (value, row) => (row.isSummary ? '' : value || '-'),
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      align: 'left',
      width: 150,
      render: (value, row) => (row.isSummary ? '' : `${value} (ƏDV)`),
    },
    {
      title: 'Tarix',
      dataIndex: 'operationDate',
      align: 'left',
      width: 120,
      render: (value, row) => (row.isSummary ? '' : value),
    },
    {
      title: 'Status',
      dataIndex: 'taxPaymentStatus',
      align: 'left',
      width: 150,
      render: (value, row) =>
        row.isSummary ? '' : <CustomTag label={getStatusLabel(value)} />,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'taxAmount',
      align: 'right',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          row.taxCurrencyCode
        } `,
    },
    {
      title: 'Ödənilib',
      dataIndex: 'paidTaxAmount',
      align: 'right',
      width: 150,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          row.taxCurrencyCode
        }`,
    },
    {
      title: 'Ödənilib(%)',
      dataIndex: 'paidInPercentage',
      align: 'center',
      width: 100,
      render: (value, { paidTaxAmount, taxAmount }) =>
        `${formatNumberToLocale(
          defaultNumberFormat((Number(paidTaxAmount) * 100) / Number(taxAmount))
        )}%`,
    },
    {
      title: 'Ödənilməlidir',
      dataIndex: 'toBePaid',
      align: 'right',
      width: 150,
      render: (value, { taxAmount, paidTaxAmount, taxCurrencyCode }) =>
        `${formatNumberToLocale(
          defaultNumberFormat(math.sub(Number(taxAmount), Number(paidTaxAmount)))
        )} ${taxCurrencyCode}`,
    },
    {
      width: 50,
      align: 'center',
      render: (value, row) =>
        row.isSummary ? (
          ''
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={
              row.taxPaymentStatus === 3 || isPaymentDisabled
                ? styles.paymentDisabled
                : styles.paymentActive
            }
          >
            <Payment
              className={`${styles.documentIcon} ${
                row.taxPaymentStatus === 3 || isPaymentDisabled
                  ? styles.disable
                  : null
              }`}
              onClick={() =>
                row.taxPaymentStatus === 3 || isPaymentDisabled
                  ? null
                  : history.push(
                      `/finance/operations/add?id=${row.id}&isVat=${true}`
                    )
              }
            />
          </div>
        ),
    },
    {
      width: 50,
      render: (value, row) =>
        row.isSummary ? (
          ''
        ) : (
          <ThreeDot
            handleThreeDotClick={handleThreeDotClick}
            setTransactionType={setTransactionType}
            setTransactionModalIsVisible={setTransactionModalIsVisible}
            transactionModalIsVisible={transactionModalIsVisible}
            row={row}
          />
        ),
    },
  ];





  const filterInvoicesByTaxAmount = invoices => {
    const newData = invoices.filter(invoice => invoice.taxAmount);
    return newData;
  };

  useEffect(() => {
    if (vatOperations.length > 0) {
      const totalTaxAmount = vatOperations.reduce(
        (initialValue, currentValue) =>
          initialValue + Number(currentValue.taxAmount),
        0
      );
      const totalPaidTaxAmount = vatOperations.reduce(
        (initialValue, currentValue) =>
          initialValue + Number(currentValue.paidTaxAmount),
        0
      );

      setSummaryData({
        isSummary: true,
        id: 'Total',
        taxAmount: totalTaxAmount,
        paidTaxAmount: totalPaidTaxAmount,
        taxCurrencyCode: vatOperations[0].taxCurrencyCode,
      });
    }
  }, [vatOperations]);

  const getExcelColumns = () => {
    let columns = []
    columns[columnClone.indexOf('contractNo')] = {
      title: 'Müqavilə',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('invoiceNumber')] = {
      title: `Qaimə`,
      width: { wpx: 200 },
    };
  
    columns[columnClone.indexOf('operationDate')] = {
      title: `Tarix`,
      width: { wpx: 150 },
    };
    
    columns[columnClone.indexOf('taxPaymentStatus')] = {
      title: 'Status',
      width: { wpx: 200 },
    };
  
    columns[columnClone.indexOf('taxAmount')] = {
      title: `Məbləğ`,
      width: { wpx: 150 },
    };
  
    columns[columnClone.indexOf('paidTaxAmount')] = {
      title: `Ödənilib`,
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('paidInPercentage')] = {
      title: 'Ödənilib(%)',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('toBePaid')] = {
      title: `Ödənilməlidir`,
      width: { wpx: 150 },
    };

    columns.unshift({
      title: '№',
      width: { wpx: 90 },
    });
    setExcelColumns(columns)
  }
  
  const getExcelData = () => {
    const columnFooterStyle = {
               font: { color: { rgb: 'FFFFFF' }, bold: true },
               fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
           };
    const data = exSalesInvoiceList.map((item, index) => { 
    let arr = []
    columnClone.includes('contractNo') && (arr[columnClone.indexOf('contractNo')] =item.isSummary?{value:'',style:columnFooterStyle}:{ value: item.contractNo|| '-', })
    columnClone.includes('invoiceNumber') &&(arr[columnClone.indexOf('invoiceNumber')] =item.isSummary?{value:'',style:columnFooterStyle}:{ value:` ${item.invoiceNumber} (ƏDV)`|| '-', })
    columnClone.includes('operationDate') &&(arr[columnClone.indexOf('operationDate')] =item.isSummary?{value:'',style:columnFooterStyle}:{ value: item.operationDate|| '-', })
    columnClone.includes('taxPaymentStatus') &&(arr[columnClone.indexOf('taxPaymentStatus')] =item.isSummary?{value:'',style:columnFooterStyle}:{ value:  item.taxPaymentStatus === 1? 'Açıq': item.taxPaymentStatus === 2? 'Qismən Ödənilib': 'Ödənilib'|| '-', })
    columnClone.includes('taxAmount') &&(arr[columnClone.indexOf('taxAmount')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.taxAmount))} ${item.taxCurrencyCode}`|| '-',style:item.isSummary?columnFooterStyle:'' })
    columnClone.includes('paidTaxAmount') &&(arr[columnClone.indexOf('paidTaxAmount')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.paidTaxAmount))} ${item.taxCurrencyCode}`|| '-',style:item.isSummary?columnFooterStyle:'' })
    columnClone.includes('paidInPercentage') &&(arr[columnClone.indexOf('paidInPercentage')] = { value:`${formatNumberToLocale(defaultNumberFormat((Number(item.paidTaxAmount) * 100) / Number(item.taxAmount)))}%`|| '-',style:item.isSummary?columnFooterStyle:'' })
    columnClone.includes('toBePaid') &&(arr[columnClone.indexOf('toBePaid')] = { value:`${formatNumberToLocale(defaultNumberFormat(math.sub(Number(item.taxAmount), Number(item.paidTaxAmount))))} ${item.taxCurrencyCode}`|| '-',style:item.isSummary?columnFooterStyle:'' })
     
    
     arr.unshift(item.isSummary?{value:'Toplam:',style:columnFooterStyle}:{ value: index + 1, })
      return arr;
     
    })
    setExcelData(data);
  }
        
  useEffect(() => {
    getExcelColumns()
  }, [])
  
  useEffect(() => {
    getExcelData()
  }, [exSalesInvoiceList]);
  return (
    <Modal
      visible={visible}
      footer={null}
      width={1400}
      closable={false}
      className={styles.customModal}
      onCancel={() => setIsVisible(false)}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => setIsVisible(false)}
      >
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.OperationsModal}>
        <TransactionModal
          visible={transactionModalIsVisible}
          setIsVisible={setTransactionModalIsVisible}
          data={selectedRow}
          type={transactionType}
          setType={setTransactionType}
        />
        <Row>
          <Col span={12}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: 'column',
              }}
            >
              <label className={styles.type}>{`${
                type === 'payables' ? 'Kreditor Borclar' : 'Debitor Borclar'
              }`}</label>
              <label className={styles.counterparty}>
                {vatOperations?.counterparty}
              </label>
            </div>
          </Col>
          <Col span={6} offset={6} align="end">
          <ExportToExcel
              getExportData={
              () => setExSalesInvoiceList([...filterInvoicesByTaxAmount(vatOperations),summaryData])}
              data={excelData}
              columns={excelColumns}
              excelTitle={`${type === 'payables' ? 'Kreditor Qaimə' : 'Debitor Qaimə' }`}
              excelName={type === 'payables' ? 'Kreditor Qaimə' : 'Debitor Qaimə' }
              filename={type === 'payables' ? 'Kreditor Qaimə' : 'Debitor Qaimə'}
          />
            {/* <IconButton
              buttonSize="large"
              icon="printer"
              iconWidth={18}
              iconHeight={18}
              onClick={window.print}
              className={styles.exportButton}
            /> */}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              dataSource={filterInvoicesByTaxAmount(vatOperations)}
              loading={isVatLoading}
              scroll={{ x: 'max-content', y:500 }}
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
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isVatLoading: state.vatInvoicesReducer.isLoading,
  vatOperations: state.vatInvoicesReducer.vatOperations,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  {}
)(OperationsModal);
