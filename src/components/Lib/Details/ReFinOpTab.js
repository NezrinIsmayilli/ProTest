import React, { useRef } from 'react';
import { Button, Table, Tooltip } from 'antd';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    exportTableToExcel,
} from 'utils';
import { CustomTag } from 'components/Lib';
import { MdInfo } from 'react-icons/md';
import { fetchOperationsList } from 'store/actions/finance/operations';
import { connect } from 'react-redux';
import OpFinOpInvoiceTableAction from 'containers/SalesBuys/Operations/operationDetails/opFinOpInvoiceTableAction';
import styles from './styles.module.scss';

const math = require('exact-math');

function ReFinOpTab({
    operationsList,
    isLoading,
    mainCurrency,
    invoiceNumber,
    contractNo,
    restInvoiceData,
    forImport,
}) {
    const componentRef = useRef();

    const getColumns = data => {
        const columns = [
            {
                title: '№',
                dataIndex: 'id',
                width: 60,
                render: (value, row, index) => index + 1,
            },
            {
                title: 'Tarix',
                dataIndex: 'dateOfTransaction',
                width: 200,
            },
            {
                title: 'Sənəd',
                dataIndex: 'documentNumber',
                width: 200,
            },
            {
                title: 'Məbləğ',
                dataIndex: 'amount',
                width: 130,
                align: 'right',
                render: (amount, { currencyCode }) =>
                    `${formatNumberToLocale(
                        defaultNumberFormat(amount)
                    )} ${currencyCode}`,
            },
            {
                title: `Məbləğ (${mainCurrency?.code})`,
                dataIndex: 'amountConvertedToMainCurrency',
                width: 220,
                align: 'right',
                render: (amount, row) =>
                    `${formatNumberToLocale(
                        defaultNumberFormat(
                            mainCurrency?.code === row.invoiceCurrencyCode
                                ? row.invoicePaymentAmountConvertedToInvoiceCurrency
                                : amount
                        )
                    )} ${mainCurrency?.code}`,
            },
            {
                title: 'Ödəniş növü',
                dataIndex: 'paymentTypeName',
                width: 160,
                align: 'right',
            },
            {
                title: 'Əlavə məlumat',
                dataIndex: 'description',
                align: 'left',
                width: 120,
                notUseRenderExcel: true,
                ellipsis: {
                    showTitle: false,
                },
                render: info => (
                    <Tooltip placement="left" title={info}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {info !== null && (
                                <MdInfo
                                    style={{
                                        color: '#464A4B',
                                        position: 'absolute',
                                        left: 0,
                                    }}
                                    size={20}
                                />
                            )}
                            <p style={{ paddingLeft: 28, marginBottom: 0 }}>
                                {info}
                            </p>
                        </div>
                    </Tooltip>
                ),
            },
        ];
        if (forImport) {
            columns.push({
                title: '',
                dataIndex: 'id',
                width: 64,
                align: 'right',
                render: (id, row) => (
                    <OpFinOpInvoiceTableAction row={row} productId={id} />
                ),
            });
        }

        return columns;
    };

    const getStatusLabel = invoiceType =>
        invoiceType === 1
            ? 'Açıq'
            : invoiceType === 2
            ? 'Qismən ödənilib'
            : 'Ödənilib';

    return (
        <div
            ref={componentRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 6,
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
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
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
                            Maliyyə əməliyyatları
                        </label>
                    </div>
                    <div
                        className={styles.columnDetailItem}
                        style={{ marginLeft: 30 }}
                    >
                        <label style={{ marginBottom: 12 }}>Müqavilə</label>
                        <span>{contractNo || '-'}</span>
                    </div>
                    <div
                        className={styles.columnDetailItem}
                        style={{ marginLeft: 24 }}
                    >
                        <label style={{ marginBottom: 12 }}>Qaimə</label>
                        <span>{invoiceNumber}</span>
                    </div>
                    {forImport ? (
                        <>
                            <div
                                className={styles.columnDetailItem}
                                style={{ marginLeft: 24 }}
                            >
                                <label style={{ marginBottom: 12 }}>
                                    Tarix
                                </label>
                                <span>
                                    {restInvoiceData &&
                                    restInvoiceData.operationDate
                                        ? restInvoiceData.operationDate
                                        : '-'}
                                </span>
                            </div>
                            <div
                                className={styles.columnDetailItem}
                                style={{ marginLeft: 24 }}
                            >
                                <label style={{ marginBottom: 12 }}>
                                    Qalıq
                                </label>
                                <span>
                                    {restInvoiceData
                                        ? Number(restInvoiceData.taxAmount) !==
                                              0 ||
                                          Number(
                                              restInvoiceData.taxPercentage
                                          ) !== 0
                                            ? formatNumberToLocale(
                                                  defaultNumberFormat(
                                                      math.sub(
                                                          Number(
                                                              restInvoiceData.taxAmount
                                                          ) || 0,
                                                          Number(
                                                              restInvoiceData.paidTaxAmount
                                                          ) || 0
                                                      )
                                                  )
                                              )
                                            : formatNumberToLocale(
                                                  defaultNumberFormat(
                                                      math.sub(
                                                          Number(
                                                              restInvoiceData.endPrice
                                                          ) || 0,
                                                          Number(
                                                              restInvoiceData.paidAmount
                                                          ) ||
                                                              Number(
                                                                  restInvoiceData.recieved
                                                              ) ||
                                                              0
                                                      )
                                                  )
                                              )
                                        : '-'}
                                </span>
                            </div>
                            <div
                                className={styles.columnDetailItem}
                                style={{ marginLeft: 24 }}
                            >
                                <label style={{ marginBottom: 12 }}>
                                    Status
                                </label>
                                <span>
                                    {restInvoiceData ? (
                                        <CustomTag
                                            label={getStatusLabel(
                                                restInvoiceData.expenseInvoicePaymentStatus
                                            )}
                                        />
                                    ) : (
                                        '-'
                                    )}
                                </span>
                            </div>
                        </>
                    ) : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* <ReactToPrint
            trigger={() => (
              <Button
                className={styles.customSquareButton}
                style={{ marginRight: 10 }}
                shape="circle"
                icon="printer"
              />
            )}
            content={() => componentRef.current}
          /> */}

                    <Button
                        disabled={operationsList.length === 0}
                        onClick={() =>
                            exportTableToExcel(
                                getColumns(operationsList),
                                operationsList,
                                {
                                    sheetName: 'recievables',
                                }
                            )
                        }
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
                    paddingRight: 24,
                    overflowY: 'auto',
                    marginRight: -16,
                }}
            >
                <Table
                    scroll={{ x: 'max-content' }}
                    dataSource={operationsList}
                    className={styles.invoiceTable}
                    loading={isLoading}
                    columns={getColumns(operationsList)}
                    pagination={false}
                    rowKey={record => record.id}
                    rowClassName={styles.row}
                />
            </div>
            <table className={styles.recivedTableFooter}>
                <tr>
                    <td width={72} style={{ paddingLeft: 0 }}>
                        Toplam
                    </td>
                    <td width={130} />
                    <td width={155} />
                    <td width={180} align="right">
                        {`${formatNumberToLocale(
                            defaultNumberFormat(
                                operationsList.reduce(
                                    (
                                        total,
                                        {
                                            amountConvertedToMainCurrency,
                                            invoicePaymentAmountConvertedToInvoiceCurrency,
                                            invoiceCurrencyCode,
                                        }
                                    ) =>
                                        total +
                                        Number(
                                            mainCurrency?.code ===
                                                invoiceCurrencyCode
                                                ? invoicePaymentAmountConvertedToInvoiceCurrency
                                                : amountConvertedToMainCurrency
                                        ),
                                    0
                                )
                            )
                        )}
            ${mainCurrency?.code}`}
                    </td>
                    <td width={153} align="center" />
                    <td width={100} align="center" />
                </tr>
            </table>
        </div>
    );
}

const mapStateToProps = state => ({
    isLoading: state.financeOperationsReducer.isLoading,
    mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
    mapStateToProps,
    { fetchOperationsList }
)(ReFinOpTab);
