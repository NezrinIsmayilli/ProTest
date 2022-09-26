import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Col } from 'antd';
import { ProModal, Table, ProButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import math from 'exact-math';
import WritingOffInvoiceAction from '../Details/writingOffInvoiceAction';

import styles from './styles.module.scss';

export const WritingOffInvoices = props => {
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
      const amountInMainCurrency = data.reduce(
        (total, current) =>
          math.add(Number(total), Number(current.amountInMainCurrency)),
        0
      );
      invoices = [
        ...data,
        {
          summaryRow: true,
          amountInMainCurrency,
        },
      ];
    }
    return invoices;
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 90,
      render: (value, row, index) => (row.summaryRow ? 'Toplam' : index + 1),
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
      title: 'Məbləğ',
      dataIndex: 'amount',
      width: 130,
      align: 'right',
      render: (value, { summaryRow }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(defaultNumberFormat(value))} ${
              mainCurrency?.code
            } `,
    },
    {
      title: `Məbləğ (${mainCurrency?.code})`,
      dataIndex: 'amountInMainCurrency',
      width: 200,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        } `,
    },
    {
      title: 'Satış meneceri',
      dataIndex: 'salesmanLastName',
      width: 150,
      align: 'left',
      render: (value, { salesmanName, summaryRow }) =>
        summaryRow ? '' : `${salesmanName} ${value}`,
    },
    {
      title: 'Seç',
      align: 'center',
      width: 80,
      render: (value, row) =>
        row.summaryRow ? null : <WritingOffInvoiceAction row={row} />,
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
