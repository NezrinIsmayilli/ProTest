import React, { useState, useEffect } from 'react';
import { cookies } from 'utils/cookies';
import { connect } from 'react-redux';
import { Row, Col, Spin } from 'antd';
import { fetchAccountBalance } from 'store/actions/finance/operations';
import { fetchCashboxNames } from 'store/actions/settings/kassa';
import { updatePaymentDetails } from 'store/actions/sales-operation';
import { Table, ProSelect, ProInput, ProFormItem } from 'components/Lib';
import {
    accountTypes,
    formatNumberToLocale,
    defaultNumberFormat,
    fullDateTimeWithSecond,
    re_paymentAmount,
} from 'utils';
import { requiredRule } from 'utils/rules';
import moment from 'moment';

const Payment = props => {
    const {
        setInitialPayment,
        edit,
        invoiceInfo,
        id,
        currencies,
        columns,
        form,
        debt,
        amountPaid,
        updatePaymentDetails,
        paymentDetails,
        invoiceCashboxNamesLoading,
        fetchCashboxNames,
        fetchAccountBalance,
        invoiceCashboxBalanceLoading,
        checked,
        invoiceCurrencyCode,
        paymentAccounts,
        setPaymentAccounts,
    } = props;
    const { rate, accountBalance } = paymentDetails;
    const {
        getFieldValue,
        setFieldsValue,
        getFieldDecorator,
        getFieldError,
    } = form;
    // useEffect(() => {
    //   if (getFieldValue(`paymentAccount`)) {
    //     fetchAccountBalance({
    //       id: getFieldValue(`paymentAccount`),
    //       filters: {
    //         dateTime: moment().format(fullDateTimeWithSecond),
    //       },
    //       callBack: ({ data }) => {
    //         updatePaymentDetails(
    //           {
    //             accountBalance: data.length > 0 ? data : [{ balance: 0 }],
    //           },
    //           'invoice'
    //         );
    //       },
    //       label: `accountBalance`,
    //     });
    //   }
    // }, [getFieldValue('dateTime')]);
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
        invoiceCashboxBalanceLoading
    ) => {
        if (invoiceCashboxBalanceLoading) {
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
                    <ProFormItem
                        label="Hesab növü"
                        help={getFieldError('paymentType')?.[0]}
                    >
                        {getFieldDecorator('paymentType', {
                            getValueFromEvent: accountType => {
                                setFieldsValue({ paymentAccount: undefined });
                                updatePaymentDetails(
                                    {
                                        accountBalance: [],
                                    },
                                    'invoice'
                                );
                                fetchCashboxNames(
                                    {
                                        attribute: accountType,
                                        label: `cashboxNames`,
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
                            rules: checked ? [requiredRule] : [],
                        })(
                            <ProSelect
                                allowClear={false}
                                data={accountTypes}
                                disabled={!checked}
                            />
                        )}
                    </ProFormItem>
                </Col>
                <Col span={6}>
                    <ProFormItem
                        label="Hesab"
                        autoHeight
                        helperText={getAccountBalance(
                            accountBalance,
                            invoiceCashboxBalanceLoading
                        )}
                        help={getFieldError(`paymentAccount`)?.[0]}
                    >
                        {getFieldDecorator(`paymentAccount`, {
                            getValueFromEvent: accountId => {
                                fetchAccountBalance({
                                    id: accountId,
                                    filters: {
                                        dateTime: moment().format(
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
                                            'invoice'
                                        );
                                    },
                                    label: `accountBalance`,
                                });
                                return accountId;
                            },
                            rules: checked ? [requiredRule] : [],
                        })(
                            <ProSelect
                                allowClear={false}
                                data={paymentAccounts}
                                loading={invoiceCashboxNamesLoading}
                                keys={['name']}
                                disabled={!checked}
                            />
                        )}
                    </ProFormItem>
                </Col>
                <Col span={10}>
                    <Row>
                        <Col span={16}>
                            <ProFormItem
                                label="Ödəniş məbləği"
                                help={getFieldError(`paymentAmount`)?.[0]}
                            >
                                {getFieldDecorator(`paymentAmount`, {
                                    getValueFromEvent: event => {
                                        if (
                                            re_paymentAmount.test(
                                                event.target.value
                                            ) &&
                                            event.target.value <= 100000000
                                        ) {
                                            setInitialPayment([
                                                {
                                                    initialPayment:
                                                        event.target.value,
                                                },
                                            ]);
                                            return event.target.value;
                                        }
                                        if (event.target.value === '') {
                                            return null;
                                        }
                                        return getFieldValue(`paymentAmount`);
                                    },
                                    rules: checked
                                        ? [
                                              requiredRule,
                                              {
                                                  type: 'number',
                                                  min: 0.1,
                                                  message:
                                                      'Ödəniş məbləği 0 ola bilməz.',
                                                  transform: value =>
                                                      Number(value),
                                              },
                                          ]
                                        : [],
                                })(<ProInput disabled={!checked} />)}
                            </ProFormItem>
                        </Col>
                        <Col span={7} style={{ marginLeft: '10px' }}>
                            <ProFormItem
                                label="Valyuta"
                                help={getFieldError(`paymentCurrency`)?.[0]}
                            >
                                {getFieldDecorator(`paymentCurrency`, {
                                    getValueFromEvent: currencyId => {
                                        const selectedCurrency = currencies.find(
                                            currency =>
                                                currency.id === currencyId
                                        );
                                        updatePaymentDetails({
                                            currencyCode: selectedCurrency.code,
                                        });
                                        return currencyId;
                                    },
                                    rules: checked ? [requiredRule] : [],
                                })(
                                    <ProSelect
                                        allowClear={false}
                                        data={currencies}
                                        keys={['code']}
                                        disabled={!checked}
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
                        type: 'invoice',
                        amountPaid,
                        currencyCode:
                            currencies.find(
                                currency =>
                                    currency.id ===
                                    getFieldValue(`paymentCurrency`)
                            )?.code || invoiceCurrencyCode,
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
    }
)(Payment);
