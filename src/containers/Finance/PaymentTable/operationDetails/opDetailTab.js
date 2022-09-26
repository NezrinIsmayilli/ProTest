import React, { useRef } from 'react';
import { Spin } from 'antd';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import moment from 'moment';
import styles from '../../../Warehouse/styles.module.scss';
import Detail from '../../../Warehouse/Products/detail';

const math = require('exact-math');

function OpDetailTab(props) {
    const {
        fromTable,
        row,
        details,
        isLoading,
        isDeletedForLog,
        allBusinessUnits,
        profile,
    } = props;
    const {
        operatorName,
        operatorLastname,
        createdAt,
        counterparty,
        invoiceNumber,
    } = details;
    const componentRef = useRef();

    const getTableStatusType = statusOfOperation => {
        if (statusOfOperation === 1 || isDeletedForLog) {
            return (
                <span
                    className={styles.chip}
                    style={{
                        color: '#F3B753',
                        background: '#FDF7EA',
                    }}
                >
                    Açıq
                </span>
            );
        }
        if (statusOfOperation === 2) {
            return (
                <span
                    style={{
                        color: '#B16FE4',
                        background: '#F6EEFC',
                    }}
                    className={styles.chip}
                >
                    Bağlı
                </span>
            );
        }
        return (
            <span
                style={{
                    color: '#C4C4C4',
                    background: '#F8F8F8',
                }}
                className={styles.chip}
            >
                Silinib
            </span>
        );
    };

    const getStatusType = statusOfOperation => {
        if (statusOfOperation === 1) {
            return (
                <span
                    className={styles.chip}
                    style={{
                        color: '#55AB80',
                        background: '#EBF5F0',
                    }}
                >
                    Bağlı
                </span>
            );
        }
        if (statusOfOperation === 2) {
            return (
                <span
                    style={{
                        color: '#c0392b',
                        background: '#F6EEFC',
                    }}
                    className={styles.chip}
                >
                    Gecikir
                </span>
            );
        }
        if (statusOfOperation === 3) {
            return (
                <span
                    style={{
                        color: '#4E9CDF',
                        background: '#EAF3FB',
                    }}
                    className={styles.chip}
                >
                    Qalır
                </span>
            );
        }
        return (
            <span
                style={{
                    color: '#d35400',
                    background: '#ffecdb',
                }}
                className={styles.chip}
            >
                Vaxtı çatıb
            </span>
        );
    };
    return (
        <div style={{ marginTop: 16, width: 'calc(100% + 32px)' }}>
            <div ref={componentRef} style={{ padding: 16 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 20,
                    }}
                >
                    <span className={styles.modalTitle}>{counterparty}</span>
                </div>

                <Spin spinning={isLoading}>
                    <ul className={styles.detailsList}>
                        {fromTable ? (
                            <>
                                <Detail
                                    primary="Əlavə olunub"
                                    secondary={`${operatorName ||
                                        '-'} ${operatorLastname || '-'}`}
                                />
                                <Detail
                                    primary="İcra tarixi"
                                    secondary={
                                        createdAt?.replace(
                                            /(\d{4})-(\d\d)-(\d\d)/,
                                            '$3-$2-$1'
                                        ) || '-'
                                    }
                                />
                                <Detail
                                    primary="İlkin ödəniş tarixi"
                                    secondary={
                                        row.startDate?.replace(
                                            /(\d{4})-(\d\d)-(\d\d)/,
                                            '$3-$2-$1'
                                        ) || '-'
                                    }
                                />
                                <Detail
                                    primary="Status"
                                    secondary={getTableStatusType(row?.status)}
                                />
                            </>
                        ) : null}
                        <Detail
                            primary="Qarşı tərəf"
                            secondary={counterparty || '-'}
                        />
                        <Detail
                            primary="Sənəd"
                            secondary={
                                `KC${moment(
                                    row.createdAt?.replace(
                                        /(\d\d)-(\d\d)-(\d{4})/,
                                        '$3'
                                    ),
                                    'YYYY'
                                ).format('YYYY')}/${row.serialNumber}` || '-'
                            }
                        />
                        <Detail
                            primary="Qaimə"
                            secondary={invoiceNumber || '-'}
                        />
                        {fromTable ? (
                            <>
                                <Detail
                                    primary="Qaimə üzrə qalıq"
                                    secondary={`${formatNumberToLocale(
                                        defaultNumberFormat(
                                            row?.initialInvoiceAmount
                                        )
                                    )} ${row.invoiceTenantCurrencyCode}`}
                                />
                                <Detail
                                    primary="Kredit növü"
                                    secondary={row?.creditTypeName || 'Sərbəst'}
                                />
                                <Detail
                                    primary="Müddət (Ay) / Dəfə"
                                    secondary={row.numberOfMonths}
                                />
                            </>
                        ) : null}
                        <Detail
                            primary="Kredit məbləği"
                            secondary={`${formatNumberToLocale(
                                defaultNumberFormat(row.totalInvoiceAmount)
                            )} ${row.invoiceTenantCurrencyCode}`}
                        />
                        {!fromTable ? (
                            <Detail
                                primary="Sənəd üzrə qalıq"
                                secondary={`${formatNumberToLocale(
                                    defaultNumberFormat(row.remainingAmount)
                                )} ${row.invoiceTenantCurrencyCode}`}
                            />
                        ) : null}
                        <Detail
                            primary={
                                fromTable ? 'Aylıq ödəniş' : 'Ödəniş məbləği'
                            }
                            secondary={`${formatNumberToLocale(
                                defaultNumberFormat(
                                    fromTable
                                        ? row.monthlyPaymentAmount
                                        : row.totalMonthlyPaymentAmount
                                )
                            )} ${row.invoiceTenantCurrencyCode}`}
                        />
                        <Detail
                            primary="Ödənilib"
                            secondary={`${formatNumberToLocale(
                                defaultNumberFormat(
                                    fromTable
                                        ? row.totalPaidAmount
                                        : math.sub(
                                              Number(
                                                  row.totalMonthlyPaymentAmount ||
                                                      0
                                              ),
                                              Number(
                                                  row.monthlyPaymentAmount || 0
                                              )
                                          )
                                )
                            )} ${row.invoiceTenantCurrencyCode}`}
                        />
                        {fromTable ? (
                            <Detail
                                primary="Ödənilib (%)"
                                secondary={`${formatNumberToLocale(
                                    defaultNumberFormat(
                                        math.mul(
                                            math.div(
                                                Number(
                                                    row.totalPaidAmount || 0
                                                ),
                                                Number(
                                                    row.totalInvoiceAmount || 1
                                                )
                                            ),
                                            100
                                        )
                                    )
                                )} %`}
                            />
                        ) : null}
                        <Detail
                            primary="Ödənilməlidir"
                            secondary={`${formatNumberToLocale(
                                defaultNumberFormat(
                                    fromTable
                                        ? row.remainingAmount
                                        : row.monthlyPaymentAmount
                                )
                            )} ${row.invoiceTenantCurrencyCode}`}
                        />
                        {!fromTable ? (
                            <>
                                <Detail
                                    primary="Müddət (Ay/Dəfə)"
                                    secondary={row.numberOfMonths}
                                />
                                <Detail
                                    primary="Ödəniş tarixi"
                                    secondary={row.date}
                                />
                                <Detail
                                    primary="Gecikmə, gün"
                                    secondary={row.latenessDays}
                                />
                                <Detail
                                    primary="Status"
                                    secondary={getStatusType(row?.status)}
                                />
                            </>
                        ) : null}
                        {fromTable && row.status === 3 && !isDeletedForLog && (
                            <>
                                <Detail
                                    primary="Silən tərəf"
                                    secondary={`${row?.deletedByName} ${row?.deletedByLastName}`}
                                />
                                <Detail
                                    primary="Silinmə tarixi"
                                    secondary={row?.deletedAt}
                                />
                                <Detail
                                    primary="Silinmə səbəbi"
                                    secondary={row?.deletionReason}
                                />
                            </>
                        )}
                    </ul>
                </Spin>
            </div>
        </div>
    );
}

export default OpDetailTab;
