/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Col } from 'antd';
import { Table, ProButton } from 'components/Lib';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import math from 'exact-math';
import OpFinOpInvoiceTableAction from '../Details/opFinOpInvoiceTableAction';
import styles from './styles.module.scss';

export const Expenses = props => {
    const { title, subTitle, mainCurrency, data, dataLoading, tenant } = props;

    const componentRef = useRef();

    const getExpenses = data => {
        let expenses = [];

        if (data.length > 0) {
            const amountConvertedToMainCurrency = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.amountConvertedToMainCurrency)
                    ),
                0
            );
            expenses = [
                ...data,
                {
                    summaryRow: true,
                    amountConvertedToMainCurrency,
                },
            ];
        }
        return expenses;
    };

    const columns = [
        {
            title: '№',
            width: 90,
            render: (val, row, index) =>
                row.summaryRow ? 'Toplam' : index + 1,
        },
        {
            title: 'Sənəd',
            width: 140,
            dataIndex: 'documentNumber',
        },
        {
            title: 'Tarix',
            dataIndex: 'dateOfTransaction',
            width: 140,
            key: 'dateOfTransaction',
        },
        {
            title: 'Qarşı tərəf',
            dataIndex: 'contactOrEmployee',
            width: 160,
            render: (value, row) =>
                row.summaryRow
                    ? ''
                    : row.transactionCatalogName !== null
                    ? `${row.employeeName} ${row.employeeSurname}`
                    : value,
        },
        {
            title: 'Xərc mərkəzi',
            dataIndex: 'contractNo',
            width: 140,
            render: (value, row) =>
                row.summaryRow
                    ? ''
                    : row.transactionTypes === 8 ||
                      row.transactionTypes === 9 ||
                      row.paymentInvoiceInvoiceNumber !== null
                    ? row.paymentInvoiceInvoiceNumber
                    : value || tenant.name,
        },
        {
            title: 'Xərc maddəsi',
            dataIndex: 'categoryName',
            width: 140,
            render: (value, row) =>
                row.summaryRow
                    ? ''
                    : row.transactionCatalogName !== null
                    ? row.transactionCatalogName
                    : value,
        },
        {
            title: 'Xərcin adı',
            dataIndex: 'subCategoryName',
            width: 140,
            render: (value, row) =>
                row.summaryRow
                    ? ''
                    : row.transactionCatalogName !== null
                    ? row.transactionItemName
                    : value,
        },
        {
            title: 'Məbləğ',
            dataIndex: 'amount',
            width: 160,
            align: 'right',
            render: (value, { summaryRow, currencyCode }) =>
                summaryRow
                    ? ''
                    : `${formatNumberToLocale(
                          defaultNumberFormat(value)
                      )} ${currencyCode}`,
        },
        {
            title: `Məbləğ (${mainCurrency?.code})`,
            dataIndex: 'amountConvertedToMainCurrency',
            width: 160,
            align: 'right',
            render: value =>
                ` ${formatNumberToLocale(defaultNumberFormat(value))} ${
                    mainCurrency?.code
                }`,
        },
        {
            title: 'Seç',
            align: 'center',
            width: 90,
            render: row =>
                row.summaryRow ? null : <OpFinOpInvoiceTableAction row={row} />,
        },
    ];

    return (
        <div style={{ width: '100%' }} ref={componentRef}>
            <div className={styles.exportBox}>
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
                <ReactToPrint
                    trigger={() => (
                        <ProButton
                            className={styles.customSquareButton}
                            style={{ marginRight: 10 }}
                            shape="circle"
                            icon="printer"
                        />
                    )}
                    content={() => componentRef.current}
                />
            </div>

            <Table
                scroll={{ x: 'max-content',y:500 }}
                dataSource={getExpenses(data)}
                loading={dataLoading}
                columns={columns}
                pagination={false}
                rowKey={record => record.id}
            />
        </div>
    );
};
