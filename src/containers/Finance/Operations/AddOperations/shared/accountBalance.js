import React from 'react';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { Spin } from 'antd';
import styles from '../styles.module.scss';

const math = require('exact-math');

export function AccountBalance({
    list = [],
    label = 'Qalıq:',
    keys = ['balance', 'currencyCode', 'tenantCurrencyId'],
    type = 'accountBalance',
    loading = false,
    editId = false,
    operationsList = [],
    typeOfPayment,
    selectedAccount,
}) {
    return (
        <Spin spinning={loading}>
            <div className={styles.qaligBox}>
                <div className={styles.accountBalancesBox}>
                    <strong className={styles.hesab}>{label}</strong>
                    &nbsp;
                    {list.length !== 0 ? (
                        list.map((item, index) => (
                            <>
                                {editId &&
                                operationsList[0]?.cashboxId ===
                                    selectedAccount &&
                                operationsList[0]?.paymentTypeId ===
                                    typeOfPayment ? (
                                    operationsList[0]?.operationDirectionId ===
                                    -1 ? (
                                        operationsList[0]?.currencyId ===
                                        item[keys[2]] ? (
                                            <strong
                                                key={index}
                                                className={
                                                    styles.accountBalancesItem
                                                }
                                                style={
                                                    type === 'accountBalance'
                                                        ? {}
                                                        : math.add(
                                                              Number(
                                                                  item[
                                                                      keys[0]
                                                                  ] || 0
                                                              ),
                                                              Number(
                                                                  operationsList[0]
                                                                      ?.amount ||
                                                                      0
                                                              )
                                                          ) === 0
                                                        ? {}
                                                        : math.add(
                                                              Number(
                                                                  item[
                                                                      keys[0]
                                                                  ] || 0
                                                              ),
                                                              Number(
                                                                  operationsList[0]
                                                                      ?.amount ||
                                                                      0
                                                              )
                                                          ) > 0
                                                        ? { color: 'green' }
                                                        : { color: 'red' }
                                                }
                                            >
                                                {formatNumberToLocale(
                                                    defaultNumberFormat(
                                                        math.add(
                                                            Number(
                                                                item[keys[0]] ||
                                                                    0
                                                            ),
                                                            Number(
                                                                operationsList[0]
                                                                    ?.amount ||
                                                                    0
                                                            )
                                                        )
                                                    )
                                                )}
                                            </strong>
                                        ) : (
                                            <strong
                                                key={index}
                                                className={
                                                    styles.accountBalancesItem
                                                }
                                                style={
                                                    type === 'accountBalance'
                                                        ? {}
                                                        : Number(
                                                              item[keys[0]]
                                                          ) === 0
                                                        ? {}
                                                        : Number(
                                                              item[keys[0]]
                                                          ) > 0
                                                        ? { color: 'green' }
                                                        : { color: 'red' }
                                                }
                                            >
                                                {formatNumberToLocale(
                                                    defaultNumberFormat(
                                                        Number(item[keys[0]])
                                                    )
                                                )}
                                            </strong>
                                        )
                                    ) : operationsList[0]?.currencyId ===
                                      item[keys[2]] ? (
                                        math.sub(
                                            Number(item[keys[0]] || 0),
                                            Number(
                                                operationsList[0]?.amount || 0
                                            )
                                        ) === 0 && list.length > 1 ? (
                                            ''
                                        ) : (
                                            <strong
                                                key={index}
                                                className={
                                                    styles.accountBalancesItem
                                                }
                                                style={
                                                    type === 'accountBalance'
                                                        ? {}
                                                        : math.sub(
                                                              Number(
                                                                  item[
                                                                      keys[0]
                                                                  ] || 0
                                                              ),
                                                              Number(
                                                                  operationsList[0]
                                                                      ?.amount ||
                                                                      0
                                                              )
                                                          ) === 0
                                                        ? {}
                                                        : math.sub(
                                                              Number(
                                                                  item[
                                                                      keys[0]
                                                                  ] || 0
                                                              ),
                                                              Number(
                                                                  operationsList[0]
                                                                      ?.amount ||
                                                                      0
                                                              )
                                                          ) > 0
                                                        ? { color: 'green' }
                                                        : { color: 'red' }
                                                }
                                            >
                                                {formatNumberToLocale(
                                                    defaultNumberFormat(
                                                        math.sub(
                                                            Number(
                                                                item[keys[0]] ||
                                                                    0
                                                            ),
                                                            Number(
                                                                operationsList[0]
                                                                    ?.amount ||
                                                                    0
                                                            )
                                                        )
                                                    )
                                                )}
                                            </strong>
                                        )
                                    ) : (
                                        <strong
                                            key={index}
                                            className={
                                                styles.accountBalancesItem
                                            }
                                            style={
                                                type === 'accountBalance'
                                                    ? {}
                                                    : Number(item[keys[0]]) ===
                                                      0
                                                    ? {}
                                                    : Number(item[keys[0]]) > 0
                                                    ? { color: 'green' }
                                                    : { color: 'red' }
                                            }
                                        >
                                            {formatNumberToLocale(
                                                defaultNumberFormat(
                                                    Number(item[keys[0]])
                                                )
                                            )}
                                        </strong>
                                    )
                                ) : (
                                    <strong
                                        key={index}
                                        className={styles.accountBalancesItem}
                                        style={
                                            type === 'accountBalance'
                                                ? {}
                                                : Number(item[keys[0]]) === 0
                                                ? {}
                                                : Number(item[keys[0]]) > 0
                                                ? { color: 'green' }
                                                : { color: 'red' }
                                        }
                                    >
                                        {formatNumberToLocale(
                                            defaultNumberFormat(
                                                Number(item[keys[0]])
                                            )
                                        )}
                                    </strong>
                                )}{' '}
                                {editId &&
                                operationsList[0]?.cashboxId ===
                                    selectedAccount &&
                                operationsList[0]?.paymentTypeId ===
                                    typeOfPayment &&
                                operationsList[0]?.currencyId ===
                                    item[keys[2]] &&
                                ((operationsList[0]?.operationDirectionId === 1 &&
                                math.sub(
                                    Number(item[keys[0]] || 0),
                                    Number(operationsList[0]?.amount || 0)
                                ) === 0) || (operationsList[0]?.operationDirectionId === -1 &&
                                    math.add(
                                        Number(item[keys[0]] || 0),
                                        Number(operationsList[0]?.amount || 0)
                                    ) === 0))? (
                                    ''
                                ) : (
                                    <strong
                                        key={index}
                                        className={styles.accountBalancesItem}
                                        style={
                                            type === 'accountBalance'
                                                ? {}
                                                : math.sub(
                                                      Number(
                                                          item[keys[0]] || 0
                                                      ),
                                                      Number(
                                                          operationsList[0]
                                                              ?.amount || 0
                                                      )
                                                  ) > 0
                                                ? { color: 'green' }
                                                : { color: 'red' }
                                        }
                                    >
                                        {' '}
                                        {item[keys[1]]}{' '}
                                    </strong>
                                )}
                                {index >= list[0].length ||
                                (editId &&
                                    operationsList[0]?.cashboxId ===
                                        selectedAccount &&
                                    operationsList[0]?.paymentTypeId ===
                                        typeOfPayment &&
                                    operationsList[0]?.currencyId ===
                                        item[keys[2]] &&
                                    operationsList[0]?.operationDirectionId ===
                                        1 &&
                                    math.sub(
                                        Number(item[keys[0]] || 0),
                                        Number(operationsList[0]?.amount || 0)
                                    ) === 0) ? (
                                    ''
                                ) : (
                                    <span />
                                )}
                            </>
                        ))
                    ) : editId &&
                      operationsList[0]?.cashboxId === selectedAccount &&
                      operationsList[0]?.operationDirectionId === -1 ? (
                        <strong className={styles.accountBalancesItem}>
                            {formatNumberToLocale(
                                defaultNumberFormat(
                                    Number(operationsList[0]?.amount)
                                )
                            )}{' '}
                            {operationsList[0]?.currencyCode}
                        </strong>
                    ) : (
                        <strong className={styles.accountBalancesItem}>
                            {Number(0).toFixed(2)}
                        </strong>
                    )}
                    {list.length !== 0 &&
                    ![...list]
                        .map(item => item[keys[2]])
                        .includes(Number(operationsList[0]?.currencyId)) &&
                    editId &&
                    operationsList[0]?.cashboxId === selectedAccount &&
                    operationsList[0]?.operationDirectionId === -1 ? (
                        <strong className={styles.accountBalancesItem}>
                            {formatNumberToLocale(
                                defaultNumberFormat(
                                    Number(operationsList[0]?.amount)
                                )
                            )}{' '}
                            {operationsList[0]?.currencyCode}
                        </strong>
                    ) : (
                        ''
                    )}
                </div>
            </div>
        </Spin>
    );
}
