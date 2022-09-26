/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Checkbox, Collapse, Button, Tooltip, Input, Spin } from 'antd';
import { connect } from 'react-redux';
import {
    setActivePayments,
    updatePaymentDetails,
} from 'store/actions/sales-operation';
import { convertCurrency } from 'store/actions/contact';
import { fetchCashboxNames } from 'store/actions/settings/kassa';
import {
    IoIosArrowDropdownCircle,
    IoIosArrowDroprightCircle,
} from 'react-icons/all';
import { formatNumberToLocale, defaultNumberFormat, re_amount, roundToDown } from 'utils';
import { PaymentForm } from './index';
import styles from '../styles.module.scss';

const math = require('exact-math');

const { Panel } = Collapse;
const PaymentPaper = props => {
    const {
        form,
        invoiceInfo,
        id,
        setChecked,
        checked,
        invoicePaymentDetails,
        invoiceCurrencyCode,
        updatePaymentDetails,
        selectedProducts,
        initialPayment,
        setInitialPayment,
        edit,
        invoicesLoading,
        invoiceInfoLoading,
        convertCurrency,
    } = props;
    const { getFieldValue, setFields } = form;
    const [editable, setEditable] = useState(false);
    const [paymentAccounts, setPaymentAccounts] = useState([]);

    const handleRateChange = (event, type) => {
        if (re_amount.test(event) && event <= 1000) {
            updatePaymentDetails({ rate: event }, type);
        }
        if (event === '') {
            updatePaymentDetails({ rate: undefined }, type);
        }
    };

    useEffect(() => {
        if (
            getFieldValue('paymentCurrency') &&
            getFieldValue('currency') &&
            !invoicesLoading &&
            !invoiceInfoLoading
        ) {
            convertCurrency(
                getFieldValue('paymentAmount') || 1,
                getFieldValue('paymentCurrency'),
                getFieldValue('currency'),
                ({ data }) => {
                    updatePaymentDetails(
                        { rate: roundToDown(Number(data.rate)) || 1 },
                        'invoice'
                    );
                }
            );
        }
    }, [
        getFieldValue('paymentCurrency'),
        getFieldValue('currency'),
        invoicesLoading,
    ]);

    const columns = [
        {
            title: 'Sənəd üzrə borc',
            dataIndex: 'debtOnTheDocument',
            align: 'left',
            width: 180,
            render: value =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value || 0)
                )} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Ödəniş məbləği',
            dataIndex: 'amountPaid',
            width: 160,
            align: 'right',
            render: (value, { currencyCode }) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value || 0)
                )} ${currencyCode}`,
        },
        {
            title: 'Məzənnə',
            dataIndex: 'rate',
            width: 130,
            align: 'center',
            render: (value, row) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    {editable ? (
                        <Tooltip
                            placement="topLeft"
                            title="Tap enter to save or click away"
                        >
                            <Input
                                autoFocus
                                onBlur={() => setEditable(false)}
                                onChange={event =>
                                    handleRateChange(
                                        event.target.value,
                                        row.type
                                    )
                                }
                                value={value}
                                onKeyDown={e => {
                                    if (e.keyCode === 13 || e.keyCode === 27) {
                                        setEditable(false);
                                    }
                                }}
                            />
                        </Tooltip>
                    ) : (
                        <>
                            {value || 1}
                            <Button
                                disabled={
                                    invoiceCurrencyCode === row.currencyCode
                                }
                                onClick={() => setEditable(true)}
                                type="link"
                                style={{ marginLeft: 6 }}
                                icon="edit"
                                shape="circle"
                            />
                        </>
                    )}
                </div>
            ),
        },
        {
            title: 'Azalan borc',
            dataIndex: 'amountPaid',
            key: 'decresedDebt',
            align: 'right',
            width: 160,
            render: (value, { rate }) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(
                        math.mul(Number(value || 0), Number(rate || 1))
                    )
                )} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Avans',
            dataIndex: 'amountPaid',
            key: 'advance',
            width: 160,
            align: 'right',
            render: (value, { debtOnTheDocument, rate }) => {
                const advance = math.sub(
                    math.mul(Number(value || 0), Number(rate || 1)),
                    Number(debtOnTheDocument || 0)
                );

                return `${formatNumberToLocale(
                    defaultNumberFormat(
                        Math.abs(Number(advance) > 0 ? Number(advance) : 0)
                    )
                )} ${invoiceCurrencyCode}`;
            },
        },
        {
            title: 'Qalıq borc',
            dataIndex: 'amountPaid',
            key: 'debt',
            width: 160,
            align: 'right',
            render: (value, { debtOnTheDocument, rate }) => {
                const debt = math.sub(
                    Number(debtOnTheDocument || 0),
                    math.mul(Number(value || 0), Number(rate || 1))
                );
                return `${formatNumberToLocale(
                    defaultNumberFormat(
                        Math.abs(Number(debt) > 0 ? Number(debt) : 0)
                    )
                )} ${invoiceCurrencyCode}`;
            },
        },
    ];

    const handleCheckbox = checked => {
        if (checked) {
            setChecked(true);
        } else {
            updatePaymentDetails(
                {
                    accountBalance: [],
                },
                'invoice'
            );
            setFields({
                paymentType: {
                    errors: undefined,
                },
                paymentAccount: {
                    errors: undefined,
                },
                paymentAmount: {
                    errors: undefined,
                },
            });
            setChecked(false);
        }
    };

    return (
        <Spin spinning={invoicesLoading}>
            <div className={styles.parentBox}>
                <div className={styles.paper}>
                    <Collapse
                        accordion
                        style={{ backgroundColor: 'transparent' }}
                        expandIconPosition="right"
                        bordered={false}
                        defaultActiveKey={['1']}
                        expandIcon={({ isActive }) =>
                            isActive ? (
                                <IoIosArrowDropdownCircle
                                    style={{ fontSize: '24px' }}
                                />
                            ) : (
                                <IoIosArrowDroprightCircle
                                    style={{ fontSize: '24px' }}
                                />
                            )
                        }
                    >
                        <Panel
                            style={{ marginBottom: '20px' }}
                            header={
                                <div
                                    style={{
                                        fontSize: '24px',
                                        fontWeight: 700,
                                        marginBottom: '20px',
                                    }}
                                >
                                    İlkin ödəniş
                                </div>
                            }
                            key="1"
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Checkbox
                                    onChange={event =>
                                        handleCheckbox(event.target.checked)
                                    }
                                    checked={checked}
                                    disabled={edit}
                                >
                                    Ödəniş et
                                </Checkbox>
                            </div>
                            <PaymentForm
                                setInitialPayment={setInitialPayment}
                                initialPayment={initialPayment}
                                checked={checked}
                                id={id}
                                invoiceInfo={invoiceInfo}
                                columns={columns}
                                form={form}
                                debt={selectedProducts?.[0]?.remainingDebt}
                                paymentDetails={invoicePaymentDetails}
                                amountPaid={getFieldValue('paymentAmount')}
                                updatePaymentDetails={updatePaymentDetails}
                                invoiceCurrencyCode={invoiceCurrencyCode}
                                paymentAccounts={paymentAccounts}
                                setPaymentAccounts={setPaymentAccounts}
                                edit={edit}
                            />
                        </Panel>
                    </Collapse>
                </div>
            </div>
        </Spin>
    );
};

const mapStateToProps = state => ({
    endPrice: state.salesOperation.endPrice,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    activePayments: state.salesOperation.activePayments,
    invoicePaymentDetails: state.salesOperation.invoicePaymentDetails,
    vatPaymentDetails: state.salesOperation.vatPaymentDetails,
    currencies: state.kassaReducer.currencies,
    invoicesLoading: state.loadings.invoiceListByContactId,
    invoiceInfoLoading: state.loadings.invoicesInfo,
});

export const Payment = connect(
    mapStateToProps,
    {
        setActivePayments,
        updatePaymentDetails,
        fetchCashboxNames,
        convertCurrency,
    }
)(PaymentPaper);
