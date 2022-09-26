/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { MdAddCircle, MdRemoveCircle } from 'react-icons/md';
import { Spin } from 'antd';
import { roundToDown } from 'utils';
import styles from './styles.module.scss';

const math = require('exact-math');

export const ReceivablesPayables = props => {
    const {
        loadingCalc,
        payables,
        receivables,
        editId,
        operationsList,
        counterparty,
    } = props;
    return (
        <Spin spinning={loadingCalc}>
            <div className={styles.receivablesPayablesBox}>
                <div className={styles.payables}>
                    <MdAddCircle />
                    <span className={styles.result}>
                        {Object.keys(receivables).length !== 0
                            ? Object.keys(receivables).map(item =>
                                  editId &&
                                  operationsList[0]?.operationDirectionId ===
                                      1 &&
                                  operationsList[0]?.invoiceCurrencyCode ===
                                      item &&
                                  operationsList[0]?.contactId === counterparty
                                      ? `${roundToDown(
                                            math.sub(
                                                Number(
                                                    math.add(
                                                        Number(
                                                            receivables[item]
                                                        ),
                                                        Number(
                                                            operationsList[0]
                                                                ?.invoicePaymentAmountConvertedToInvoiceCurrency
                                                        )
                                                    )
                                                ),
                                                Number(
                                                    operationsList[0]
                                                        ?.creditAmount || 0
                                                ),
                                                Number(
                                                    operationsList[0]
                                                        ?.depositAmount || 0
                                                )
                                            )
                                        )} ${item}, `
                                      : `${roundToDown(
                                            receivables[item]
                                        )} ${item}, `
                              )
                            : '0 '}
                        Debitor Borclar{' '}
                    </span>
                </div>
                <span> = </span>
                <div className={styles.receivables}>
                    <MdRemoveCircle />
                    <span className={styles.result}>
                        {Object.keys(payables).length !== 0
                            ? Object.keys(payables).map(item =>
                                  editId &&
                                  operationsList[0]?.operationDirectionId ===
                                      -1 &&
                                  operationsList[0]?.invoiceCurrencyCode ===
                                      item &&
                                  operationsList[0]?.contactId === counterparty
                                      ? `${roundToDown(
                                            math.sub(
                                                Number(
                                                    math.add(
                                                        Number(payables[item]),
                                                        Number(
                                                            operationsList[0]
                                                                ?.invoicePaymentAmountConvertedToInvoiceCurrency
                                                        )
                                                    )
                                                ),
                                                Number(
                                                    operationsList[0]
                                                        ?.creditAmount || 0
                                                ),
                                                Number(
                                                    operationsList[0]
                                                        ?.depositAmount || 0
                                                )
                                            )
                                        )} ${item}, `
                                      : `${roundToDown(
                                            payables[item]
                                        )} ${item}, `
                              )
                            : '0 '}{' '}
                        Kreditor Borclar
                    </span>
                </div>
            </div>
        </Spin>
    );
};
