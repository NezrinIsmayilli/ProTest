import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Col } from 'antd';
import { CustomTag, ProModal, Table, ProButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import math from 'exact-math';
import RecievablesInvoiceAction from 'components/Lib/Details/RecievablesInvoiceAction';
import styles from './styles.module.scss';

export const InvoicesWithPaymentStatus = props => {
  const {
    data,
    visible,
    mainCurrency,
    title,
    subTitle,
    dataLoading,
    toggleModal,
  } = props;
  const componentRef = useRef();

  const getInvoiceList = data => {
    let invoices = [];

    if (data.length > 0) {
      const endPriceInMainCurrency = data.reduce(
        (total, current) =>
          math.add(Number(total), Number(current.endPriceInMainCurrency)),
        0
      );
      invoices = [
        ...data,
        {
          summaryRow: true,
          endPriceInMainCurrency,
        },
      ];
    }
    return invoices;
  };
  const getStatusLabel = (invoiceType, endPrice) =>
    invoiceType === 1
      ? 'Açıq'
      : invoiceType === 2
      ? 'Qismən ödənilib'
      : invoiceType === 3 && Number(endPrice) > 0
      ? 'Ödənilib'
      : '-';

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 90,
      render: (value, row, index) => (row.summaryRow ? 'Toplam' : index + 1),
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'counterparty',
      ellipsis: true,
      width: 150,
      align: 'center',
      render: (value, row) => (row.summaryRow ? '' : value || '-'),
    },
    {
      title: 'Müqavilə',
      dataIndex: 'contractNo',
      width: 150,
      align: 'center',
      render: (value, row) => (row.summaryRow ? '' : value || '-'),
    },
    {
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      width: 150,
      align: 'left',
      render: (value, row) => (row.summaryRow ? '' : `${value}`),
    },
    {
      title: 'Tarix',
      dataIndex: 'operationDate',
      width: 150,
      align: 'left',
      render: (value, row) => (row.summaryRow ? '' : value),
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      width: 120,
      align: 'left',
      render: (value, row) =>
        row.summaryRow ? '' : value === 3 && Number(row.endPrice) === 0? '-':<CustomTag label={getStatusLabel(value, row.endPrice)} />,
    },
    {
      title: 'Məbləğ',
      dataIndex: 'endPrice',
      width: 150,
      align: 'right',
      render: (value, { currencyCode, summaryRow }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${currencyCode} `,
    },
    {
      title: `Məbləğ (${mainCurrency?.code})`,
      dataIndex: 'endPriceInMainCurrency',
      width: 200,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        } `,
    },
    {
      title: 'Ödənilib',
      dataIndex: 'paidAmount',
      width: 150,
      align: 'right',
      render: (value, { summaryRow, currencyCode }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${currencyCode}`,
    },
    {
      title: 'Ödənilib(%)',
      dataIndex: 'endPrice',
      width: 150,
      key: 'paidInPercentage',
      align: 'center',
      render: (value, { summaryRow, paidAmount }) =>
        summaryRow
          ? '' : Number(value || 0) ?
           `${formatNumberToLocale(
              defaultNumberFormat(
                math.div(
                  math.mul(Number(paidAmount || 0), 100),
                  Number(value || 0)
                )
              )
            )}%` : '0.00%',
    },
    {
      title: 'Ödənilməlidir',
      dataIndex: 'endPrice',
      width: 150,
      key: 'toBePaid',
      align: 'right',
      render: (value, { summaryRow, paidAmount, currencyCode }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(
                math.sub(Number(value || 0), Number(paidAmount || 0))
              )
            )} ${currencyCode}`,
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 80,
      align: 'right',
      render: (id, row) =>
        row.summaryRow ? null : (
          <RecievablesInvoiceAction row={row} invoiceId={id} />
        ),
    },
    // {
    //   title: 'Seç',
    //   align: 'center',
    //   width: 60,
    //   render: (value, row) =>
    //     row.summaryRow ? null : (
    //       <ProDots>
    //         <ProDotsItem
    //           label="Ödəniş et"
    //           icon="info"
    //           onClick={() =>
    //             history.push(
    //               `/finance/operations/add?id=${value}&isVat=${row.isVat}`
    //             )
    //           }
    //         />
    //         <ProDotsItem
    //           label="Ödəniş et"
    //           icon="info"
    //           onClick={() =>
    //             history.push(
    //               `/finance/operations/add?id=${value}&isVat=${row.isVat}`
    //             )
    //           }
    //         />
    //       </ProDots>
    //     ),
    // },
  ];

  return (
    <ProModal
      maskClosable
      width={1300}
      centered
      padding
      isVisible={visible}
      handleModal={toggleModal}
    >
      <div className={styles.OperationsModal} ref={componentRef}>
        {/* <TransactionModal
          visible={transactionModalIsVisible}
          setIsVisible={setTransactionModalIsVisible}
          data={selectedRow}
          type={transactionType}
          setType={setTransactionType}
        /> */}
        <Col span={12}>
          <div
            id="recievablesActionDropDown"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <label className={styles.title}>{title}</label>
            <label className={styles.subTitle}>{subTitle}</label>
          </div>
        </Col>
        <Col span={6} offset={6} align="end">
          <ReactToPrint
            trigger={() => (
              <ProButton
                className={styles.customSquareButton}
                shape="circle"
                icon="printer"
              />
            )}
            content={() => componentRef.current}
          />
        </Col>
        <Table
          dataSource={getInvoiceList(data)}
          loading={dataLoading}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content', y: 500 }}
          rowKey={record => record.id}
        />
      </div>
    </ProModal>
  );
};
