/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Input, Button, Tooltip, Spin, Switch } from 'antd';
import styles from './styles.module.scss';

export function ExchangeRate({
    setNotRoundedRate,
    form,
    exchangeData,
    convertLoading,
    setExchangeData,
    rateStatus,
    setRateStatus,
}) {
    const { getFieldValue } = form;
    const [editable, setEditable] = useState(false);
    const [tmpRate, setTmpRate] = useState(undefined);

    useEffect(() => {
        setTmpRate(exchangeData.rate);
    }, [editable]);

    const editRate = e => {
        setTmpRate(e.target.value);
    };
    const saveRate = () => {
        setExchangeData({ ...exchangeData, rate: Number(tmpRate) });
        setNotRoundedRate(Number(tmpRate));
        setEditable(false);
    };
    return (
        <div className={styles.parentWrapper}>
            {getFieldValue('toCurrency') && getFieldValue('fromCurrency') && (
                <div className={styles.rateDeptBox}>
                    <div className={styles.box}>
                        <strong className={styles.strong}>Məzənnə</strong>
                        <Switch
                            style={{ margin: '0 16px' }}
                            checked={rateStatus}
                            onChange={checked => setRateStatus(checked)}
                        />
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
                                        Number(exchangeData.rate).toFixed(5)
                                    )}
                                </strong>
                                {rateStatus ? (
                                    <Tooltip placement="right" title="Redaktə">
                                        <Button
                                            onClick={() => setEditable(true)}
                                            style={{ marginLeft: 8 }}
                                            icon="edit"
                                        />
                                    </Tooltip>
                                ) : null}
                            </>
                        )}
                    </div>
                    {/* {
            <div className={styles.box}>
              <strong className={styles.strong}>Silinəcək məbləğ</strong>
              <strong className={styles.red}>
                {formatNumberToLocale(
                  defaultNumberFormat(
                    Number(amount || 0) * Number(exchangeData.rate || 1)
                  )
                )}
                {exchangeData.invoice?.currencyCode}
              </strong>
            </div>
          } */}
                </div>
            )}
        </div>
    );
}
