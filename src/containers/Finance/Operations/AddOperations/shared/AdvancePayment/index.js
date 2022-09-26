import React from 'react';
import { Checkbox, Spin } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from './styles.module.scss';

export const AdvancePayment = props => {
    const {
        advancePayment,
        loading = false,
        onChange,
        checked,
        disabled,
        title = 'Avansdan ödə',
        subTitle = 'Avans:',
        editId = false,
        operationsList = [],
        isPayment = false,
        isInvoice = false,
        selectedCounterparty = undefined,
    } = props;
    return (
        <Spin spinning={loading}>
            <div className={styles.advancePaymentBox}>
                <div className={checked ? styles.details : styles.fadeDetails}>
                    <h4 className={styles.title}>{title}</h4>
                    <div className={styles.avansBox}>
                        <span className={styles.subtitle}>{subTitle}</span>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginLeft: 6,
                            }}
                        >
                            {/* <span style={{ color: '#55AB80' }}>
                {advancePayment?.myAmount?.map(
                  ({ amount, code }) =>
                    `${formatNumberToLocale(
                      defaultNumberFormat(amount)
                    )} ${code}, `
                )}
              </span> */}
                            {advancePayment?.myAmount?.map(
                                ({ amount, code, currencyId, fromFront }) =>
                                    editId &&
                                    ((isPayment &&
                                        selectedCounterparty ===
                                            operationsList[0]?.employeeId) ||
                                        (isInvoice &&
                                            !fromFront &&
                                            selectedCounterparty ===
                                                operationsList[0]
                                                    ?.contactId)) &&
                                    operationsList?.[0]
                                        ?.operationDirectionId === 2 &&
                                    currencyId ===
                                        operationsList[0]?.currencyId ? (
                                        Number(amount) +
                                            Number(operationsList[0]?.amount) >
                                        0 ? (
                                            <span
                                                style={{
                                                    color: '#55AB80',
                                                }}
                                            >
                                                {formatNumberToLocale(
                                                    defaultNumberFormat(
                                                        Number(amount) +
                                                            Number(
                                                                operationsList[0]
                                                                    ?.amount
                                                            )
                                                    )
                                                )}
                                                {code}
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    color: '#FF716A',
                                                }}
                                            >
                                                {formatNumberToLocale(
                                                    defaultNumberFormat(
                                                        Number(amount) +
                                                            Number(
                                                                operationsList[0]
                                                                    ?.amount
                                                            )
                                                    )
                                                )}
                                                {code}
                                            </span>
                                        )
                                    ) : amount > 0 ? (
                                        <span style={{ color: '#55AB80' }}>
                                            {formatNumberToLocale(
                                                defaultNumberFormat(amount)
                                            )}
                                            {code}
                                        </span>
                                    ) : (
                                        <span style={{ color: '#FF716A' }}>
                                            {formatNumberToLocale(
                                                defaultNumberFormat(amount)
                                            )}
                                            {code}
                                        </span>
                                    )
                            )}
                            {editId &&
                            isPayment &&
                            selectedCounterparty ===
                                operationsList[0]?.employeeId &&
                            operationsList[0]?.cashInOrCashOut === 1 &&
                            operationsList[0]?.isEmployeePayment &&
                            operationsList?.[0]?.operationDirectionId === 2 &&
                            !advancePayment.myAmount
                                ?.map(({ currencyId }) => currencyId)
                                .includes(operationsList[0]?.currencyId) ? (
                                Number(operationsList[0]?.amount) > 0 ? (
                                    <span
                                        style={{
                                            color: '#55AB80',
                                        }}
                                    >
                                        {formatNumberToLocale(
                                            defaultNumberFormat(
                                                operationsList[0]?.amount
                                            )
                                        )}
                                        {operationsList[0]?.currencyCode}
                                    </span>
                                ) : (
                                    <span
                                        style={{
                                            color: '#FF716A',
                                        }}
                                    >
                                        {formatNumberToLocale(
                                            defaultNumberFormat(
                                                operationsList[0]?.amount
                                            )
                                        )}
                                        {operationsList[0]?.currencyCode}
                                    </span>
                                )
                            ) : (
                                ''
                            )}

                            <span style={{ color: '#FF716A' }}>
                                {advancePayment?.contactsAmount?.map(
                                    ({ amount, code, currencyId, fromFront }) =>
                                        editId &&
                                        ((isPayment &&
                                            selectedCounterparty ===
                                                operationsList[0]
                                                    ?.employeeId) ||
                                            (isInvoice &&
                                                !fromFront &&
                                                selectedCounterparty ===
                                                    operationsList[0]
                                                        ?.contactId)) &&
                                        operationsList?.[0]
                                            ?.operationDirectionId === 2 &&
                                        currencyId ===
                                            operationsList[0]?.currencyId
                                            ? `${formatNumberToLocale(
                                                  defaultNumberFormat(
                                                      Number(amount) +
                                                          Number(
                                                              operationsList[0]
                                                                  ?.amount
                                                          )
                                                  )
                                              )} ${code}, `
                                            : `${formatNumberToLocale(
                                                  defaultNumberFormat(amount)
                                              )} ${code}, `
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.box}>
                    <Checkbox
                        disabled={disabled}
                        className={styles.customCheckBox}
                        checked={checked}
                        onChange={event => onChange(event.target.checked)}
                    />
                </div>
            </div>
        </Spin>
    );
};

export default AdvancePayment;
