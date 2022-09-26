import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { ProCollapse, ProPanel, CustomTag } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import RecievablesInvoiceAction from 'components/Lib/Details/RecievablesInvoiceAction';
import styles from './styles.module.scss';
import FooterRow from './FooterRow';

const math = require('exact-math');

const HeaderItem = ({ gutterBottom = true, name, secondary, children }) => (
    <div className={styles.columnDetailItem} style={{ marginLeft: 56 }}>
        <label
            style={{
                marginBottom: gutterBottom ? 12 : 0,
            }}
        >
            {name}
        </label>

        {secondary ? <span>{secondary}</span> : children}
    </div>
);

function Expenses(props) {
    const componentRef = useRef();
    const {
        details,
        data,
        row,
        tenant,
        total,
        rate,
        importExpense,
        rates,
        expenseRates,
    } = props;

    const {
        invoiceType,
        counterparty,
        invoiceNumber,
        currencyCode,
        endPrice,
    } = details;

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
            width: 80,
        },
        {
            title: 'Tarix',
            dataIndex: 'dateOfTransaction',
            key: 'dateOfTransaction',
            width: 100,
        },
        {
            title: 'Sənəd',
            dataIndex: 'documentNumber',
            align: 'left',
            width: 120,
        },
        {
            title: 'Xərc mərkəzi',
            dataIndex: 'contractNo',
            align: 'left',
            width: 120,
            render: (value, row) => (row.isTotal ? null : value || tenant.name),
        },
        {
            title: 'Xərc maddəsi',
            dataIndex: 'transactionCatalogName',
            align: 'left',
            width: 120,
        },
        {
            title: 'Xərcin adı',
            dataIndex: 'transactionItemName',
            align: 'left',
            width: 120,
        },
        {
            title: 'Məbləğ',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            width: 100,
            render: (value, row) =>
                row.isTotal
                    ? null
                    : `${formatNumberToLocale(defaultNumberFormat(value))} ${
                          row.currencyCode
                      }`,
        },

        {
            title: `Məbləğ (${currencyCode})`,
            dataIndex: 'amount',
            key: 'amountConvertedToMainCurrency',
            render: (value, row) =>
                row.isTotal
                    ? `${formatNumberToLocale(
                          defaultNumberFormat(value || 0)
                      )} ${currencyCode}`
                    : `${formatNumberToLocale(
                          defaultNumberFormat(
                              math.mul(Number(value || 0), Number(rate))
                          )
                      )} ${currencyCode}`,
            align: 'right',
            width: 160,
        },
        {
            title: 'Əməliyyat növü',
            dataIndex: 'paymentTypeName',
            align: 'left',
            width: 120,
        },
    ];

    const invoiceColumns = [
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 80,
            render: (_, row, index) => (row.isTotal ? 'Toplam' : index + 1),
        },
        {
            title: 'Tarix',
            dataIndex: 'date',
            width: 150,
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Qarşı tərəf',
            dataIndex: 'expenseInvoiceContact',
            ellipsis: true,
            width: 120,
            align: 'left',
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Qaimə',
            dataIndex: 'expenseInvoiceNumber',
            width: 100,
            align: 'left',
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Müqavilə',
            dataIndex: 'contractNo',
            width: 100,
            align: 'left',
            render: (value, row) => (row.isTotal ? null : value || '-'),
        },
        {
            title: 'Status',
            dataIndex: 'expenseInvoicePaymentStatus',
            align: 'center',
            width: 130,
            render: (value, row) =>
                row.isTotal ? null : (
                    <CustomTag label={getStatusLabel(value)} />
                ),
        },
        {
            title: 'Məbləğ',
            dataIndex: 'expenseInvoiceAmount',
            width: 150,
            align: 'center',
            render: (value, row) =>
                row.isTotal
                    ? null
                    : `${formatNumberToLocale(defaultNumberFormat(value))} ${
                          row?.currencyCode
                      }`,
        },
        {
            title: 'Tədbiq olunan qiymət',
            dataIndex: 'price',
            width: 150,
            align: 'center',
            render: (value, row, index) =>
                row.isTotal
                    ? null
                    : formatNumberToLocale(defaultNumberFormat(value)),
        },
        {
            title: `Məbləğ (${currencyCode})`,
            dataIndex: 'amount',
            width: 150,
            align: 'center',
            render: (value, row) =>
                row.isTotal
                    ? formatNumberToLocale(defaultNumberFormat(value))
                    : formatNumberToLocale(
                          defaultNumberFormat(
                              math.mul(
                                  Number(
                                      rates[
                                          [
                                              ...new Set(
                                                  importExpense.map(
                                                      ({ currencyId }) =>
                                                          Number(currencyId)
                                                  )
                                              ),
                                          ].indexOf(row.currencyId)
                                      ]?.rate || 1
                                  ),
                                  Number(value)
                              ) || 0
                          )
                      ),
        },
        {
            title: 'Seç',
            dataIndex: 'expenseInvoiceId',
            key: 'trashIcon',
            align: 'center',
            width: 80,
            render: (value, row) =>
                row?.isTotal ? null : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RecievablesInvoiceAction
                            row={row}
                            invoiceId={value}
                            forImport
                        />
                    </div>
                ),
        },
    ];

    const withoutDocColumns = [
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 50,
            render: (_, row, index) => (row.isTotal ? 'Toplam' : index + 1),
        },
        {
            title: 'Tarix',
            dataIndex: 'date',
            width: 130,
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Xərcin adı',
            dataIndex: 'name',
            ellipsis: true,
            width: 120,
            align: 'left',
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Valyuta',
            dataIndex: 'currencyCode',
            width: 100,
            align: 'left',
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Məbləğ',
            dataIndex: 'amount',
            width: 150,
            align: 'center',
            render: (value, row) =>
                row.isTotal
                    ? null
                    : formatNumberToLocale(defaultNumberFormat(value)),
        },
        {
            title: `Məbləğ (${currencyCode})`,
            dataIndex: 'amount',
            width: 150,
            align: 'center',
            render: (value, row) =>
                row.isTotal
                    ? formatNumberToLocale(defaultNumberFormat(value))
                    : formatNumberToLocale(
                          defaultNumberFormat(
                              math.mul(
                                  Number(
                                      rates[
                                          [
                                              ...new Set(
                                                  importExpense.map(
                                                      ({ currencyId }) =>
                                                          Number(currencyId)
                                                  )
                                              ),
                                          ].indexOf(row.currencyId)
                                      ]?.rate || 1
                                  ),
                                  Number(value)
                              ) || 0
                          )
                      ),
        },
    ];

    function addTotals(data) {
        if (data.length > 0) {
            const total = roundToDown(
                data.reduce(
                    (total, { price, currencyId }) =>
                        math.add(
                            total,
                            Number(
                                math.mul(
                                    Number(
                                        rates[
                                            [
                                                ...new Set(
                                                    importExpense.map(
                                                        ({ currencyId }) =>
                                                            Number(currencyId)
                                                    )
                                                ),
                                            ].indexOf(currencyId)
                                        ]?.rate || 1
                                    ),
                                    Number(price || 0)
                                )
                            ) || 0
                        ),
                    0
                )
            );

            return [
                ...data,
                {
                    isTotal: true,
                    amount: total,
                },
            ];
        }
        return [];
    }

    function addExpenseTotals(data) {
        if (data?.length > 0) {
            const total = roundToDown(
                data.reduce(
                    (total, { amount, currencyId }) =>
                        math.add(
                            total,
                            Number(
                                math.mul(
                                    Number(
                                        expenseRates[
                                            [
                                                ...new Set(
                                                    data.map(({ currencyId }) =>
                                                        Number(currencyId)
                                                    )
                                                ),
                                            ].indexOf(currencyId)
                                        ]?.rate || 1
                                    ),
                                    Number(amount || 0)
                                )
                            ) || 0
                        ),
                    0
                )
            );

            return [
                ...data,
                {
                    id: 'Toplam',
                    dateOfTransaction: '',
                    documentNumber: '',
                    transactionCatalogName: '',
                    transactionItemName: '',
                    paymentTypeName: '',
                    isTotal: true,
                    amount: total,
                },
            ];
        }
        return [];
    }

    return (
        <div
            id="recievablesActionDropDown"
            style={{ width: '100%' }}
            ref={componentRef}
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
                            {counterparty}
                        </label>

                        <span
                            style={{
                                fontSize: 18,
                                lineHeight: '16px',

                                color: '#CBCBCB',
                            }}
                        >
                            {invoiceType === 1
                                ? 'Alış'
                                : invoiceType === 2
                                ? 'Satış'
                                : invoiceType === 3
                                ? 'Geri alma'
                                : invoiceType === 4
                                ? 'Geri qaytarma'
                                : invoiceType === 5
                                ? 'Transfer'
                                : invoiceType === 6
                                ? 'Silinmə'
                                : invoiceType === 10
                                ? 'İdxal alışı'
                                : 'Qaralama'}
                        </span>
                    </div>
                    <HeaderItem
                        name="Qaimə"
                        secondary={
                            row.isVat
                                ? `${invoiceNumber} (VAT)` || '-'
                                : invoiceNumber || '-'
                        }
                    />
                    <HeaderItem
                        name="Qaimə məbləği"
                        secondary={`${formatNumberToLocale(
                            defaultNumberFormat(endPrice)
                        )} ${currencyCode}`}
                    />
                </div>
            </div>
            <ProCollapse
                className={styles.customCollapse}
                style={{ border: 'none', marginTop: '20px' }}
                defaultActiveKey="1"
            >
                <ProPanel
                    header={
                        <div
                            style={{
                                fontWeight: 'bold',
                                fontSize: '22px',
                            }}
                        >
                            Hesablar üzrə ödənişlər
                        </div>
                    }
                    key="1"
                    style={{ paddingTop: '10px' }}
                >
                    <div className={styles.parentBox}>
                        <Table
                            scroll={{ x: 'max-content' }}
                            dataSource={addExpenseTotals(data)}
                            className={styles.invoiceTable}
                            columns={columns}
                            pagination={false}
                            rowKey={record => record.id}
                            rowClassName={styles.row}
                        />
                    </div>
                </ProPanel>

                <ProPanel
                    header={
                        <div
                            style={{
                                fontWeight: 'bold',
                                fontSize: '22px',
                            }}
                        >
                            Qaimə üzrə ödənişlər
                        </div>
                    }
                    key="2"
                    style={{ paddingTop: '10px' }}
                >
                    <div className={styles.parentBox}>
                        <Table
                            scroll={{ x: 'max-content' }}
                            dataSource={addTotals(
                                importExpense?.filter(
                                    ({ expenseInvoiceId }) =>
                                        expenseInvoiceId !== null
                                )
                            )}
                            className={styles.invoiceTable}
                            columns={invoiceColumns}
                            pagination={false}
                            rowKey={record => record.id}
                            rowClassName={styles.row}
                        />
                    </div>
                </ProPanel>
                <ProPanel
                    header={
                        <div
                            style={{
                                fontWeight: 'bold',
                                fontSize: '22px',
                            }}
                        >
                            Sənədsiz ödənişlər
                        </div>
                    }
                    key="3"
                    style={{ paddingTop: '10px' }}
                >
                    <div className={styles.parentBox}>
                        <Table
                            scroll={{ x: 'max-content' }}
                            dataSource={addTotals(
                                importExpense?.filter(
                                    ({ expenseInvoiceId }) =>
                                        expenseInvoiceId === null
                                )
                            )}
                            className={styles.invoiceTable}
                            columns={withoutDocColumns}
                            pagination={false}
                            rowKey={record => record.id}
                            rowClassName={styles.row}
                        />
                    </div>
                </ProPanel>
            </ProCollapse>

            <FooterRow
                primary="Əlavə xərc:"
                secondary={`${formatNumberToLocale(
                    defaultNumberFormat(total)
                )} ${currencyCode}`}
            />
            <FooterRow
                primary="Əlavə xərc(%):"
                secondary={
                    endPrice
                        ? `${formatNumberToLocale(
                              defaultNumberFormat(
                                  math.div(
                                      math.mul(Number(total || 0), 100),
                                      Number(endPrice)
                                  )
                              )
                          )}%`
                        : '0%'
                }
            />
        </div>
    );
}

const mapStateToProps = state => ({});

export default connect(
    mapStateToProps,
    {}
)(Expenses);
