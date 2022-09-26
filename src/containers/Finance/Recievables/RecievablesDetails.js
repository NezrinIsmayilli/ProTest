import React, { useRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Table } from 'antd';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { ReactComponent as Payment } from 'assets/img/icons/paymentIcon.svg';
import {
  exportTableToExcel,
  formatNumberToLocale,
  defaultNumberFormat,
  roundToDown,
} from 'utils';
import { permissions } from 'config/permissions';
import ExportToExcel from 'components/Lib/ExportToExcel';
import RecievablesInvoiceAction from 'components/Lib/Details/RecievablesInvoiceAction';
import styles from './styles.module.scss';

const math = require('exact-math');

const Chip = ({ color, label }) => (
  <span
    className={styles.chip}
    style={{
      color,
      backgroundToDownColor: `${color}24`,
    }}
  >
    {label}
  </span>
);
const WhatIsThis = ({ status }) => {
  if (status === 1) return <Chip color="#4E9CDF" label="Açıq" />;
  if (status === 2) return <Chip color="#55AB80" label="Qismən Ödənilib" />;
  if (status === 3) return <Chip color="#55AB80" label="Ödənilib" />;
};

function RecievablesDetails(props) {
  const componentRef = useRef();
  const {
    row,
    filters,
    fetchSalesInvoiceList,
    invoices,
    isLoading,
    permissionsByKeyValue,
    type,
  } = props;

  const history = useHistory();
  const [exSalesInvoiceList, setExSalesInvoiceList] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const columnClone = ['contractNo','invoiceNumber','operationDate','paymentStatus','endPrice','paidAmount','paidInPercentage','mustPaid'];
  const isPaymentDisabled =
    permissionsByKeyValue[permissions.transaction_invoice_payment]
      ?.permission !== 2;
  const handleData = invoices => {
    if (invoices.length > 0) {
      return [
        ...invoices.map(invoice => ({
          ...invoice,
          paidInPercentage:
            (roundToDown(invoice.paidAmount || 0) * 100) /
            roundToDown(invoice.endPrice),
          mustPaid:
            math.sub(Number(invoice.endPrice), Number(invoice.paidAmount || 0)),
        })),
      ];
    }
    return [];
  };

  const handleTotalData =(invoices,forExcel=false) => {
    if (invoices.length > 0) {
      const totalEndPrices = invoices.reduce(
        (all, current) => math.add(all, Number(current.endPrice)),
        0
      );

      const totalPaidAmount = invoices.reduce(
        (all, current) => math.add(all, Number(current.paidAmount)),
        0
      );

      const paidInPercentage =
        (roundToDown(totalPaidAmount || 0) * 100) / totalEndPrices;

      const mustPaid = math.sub(Number(totalEndPrices), Number(totalPaidAmount));
      return forExcel?
      [...invoices,
        {
          isTotal: true,
          endPrice: totalEndPrices,
          paidAmount: totalPaidAmount,
          currencyCode: invoices[0].currencyCode,
          paidInPercentage,
          mustPaid,
        },
      ] :[
        {
          isTotal: true,
          endPrice: totalEndPrices,
          paidAmount: totalPaidAmount,
          currencyCode: invoices[0].currencyCode,
          paidInPercentage,
          mustPaid,
        },
      ];
    }
    return [];
  };

  useEffect(() => {
    if (row && row.contactId) {
      fetchSalesInvoiceList({ filters: {...filters, excludeZeroAmount: 1} });
    }
  }, [row, fetchSalesInvoiceList, filters]);

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (_, { isTotal }, index) => (isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Müqavilə',
      dataIndex: 'contractNo',
      ellipsis: true,
      width: 100,
      render: (value, { isTotal }) => (isTotal ? '' : value || '-'),
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      width: 120,
      render: (value, { isTotal }) => (isTotal ? '' : value || '-'),
    },
    {
      title: 'Tarix',
      dataIndex: 'operationDate',
      width: 120,
      render: (value, { isTotal }) => (isTotal ? '' : value || '-'),
    },
    {
      title: 'Statusu',
      dataIndex: 'paymentStatus',
      width: 120,
      excelRender: paymentStatus =>
        paymentStatus === 1
          ? 'Açıq'
          : paymentStatus === 2
          ? 'Qismən Ödənilib'
          : 'Ödənilib',
      render: (value, { isTotal, endPrice }) =>
        isTotal ? '' : (value === 3 && Number(endPrice) === 0) ? '-' : <WhatIsThis status={value} />,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'endPrice',
      width: 120,
      align: 'right',
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode}`,
    },
    {
      title: 'Ödənilib',
      dataIndex: 'paidAmount',
      width: 120,
      align: 'right',
      excelRender: ({ paidAmount, paidTaxAmount }) => {
        const data = paidAmount
          ? parseFloat(paidAmount).toFixed(2)
          : paidTaxAmount
          ? parseFloat(paidTaxAmount).toFixed(2)
          : null;
        return data === null ? '' : data;
      },
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(
          defaultNumberFormat(value || 0)
        )} ${currencyCode}`,
    },
    {
      title: 'Ödənilib(%)',
      dataIndex: 'paidInPercentage',
      width: 100,
      align: 'right',
      render: value => `${formatNumberToLocale(defaultNumberFormat(value || 0))}%`,
    },
    {
      title: 'Ödənilməlidir',
      dataIndex: 'mustPaid',
      width: 120,
      align: 'right',
      excelRender: ({ amount, paidAmount, paidTaxAmount }) => {
        const data = paidAmount
          ? parseFloat(Number(amount) - Number(paidAmount)).toFixed(2)
          : paidTaxAmount
          ? parseFloat(Number(amount) - Number(paidTaxAmount)).toFixed(2)
          : null;
        return data || '';
      },
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode}`,
    },
    {
      title: '',
      dataIndex: 'id',
      width: 80,
      align: 'right',
      render: (id, row) =>
        row.isTotal ? null : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={
              row.paymentStatus === 3 || isPaymentDisabled
                ? styles.paymentDisabled
                : styles.paymentActive
            }
          >
            <Payment
              className={`${styles.documentIcon} ${
                row.paymentStatus === 3 || isPaymentDisabled
                  ? styles.disable
                  : null
              }`}
              onClick={() =>
                row.paymentStatus === 3 || isPaymentDisabled
                  ? null
                  : history.push(
                      `/finance/operations/add?id=${row.id}&isVat=${false}`
                    )
              }
            />
            <RecievablesInvoiceAction row={row} type={type} invoiceId={id} />
          </div>
        ),
    },
  ];

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
    
    columns[columnClone.indexOf('paymentStatus')] = {
      title: 'Statusu',
      width: { wpx: 200 },
    };
  
    columns[columnClone.indexOf('endPrice')] = {
      title: `Məbləğ`,
      width: { wpx: 150 },
    };
  
    columns[columnClone.indexOf('paidAmount')] = {
      title: `Ödənilib`,
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('paidInPercentage')] = {
      title: 'Ödənilib(%)',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('mustPaid')] = {
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
    columnClone.includes('contractNo') && (arr[columnClone.indexOf('contractNo')] =item.isTotal?{value:'',style:columnFooterStyle}:{ value: item.contractNo|| '-', })
    columnClone.includes('invoiceNumber') &&(arr[columnClone.indexOf('invoiceNumber')] =item.isTotal?{value:'',style:columnFooterStyle}:{ value: item.invoiceNumber|| '-', })
    columnClone.includes('operationDate') &&(arr[columnClone.indexOf('operationDate')] =item.isTotal?{value:'',style:columnFooterStyle}:{ value: item.operationDate|| '-', })
    columnClone.includes('paymentStatus') &&(arr[columnClone.indexOf('paymentStatus')] =item.isTotal?{value:'',style:columnFooterStyle}:{ value:  item.paymentStatus === 1? 'Açıq': item.paymentStatus === 2? 'Qismən Ödənilib': 'Ödənilib'|| '-', })
    columnClone.includes('endPrice') &&(arr[columnClone.indexOf('endPrice')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.endPrice))} ${item.currencyCode}`|| '-',style:item.isTotal?columnFooterStyle:'' })
    columnClone.includes('paidAmount') &&(arr[columnClone.indexOf('paidAmount')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.paidAmount))} ${item.currencyCode}`|| '-',style:item.isTotal?columnFooterStyle:'' })
    columnClone.includes('paidInPercentage') &&(arr[columnClone.indexOf('paidInPercentage')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.paidInPercentage||0))} %`|| '-',style:item.isTotal?columnFooterStyle:'' })
    columnClone.includes('mustPaid') &&(arr[columnClone.indexOf('mustPaid')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.mustPaid))} ${item.currencyCode}`|| '-',style:item.isTotal?columnFooterStyle:'' })
     
    
     arr.unshift(item.isTotal?{value:'Toplam:',style:columnFooterStyle}:{ value: index + 1, })
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
    <div
      ref={componentRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div
        id="recievablesActionDropDown"
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div className={styles.exportBox}>
          <div className={styles.columnDetailItem}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 24,
                lineHeight: '24px',
                marginBottom: 10,
                color: '#373737',
              }}
            >
              {type === 'payables' ? 'Kreditor' : 'Debitor'} Qaimə
            </label>

            <span
              style={{
                fontSize: 18,
                lineHeight: '16px',

                color: '#CBCBCB',
              }}
            >
              {row.contactFullName}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>

        <ExportToExcel
         getExportData={
         () => setExSalesInvoiceList(handleTotalData(handleData(invoices),true))}
         data={excelData}
         columns={excelColumns}
         excelTitle={`${type === 'payables' ? 'Kreditor Qaimə' : 'Debitor Qaimə' } - ${row.contactFullName}`}
         excelName={type === 'payables' ? 'Kreditor Qaimə' : 'Debitor Qaimə' }
         filename={type === 'payables' ? 'Kreditor Qaimə' : 'Debitor Qaimə'}
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
          scroll={{ x: 'max-content',y:500 }}
          dataSource={handleData(invoices)}
          loading={isLoading}
          className={styles.invoiceTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
        {invoices.length > 0 && (
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={handleTotalData(invoices)}
            loading={isLoading}
            className={styles.totalTable}
            columns={columns}
            pagination={false}
            rowKey={record => record.id}
            rowClassName={styles.row}
          />
        )}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  invoices: state.salesAndBuysReducer.invoices,
  isLoading: state.salesAndBuysReducer.isLoading,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  { fetchSalesInvoiceList }
)(RecievablesDetails);
