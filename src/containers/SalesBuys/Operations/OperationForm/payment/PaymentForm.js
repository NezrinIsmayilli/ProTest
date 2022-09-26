import React, { useState, useEffect } from 'react';
import { cookies } from 'utils/cookies';
import { connect } from 'react-redux';
import { Row, Col, Spin } from 'antd';
import { fetchAccountBalance } from 'store/actions/finance/operations';
import { fetchCashboxNames } from 'store/actions/settings/kassa';
import { updatePaymentDetails } from 'store/actions/sales-operation';
import { convertCurrency } from 'store/actions/contact';
import { Table, ProSelect, ProInput, ProFormItem } from 'components/Lib';
import {
    accountTypes,
    formatNumberToLocale,
    defaultNumberFormat,
    fullDateTimeWithSecond,
    re_paymentAmount,
    roundToDown,
} from 'utils';
import { requiredRule } from 'utils/rules';

const roundTo = require('round-to');

const panelKeys = {
    invoice: '1',
    vat: '2',
};
const Payment = props => {
    const {
        invoiceInfo,
        id,
        currencies,
        columns,
        type,
        form,
        debt,
        amountPaid,
        activePayments,
        updatePaymentDetails,
        paymentDetails,
        invoiceCashboxNamesLoading,
        vatCashboxNamesLoading,
        fetchCashboxNames,
        fetchAccountBalance,
        invoiceCashboxBalanceLoading,
        vatCashboxBalanceLoading,
        setRate,
        invoiceCurrencyId,
        convertCurrency,
    } = props;
    const { rate, accountBalance } = paymentDetails;
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const {
        getFieldValue,
        setFieldsValue,
        getFieldDecorator,
        getFieldError,
    } = form;
    useEffect(() => {
        if (getFieldValue(`${type}PaymentAccount`)) {
            fetchAccountBalance({
                id: getFieldValue(`${type}PaymentAccount`),
                filters: {
                    dateTime: getFieldValue('date').format(
                        fullDateTimeWithSecond
                    ),
                },
                callBack: ({ data }) => {
                    updatePaymentDetails(
                        {
                            accountBalance:
                                data.length > 0 ? data : [{ balance: 0 }],
                        },
                        type
                    );
                },
                label: `${type}AccountBalance`,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getFieldValue('date')]);
    const getBalanceString = balance => {
        const amounts = balance.map(
            value =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value.balance)
                )} ${value.currencyCode || ''}`
        );
        return amounts.join(', ');
    };

    const getAccountBalance = (
        accountBalance,
        invoiceCashboxBalanceLoading,
        vatCashboxBalanceLoading
    ) => {
        if (
            type === 'invoice'
                ? invoiceCashboxBalanceLoading
                : vatCashboxBalanceLoading
        ) {
            return <Spin spinning size="small" />;
        }
        if (accountBalance.length > 0) {
            return (
                <span style={{ color: '#55AB80' }}>
                    Əməliyyat tarixi üzrə qalıq:{' '}
                    {getBalanceString(accountBalance)}
                </span>
            );
        }
        return '';
    };
    return (
        <>
            <Row gutter={32} style={{ marginBottom: '20px' }}>
                <Col span={6}>
                    <span></span>
                    <ProFormItem
                        label="Hesab növü"
                        help={getFieldError(`${type}PaymentType`)?.[0]}
                    >
                        {getFieldDecorator(`${type}PaymentType`, {
                            getValueFromEvent: accountType => {
                                setFieldsValue({
                                    [`${type}PaymentAccount`]: undefined,
                                });
                                updatePaymentDetails(
                                    {
                                        accountBalance: [],
                                    },
                                    type
                                );
                                fetchCashboxNames(
                                    {
                                        attribute: accountType,
                                        label: `${type}CashboxNames`,
                                        filters: id
                                            ? invoiceInfo
                                                ? {
                                                      businessUnitIds:
                                                          invoiceInfo?.businessUnitId ===
                                                          null
                                                              ? [0]
                                                              : [
                                                                    invoiceInfo?.businessUnitId,
                                                                ],
                                                  }
                                                : {}
                                            : cookies.get('_TKN_UNIT_')
                                            ? {
                                                  businessUnitIds: [
                                                      cookies.get('_TKN_UNIT_'),
                                                  ],
                                              }
                                            : {},
                                    },
                                    ({ data }) => {
                                        setPaymentAccounts(data);
                                    }
                                );
                                return accountType;
                            },
                            rules: activePayments.includes(panelKeys[type])
                                ? [requiredRule]
                                : [],
                        })(
                            <ProSelect allowClear={false} data={accountTypes} />
                        )}
                    </ProFormItem>
                </Col>
                <Col span={6}>
                    <ProFormItem
                        label="Hesab"
                        autoHeight
                        helperText={getAccountBalance(
                            accountBalance,
                            invoiceCashboxBalanceLoading,
                            vatCashboxBalanceLoading
                        )}
                        help={getFieldError(`${type}PaymentAccount`)?.[0]}
                    >
                        {getFieldDecorator(`${type}PaymentAccount`, {
                            getValueFromEvent: accountId => {
                                fetchAccountBalance({
                                    id: accountId,
                                    filters: {
                                        dateTime: getFieldValue('date').format(
                                            fullDateTimeWithSecond
                                        ),
                                    },
                                    callBack: ({ data }) => {
                                        updatePaymentDetails(
                                            {
                                                accountBalance:
                                                    data.length > 0
                                                        ? data
                                                        : [{ balance: 0 }],
                                            },
                                            type
                                        );
                                    },
                                    label: `${type}AccountBalance`,
                                });
                                return accountId;
                            },
                            rules: activePayments.includes(panelKeys[type])
                                ? [requiredRule]
                                : [],
                        })(
                            <ProSelect
                                allowClear={false}
                                data={paymentAccounts}
                                loading={
                                    type === 'invoice'
                                        ? invoiceCashboxNamesLoading
                                        : vatCashboxNamesLoading
                                }
                                keys={['name']}
                            />
                        )}
                    </ProFormItem>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={16}>
                            <ProFormItem
                                label="Ödəniş məbləği"
                                help={
                                    getFieldError(`${type}PaymentAmount`)?.[0]
                                }
                            >
                                {getFieldDecorator(`${type}PaymentAmount`, {
                                    getValueFromEvent: event => {
                                        if (
                                            re_paymentAmount.test(
                                                event.target.value
                                            ) &&
                                            event.target.value <= 100000000
                                        ) {
                                            return event.target.value;
                                        }
                                        if (event.target.value === '') {
                                            return null;
                                        }
                                        return getFieldValue(
                                            `${type}PaymentAmount`
                                        );
                                    },
                                    rules: activePayments.includes(
                                        panelKeys[type]
                                    )
                                        ? [requiredRule]
                                        : [],
                                })(<ProInput />)}
                            </ProFormItem>
                        </Col>
                        <Col span={8}>
                            <ProFormItem
                                label="Valyuta"
                                help={
                                    getFieldError(`${type}PaymentCurrency`)?.[0]
                                }
                            >
                                {getFieldDecorator(`${type}PaymentCurrency`, {
                                    getValueFromEvent: currencyId => {
                                        const selectedCurrency = currencies.find(
                                            currency =>
                                                currency.id === currencyId
                                        );
                                        convertCurrency(
                                            Number(
                                                getFieldValue(
                                                    `${type}PaymentAmount`
                                                )
                                            ),
                                            invoiceCurrencyId?.id,
                                            currencyId,
                                            ({ data }) => {
                                                setRate(1 / data.rate);
                                                updatePaymentDetails(
                                                    {
                                                        rate: roundToDown(
                                                            1 / data.rate
                                                        ),
                                                    },
                                                    type
                                                );
                                                if (type === 'invoice') {
                                                    setFieldsValue({
                                                        invoicePaymentAmount: roundTo.down(
                                                            Number(data.amount),
                                                            2
                                                        ),
                                                    });
                                                } else {
                                                    setFieldsValue({
                                                        vatPaymentAmount: roundTo.down(
                                                            Number(data.amount),
                                                            2
                                                        ),
                                                    });
                                                }
                                            }
                                        );
                                        updatePaymentDetails({
                                            currencyCode: selectedCurrency.code,
                                        });
                                        return currencyId;
                                    },
                                    rules: activePayments.includes(
                                        panelKeys[type]
                                    )
                                        ? [requiredRule]
                                        : [],
                                })(
                                    <ProSelect
                                        allowClear={false}
                                        data={currencies}
                                        keys={['code']}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Table
                scroll={{ x: 'max-content' }}
                dataSource={[
                    {
                        id: 1,
                        rate,
                        type,
                        amountPaid,
                        currencyCode:
                            currencies.find(
                                currency =>
                                    currency.id ===
                                    getFieldValue(
                                        type === 'vat'
                                            ? 'vatPaymentCurrency'
                                            : 'invoicePaymentCurrency'
                                    )
                            )?.code || 'USD',
                        debtOnTheDocument: debt,
                    },
                ]}
                columns={columns}
                rowKey={record => record.id}
            />
        </>
    );
};

const mapStateToProps = state => ({
    invoiceCashboxNamesLoading: state.loadings.invoiceCashboxNames,
    invoiceCashboxBalanceLoading: state.loadings.invoiceAccountBalance,
    vatCashboxNamesLoading: state.loadings.vatCashboxNames,
    vatCashboxBalanceLoading: state.loadings.vatAccountBalance,

    activePayments: state.salesOperation.activePayments,
    currencies: state.kassaReducer.currencies,
});

export const PaymentForm = connect(
    mapStateToProps,
    {
        updatePaymentDetails,
        fetchCashboxNames,
        fetchAccountBalance,
        convertCurrency,
    }
)(Payment);
