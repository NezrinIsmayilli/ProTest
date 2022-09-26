import React, { useRef } from 'react';
import { Spin } from 'antd';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import moment from 'moment';
import Detail from 'containers/Warehouse/Products/detail';
import styles from '../styles.module.scss';

const math = require('exact-math');

function MoreDetail(props) {
    const {
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
        stockName,
    } = details;
    const componentRef = useRef();

    const getStatusOfOperationLabel = statusOfOperation =>
        statusOfOperation === 1 || isDeletedForLog ? (
            <span
                className={styles.chip}
                style={{
                    color: '#F3B753',
                    background: '#FDF7EA',
                }}
            >
                Aktiv
            </span>
        ) : (
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
                    <span className={styles.modalTitle}>{invoiceNumber}</span>
                </div>

                <Spin spinning={isLoading}>
                    <ul className={styles.detailsList}>
                        {allBusinessUnits?.length > 1 &&
                        profile.businessUnits?.length !== 1 ? (
                            <Detail
                                primary="Biznes blok"
                                secondary={
                                    allBusinessUnits?.find(
                                        ({ id }) => id === row.businessUnitId
                                    )?.name
                                }
                            />
                        ) : null}
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
                            primary="İlkin qalıq tarixi"
                            secondary={
                                row.operationDate?.replace(
                                    /(\d{4})-(\d\d)-(\d\d)/,
                                    '$3-$2-$1'
                                ) || '-'
                            }
                        />
                        <Detail
                            primary="Status"
                            secondary={getStatusOfOperationLabel(
                                row?.statusOfOperation
                            )}
                        />
                        <Detail primary="Anbar" secondary={stockName || '-'} />
                        <Detail
                            primary="Sənəd"
                            secondary={invoiceNumber || '-'}
                        />

                        <Detail
                            primary="Məhsulların miqdarı"
                            secondary={
                                formatNumberToLocale(
                                    defaultNumberFormat(row.totalQuantity)
                                ) || '-'
                            }
                        />

                        <Detail
                            primary="Məhsulların dəyəri"
                            secondary={
                                `${formatNumberToLocale(
                                    defaultNumberFormat(row.amount)
                                )} ${row.currencyCode}` || '-'
                            }
                        />
                        {row.statusOfOperation === 3 && !isDeletedForLog && (
                            <>
                                <Detail
                                    primary="Silinib"
                                    secondary={`${row?.deleted_by_name} ${row?.deleted_by_lastname}`}
                                />
                                <Detail
                                    primary="Silinmə tarixi"
                                    secondary={row?.deletedAt}
                                />
                            </>
                        )}
                    </ul>
                </Spin>
            </div>
        </div>
    );
}

export default MoreDetail;
