/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Input, Button, Tooltip, Spin } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from './styles.module.scss';

export function AmountOfTransaction({
    amount,
    invoiceData,
    convertLoading,
    setInvoiceData,
    selectedInvoices,
}) {
    const [editable, setEditable] = useState(false);
    const [tmpRate, setTmpRate] = useState(undefined);

    useEffect(() => {
        setTmpRate(invoiceData.rate);
    }, [editable]);

    const editRate = e => {
        setTmpRate(e.target.value);
    };
    const saveRate = () => {
        setInvoiceData({ ...invoiceData, rate: tmpRate });
        setEditable(false);
    };
    return (
        <div className={styles.parentWrapper}>
            {(invoiceData.invoice || selectedInvoices.length > 0) && (
                <div className={styles.rateDeptBox}>
                    <div className={styles.box}>
                        <strong className={styles.strong}>Məzənnə</strong>

                        {editable === true ? (
                            <>
                                <Input value={tmpRate} onChange={editRate} />
                                <Tooltip placement="bottom" title="İmtina">
                                    <Button
                                        className={styles.customBtn}
                                        onClick={() => setEditable(false)}
                                        icon="close"
                                    />
                                </Tooltip>
                                <Tooltip placement="bottom" title="Yadda saxla">
                                    <Button
                                        className={styles.customBtn}
                                        onClick={saveRate}
                                        type="primary"
                                        icon="save"
                                    />
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                <strong
                                    className={styles.green}
                                    style={{ minWidth: '6ch' }}
                                >
                                    {convertLoading ? (
                                        <Spin
                                            size="small"
                                            style={{
                                                lineHeight: 1,
                                                marginLeft: 6,
                                            }}
                                        />
                                    ) : (
                                        Number(invoiceData.rate || 0).toFixed(5)
                                    )}
                                </strong>
                                <Tooltip placement="right" title="Redaktə">
                                    <Button
                                        disabled={
                                            invoiceData?.currency?.id ===
                                            invoiceData?.invoice?.currencyId
                                        }
                                        onClick={() => setEditable(true)}
                                        style={{ marginLeft: 8 }}
                                        icon="edit"
                                    />
                                </Tooltip>
                            </>
                        )}
                    </div>
                    {
                        <div className={styles.box}>
                            <strong className={styles.strong}>
                                Silinəcək məbləğ
                            </strong>
                            <strong className={styles.red}>
                                {formatNumberToLocale(
                                    defaultNumberFormat(
                                        Number(amount || 0) *
                                            Number(invoiceData.rate || 1)
                                    )
                                )}
                                {invoiceData.invoice?.currencyCode ||
                                    selectedInvoices?.[0]?.currencyCode}
                            </strong>
                        </div>
                    }
                </div>
            )}
        </div>
    );
}
