/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Spin, Tooltip, Col, Collapse } from 'antd';
import {
    ProDatePicker,
    ProFormItem,
    ProSelect,
    ProInput,
    Table,
} from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { createCreditTable } from 'store/actions/finance/paymentTable';
import { fetchCreditType } from 'store/actions/settings/credit';
import { fetchUsers } from 'store/actions/users';
import { fetchClients } from 'store/actions/contacts-new';
import { fetchContracts } from 'store/actions/contracts';
import {
    fetchCurrencies,
    fetchMainCurrency,
} from 'store/actions/settings/kassa';
import {
    IoIosArrowDropdownCircle,
    IoIosArrowDroprightCircle,
} from 'react-icons/all';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    dateFormat,
    round,
} from 'utils';
import {
    handleResetInvoiceFields,
    handleEditInvoice,
    setSelectedProducts,
    updateInvoiceCurrencyCode,
} from 'store/actions/sales-operation';
import { fetchStocks } from 'store/actions/stock';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import { Summary } from './Summary';
import styles from '../styles.module.scss';

const { Panel } = Collapse;

const math = require('exact-math');

const CreditTerms = props => {
    const {
        // States
        summaries,
        rate,
        setInitialPayment,
        initialPayment,
        setSummaries,
        id,
        invoiceId,
        form,
        selectedProducts,
        invoiceCurrencyCode,
        creditPayment,
        setCreditPayment,
        creditPayments,
        selectedCreditType,
        setSelectedCreditType,
        createCreditTable,
        disabled,
        summary_types,
        initialRemainingDebt,
        initialPaymentTransactions,

        // Loadings
        createCreditTableLoading,
        invoiceInfoLoading,
        invoicesLoading,

        // DATA
        mainCurrency,
        creditTypes,

        // API
        fetchMainCurrency,
        fetchCreditType,
        fetchClients,
        fetchCurrencies,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        setFieldsValue,
        getFieldValue,
        setFields,
    } = form;

    const timeoutRef = useRef(null);

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 90,
            render: (_value, row, index) =>
                row.isTotal ? 'Toplam' : index + 1,
        },
        {
            title: 'Ödəniş tarixi',
            dataIndex: 'date',
            width: 130,
            render: date => date,
        },
        {
            title: 'Ödənilməlidir',
            dataIndex: 'totalMonthlyPaymentAmount',
            width: 150,
            align: 'right',
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Ödənilib',
            dataIndex: 'totalMonthlyPaymentAmount',
            width: 150,
            align: 'right',
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(
                        math.sub(
                            Number(value || 0),
                            Number(row.totalRemainingMonthlyPaymentAmount || 0)
                        )
                    )
                )} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Qalıq',
            dataIndex: 'totalRemainingMonthlyPaymentAmount',
            align: 'center',
            width: 150,
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value || 0))}
          ${invoiceCurrencyCode}`,
        },
        {
            title: 'Sənəd',
            width: 130,
            dataIndex: 'transactionMoneys',
            render: (value, row) =>
                row.isTotal ? null : value && value.length > 0 ? (
                    value.length > 1 ? (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            <span className={styles.ellipsisDiv}>
                                {value[0].documentNumber}
                            </span>
                            <Tooltip
                                placement="right"
                                title={
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        {value.map(structure => (
                                            <span>
                                                {structure.documentNumber}
                                            </span>
                                        ))}
                                    </div>
                                }
                            >
                                <span className={styles.serialNumberCount}>
                                    {value.length}
                                </span>
                            </Tooltip>
                        </div>
                    ) : (
                        value[0].documentNumber
                    )
                ) : (
                    '-'
                ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            width: 130,
            align: 'center',
            key: 'status',
            render: (value, row) =>
                row.isTotal ? null : value ? (
                    value === 1 ? (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#55AB80',
                                background: '#EBF5F0',
                            }}
                        >
                            Bağlı
                        </span>
                    ) : value === 2 ? (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#c0392b',
                                background: '#F6EEFC',
                            }}
                        >
                            Gecikir
                        </span>
                    ) : value === 3 ? (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#4E9CDF',
                                background: '#EAF3FB',
                            }}
                        >
                            Qalır
                        </span>
                    ) : (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#d35400',
                                background: '#ffecdb',
                            }}
                        >
                            Vaxtı çatıb
                        </span>
                    )
                ) : (
                    '-'
                ),
        },
        {
            title: 'Gecikmə (gün)',
            dataIndex: 'latenessDays',
            align: 'center',
            width: 140,
            render: (value, row) => (row.isTotal ? null : value || '-'),
        },
    ];

    useEffect(() => {
        fetchClients();
        fetchCurrencies();
        fetchMainCurrency();
    }, []);

    useEffect(() => {
        const totalPrice = id
            ? math.add(
                  Number(initialRemainingDebt || 0),
                  Number(getFieldValue('creditAmount') || 0),
                  Number(getFieldValue('depositAmount') || 0)
              )
            : math.sub(
                  math.add(
                      Number(initialRemainingDebt || 0),
                      Number(getFieldValue('creditAmount') || 0),
                      Number(getFieldValue('depositAmount') || 0)
                  ),
                  Number(
                      math.mul(
                          Number(rate || 1),
                          Number(initialPayment?.[0]?.initialPayment || 0)
                      )
                  )
              );
        const totalPayment = creditPayment?.reduce(
            (
                total,
                {
                    totalMonthlyPaymentAmount,
                    totalRemainingMonthlyPaymentAmount,
                }
            ) =>
                total +
                math.sub(
                    Number(totalMonthlyPaymentAmount || 0),
                    Number(totalRemainingMonthlyPaymentAmount || 0)
                ),
            0
        );
        const totalLatePayment = creditPayment
            ?.filter(credit => credit.status === 2)
            ?.reduce(
                (total, { totalRemainingMonthlyPaymentAmount }) =>
                    total + Number(totalRemainingMonthlyPaymentAmount || 0),
                0
            );
        const totalDebt = math.sub(Number(totalPrice || 0), totalPayment || 0);
        const paymentPercent =
            totalPrice > 0
                ? math.mul(math.div(totalPayment || 0, totalPrice), 100)
                : 0;
        const latePaymentPercent =
            totalPrice > 0
                ? math.mul(math.div(totalLatePayment, totalPrice), 100)
                : 0;
        const debtPercent =
            totalPrice > 0 ? math.mul(math.div(totalDebt, totalPrice), 100) : 0;

        const totals = [];
        summary_types.forEach(({ label, key }) =>
            totals.push({
                label,
                value:
                    key === 2
                        ? totalPayment || 0
                        : key === 3
                        ? totalLatePayment || 0
                        : key === 4
                        ? totalDebt
                        : totalPrice || 0,
                percent:
                    key === 2
                        ? paymentPercent
                        : key === 3
                        ? latePaymentPercent
                        : key === 4
                        ? debtPercent
                        : 100,
            })
        );
        setSummaries(totals);
    }, [
        initialPayment,
        rate,
        selectedProducts,
        getFieldValue('depositAmount'),
        getFieldValue('creditAmount'),
    ]);

    useEffect(() => {
        const selectedCredit = {
            depositPercentage: getFieldValue('depositPercentage') || 0,
            creditPercentage: getFieldValue('creditPercentage') || 0,
        };
        const newDepositAmount = id
            ? math.div(
                  math.mul(
                      Number(selectedCredit?.depositPercentage || 0),
                      Number(initialRemainingDebt || 0)
                  ),
                  100
              )
            : math.div(
                  math.mul(
                      Number(selectedCredit?.depositPercentage || 0),
                      math.sub(
                          Number(initialRemainingDebt || 0),
                          Number(
                              math.mul(
                                  Number(rate || 1),
                                  Number(
                                      initialPayment?.[0]?.initialPayment || 0
                                  )
                              )
                          )
                      )
                  ),
                  100
              );
        const newCreditAmount = id
            ? math.div(
                  math.mul(
                      Number(selectedCredit.creditPercentage || 0),
                      Number(initialRemainingDebt || 0)
                  ),
                  100
              )
            : math.div(
                  math.mul(
                      Number(selectedCredit.creditPercentage || 0),
                      math.sub(
                          Number(initialRemainingDebt || 0),
                          Number(
                              math.mul(
                                  Number(rate || 1),
                                  Number(
                                      initialPayment?.[0]?.initialPayment || 0
                                  )
                              )
                          )
                      )
                  ),
                  100
              );
        const month =
            getFieldValue('creditType') === 0
                ? getFieldValue('time')
                : selectedCreditType?.find(
                      item => item.id === getFieldValue('time')
                  )?.month;
        const monthlyPayment = id
            ? math.div(
                  math.add(
                      Number(initialRemainingDebt || 0),
                      Number(newCreditAmount || 0),
                      Number(newDepositAmount || 0)
                  ),
                  Number(month || 0)
              )
            : math.div(
                  math.add(
                      math.sub(
                          Number(initialRemainingDebt || 0),
                          Number(
                              math.mul(
                                  Number(rate || 1),
                                  Number(
                                      initialPayment?.[0]?.initialPayment || 0
                                  )
                              )
                          )
                      ),
                      Number(newCreditAmount || 0),
                      Number(newDepositAmount || 0)
                  ),
                  Number(month || 0)
              );

        setFieldsValue({
            creditPercentage: Number(selectedCredit.creditPercentage).toFixed(
                2
            ),
            depositPercentage: Number(selectedCredit.depositPercentage).toFixed(
                2
            ),
            creditAmount: Number(newCreditAmount).toFixed(2),
            depositAmount: Number(newDepositAmount).toFixed(2),
            monthlyPayment: round(Number(monthlyPayment || 0)),
        });
    }, [initialPayment?.[0]?.initialPayment]);

    useEffect(() => {
        const newPurchaseInvoice = {
            invoice: Number(invoiceId),
            creditType:
                getFieldValue('creditType') === 0
                    ? null
                    : getFieldValue('creditType'),
            creditAmount: Number(getFieldValue('creditAmount') || 0),
            depositAmount: Number(getFieldValue('depositAmount') || 0),
            monthlyPaymentAmount: Number(getFieldValue('monthlyPayment') || 0),
            startDate: getFieldValue('date')?.format(dateFormat),
            invoiceAmount: id
                ? Number(initialRemainingDebt || 0)
                : math.sub(
                      Number(initialRemainingDebt || 0),
                      Number(
                          math.mul(
                              Number(rate || 1),
                              Number(initialPayment?.[0]?.initialPayment || 0)
                          )
                      )
                  ),
        };
        if (
            newPurchaseInvoice.startDate &&
            Number(getFieldValue('monthlyPayment')) > 0
        ) {
            if (getFieldValue('creditType') === 0) {
                if (timeoutRef.current !== null) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    timeoutRef.current = null;
                    createCreditTable({
                        data: newPurchaseInvoice,
                        onSuccessCallback: ({ data }) => {
                            setCreditPayment(data);
                        },
                        onFailureCallback: ({ error }) => {
                            if (
                                error.response?.data?.error?.message ===
                                'Month limit has been exceeded. The limit is: 99'
                            ) {
                                toast.error(
                                    'Ödəniş cədvəlinin müddəti 99 aydan böyük ola bilməz'
                                );
                                setFieldsValue({
                                    monthlyPayment:
                                        newPurchaseInvoice.invoiceAmount,
                                });
                                handleMonthlyPaymentChange(
                                    newPurchaseInvoice.invoiceAmount
                                );
                            }
                        },
                    });
                }, 2000);
            } else {
                createCreditTable({
                    data: newPurchaseInvoice,
                    onSuccessCallback: ({ data }) => {
                        setCreditPayment(data);
                    },
                });
            }
        } else {
            setCreditPayment([]);
        }
    }, [getFieldValue('monthlyPayment'), getFieldValue('date')]);

    useEffect(() => {
        if (
            id &&
            Number(getFieldValue('monthlyPayment') || 0) >
                Number(
                    math.add(
                        Number(initialRemainingDebt || 0),
                        Number(getFieldValue('creditAmount') || 0),
                        Number(getFieldValue('depositAmount') || 0)
                    ) || 0
                )
        ) {
            setFields({
                monthlyPayment: {
                    name: 'monthlyPayment',
                    value: getFieldValue('monthlyPayment'),
                    errors: ['Aylıq ödəniş borcdan çox ola bilməz.'],
                },
            });
        } else if (
            Number(getFieldValue('monthlyPayment') || 0) >
            math.add(
                math.sub(
                    Number(initialRemainingDebt || 0),
                    Number(
                        math.mul(
                            Number(rate || 1),
                            Number(initialPayment?.[0]?.initialPayment || 0)
                        )
                    )
                ),
                Number(getFieldValue('creditAmount') || 0),
                Number(getFieldValue('depositAmount') || 0)
            )
        ) {
            setFields({
                monthlyPayment: {
                    name: 'monthlyPayment',
                    value: getFieldValue('monthlyPayment'),
                    errors: ['Aylıq ödəniş borcdan çox ola bilməz.'],
                },
            });
        }
    }, [getFieldValue('monthlyPayment')]);

    const getTotal = data => {
        let invoices = [];

        if (data?.length > 0) {
            const totalMonthlyPaymentAmount = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.totalMonthlyPaymentAmount)
                    ),
                0
            );
            const totalRemainingMonthlyPaymentAmount = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.totalRemainingMonthlyPaymentAmount)
                    ),
                0
            );

            invoices = [
                ...data,
                {
                    isTotal: true,
                    totalMonthlyPaymentAmount,
                    totalRemainingMonthlyPaymentAmount,
                },
            ];
        }
        return invoices;
    };

    const handleCreditTypeChange = value => {
        setFieldsValue({
            creditPercentage: undefined,
            creditAmount: undefined,
            depositAmount: undefined,
            depositPercentage: undefined,
            monthlyPayment: undefined,
        });
        if (value && value !== 0) {
            fetchCreditType({
                id: Number(value),
                onSuccessCallback: ({ data }) => {
                    setSelectedCreditType(data);
                    if (data.length === 1) {
                        setFieldsValue({ time: data[0].id });
                        const selectedCredit = data?.find(
                            item => item.id === data[0].id
                        );
                        const newDepositAmount = id
                            ? math.div(
                                  math.mul(
                                      Number(
                                          selectedCredit?.depositPercentage || 0
                                      ),
                                      Number(initialRemainingDebt || 0)
                                  ),
                                  100
                              )
                            : math.div(
                                  math.mul(
                                      Number(
                                          selectedCredit?.depositPercentage || 0
                                      ),
                                      math.sub(
                                          Number(initialRemainingDebt || 0),
                                          Number(
                                              math.mul(
                                                  Number(rate || 1),
                                                  Number(
                                                      initialPayment?.[0]
                                                          ?.initialPayment || 0
                                                  )
                                              )
                                          )
                                      )
                                  ),
                                  100
                              );
                        const newCreditAmount = id
                            ? math.div(
                                  math.mul(
                                      Number(
                                          selectedCredit?.creditPercentage || 0
                                      ),
                                      Number(initialRemainingDebt || 0)
                                  ),
                                  100
                              )
                            : math.div(
                                  math.mul(
                                      Number(
                                          selectedCredit?.creditPercentage || 0
                                      ),
                                      math.sub(
                                          Number(initialRemainingDebt || 0),
                                          Number(
                                              math.mul(
                                                  Number(rate || 1),
                                                  Number(
                                                      initialPayment?.[0]
                                                          ?.initialPayment || 0
                                                  )
                                              )
                                          )
                                      )
                                  ),
                                  100
                              );
                        handleTimeChange(selectedCredit?.month, selectedCredit);
                        setFieldsValue({
                            creditPercentage: Number(
                                selectedCredit?.creditPercentage
                            ).toFixed(2),
                            depositPercentage: Number(
                                selectedCredit?.depositPercentage
                            ).toFixed(2),
                            creditAmount: Number(newCreditAmount).toFixed(2),
                            depositAmount: Number(newDepositAmount).toFixed(2),
                            monthlyPayment: round(
                                math.div(
                                    math.add(
                                        math.sub(
                                            Number(initialRemainingDebt || 0),
                                            Number(
                                                math.mul(
                                                    Number(rate || 1),
                                                    Number(
                                                        initialPayment?.[0]
                                                            ?.initialPayment ||
                                                            0
                                                    )
                                                )
                                            )
                                        ),
                                        Number(newCreditAmount || 0),
                                        Number(newDepositAmount || 0)
                                    ),
                                    Number(selectedCredit.month)
                                )
                            ),
                        });
                    } else {
                        setFieldsValue({ time: undefined });
                    }
                },
            });
        } else {
            setFieldsValue({
                time: 1,
                creditPercentage: 0,
                creditAmount: 0,
                depositAmount: 0,
                depositPercentage: 0,
            });
            handleTimeChange(1, { depositPercentage: 0, creditPercentage: 0 });
        }
    };

    const handleAmount = (event, field, percentage = false) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (percentage) {
            if (
                re.test(event.target.value) &&
                Number(event.target.value) < 1000
            ) {
                return event.target.value;
            }
        } else if (re.test(event.target.value)) return event.target.value;

        if (event.target.value === '') return null;
        return getFieldValue(field);
    };

    const handleTimeChange = (month, selectedCredit) => {
        if (month) {
            const newDepositAmount = math.div(
                math.mul(
                    Number(selectedCredit?.depositPercentage || 0),
                    math.sub(
                        Number(initialRemainingDebt || 0),
                        Number(
                            math.mul(
                                Number(rate || 1),
                                Number(initialPayment?.[0]?.initialPayment || 0)
                            )
                        )
                    )
                ),
                100
            );
            const newCreditAmount = id
                ? math.div(
                      math.mul(
                          Number(selectedCredit?.creditPercentage || 0),
                          Number(initialRemainingDebt || 0)
                      ),
                      100
                  )
                : math.div(
                      math.mul(
                          Number(selectedCredit?.creditPercentage || 0),
                          math.sub(
                              Number(initialRemainingDebt || 0),
                              Number(
                                  math.mul(
                                      Number(rate || 1),
                                      Number(
                                          initialPayment?.[0]?.initialPayment ||
                                              0
                                      )
                                  )
                              )
                          )
                      ),
                      100
                  );
            const monthlyPayment = id
                ? math.div(
                      math.add(
                          Number(initialRemainingDebt || 0),
                          Number(newCreditAmount || 0),
                          Number(newDepositAmount || 0)
                      ),
                      Number(month)
                  )
                : math.div(
                      math.add(
                          math.sub(
                              Number(initialRemainingDebt || 0),
                              Number(
                                  math.mul(
                                      Number(rate || 1),
                                      Number(
                                          initialPayment?.[0]?.initialPayment ||
                                              0
                                      )
                                  )
                              )
                          ),
                          Number(newCreditAmount || 0),
                          Number(newDepositAmount || 0)
                      ),
                      Number(month)
                  );

            setFieldsValue({
                monthlyPayment: round(Number(monthlyPayment || 0)),
            });
        } else {
            setFieldsValue({
                monthlyPayment: round(0),
            });
        }
    };

    const handleMonthlyPaymentChange = payment => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(payment)) {
            const selected = {
                depositPercentage: getFieldValue('depositPercentage') || 0,
                creditPercentage: getFieldValue('creditPercentage') || 0,
            };

            const newDepositAmount = id
                ? math.div(
                      math.mul(
                          Number(selected?.depositPercentage || 0),
                          Number(initialRemainingDebt || 0)
                      ),
                      100
                  )
                : math.div(
                      math.mul(
                          Number(selected?.depositPercentage || 0),
                          math.sub(
                              Number(initialRemainingDebt || 0),
                              Number(
                                  math.mul(
                                      Number(rate || 1),
                                      Number(
                                          initialPayment?.[0]?.initialPayment ||
                                              0
                                      )
                                  )
                              )
                          )
                      ),
                      100
                  );
            const newCreditAmount = id
                ? math.div(
                      math.mul(
                          Number(selected.creditPercentage || 0),
                          Number(initialRemainingDebt || 0)
                      ),
                      100
                  )
                : math.div(
                      math.mul(
                          Number(selected.creditPercentage || 0),
                          math.sub(
                              Number(initialRemainingDebt || 0),
                              Number(
                                  math.mul(
                                      Number(rate || 1),
                                      Number(
                                          initialPayment?.[0]?.initialPayment ||
                                              0
                                      )
                                  )
                              )
                          )
                      ),
                      100
                  );
            const month = id
                ? math.div(
                      math.add(
                          Number(initialRemainingDebt || 0),
                          Number(newCreditAmount || 0),
                          Number(newDepositAmount || 0)
                      ),
                      Number(payment)
                  )
                : math.div(
                      math.add(
                          math.sub(
                              Number(initialRemainingDebt || 0),
                              Number(
                                  math.mul(
                                      Number(rate || 1),
                                      Number(
                                          initialPayment?.[0]?.initialPayment ||
                                              0
                                      )
                                  )
                              )
                          ),
                          Number(newCreditAmount || 0),
                          Number(newDepositAmount || 0)
                      ),
                      Number(payment)
                  );
            setFieldsValue({
                time: Number(Math.ceil(month) || 0),
            });
        }
    };

    const getMonthlyPayment = (creditAmount, depositAmount, month) =>
        id
            ? math.div(
                  math.add(
                      Number(initialRemainingDebt || 0),
                      Number(creditAmount || 0),
                      Number(depositAmount || 0)
                  ),
                  Number(month)
              )
            : math.div(
                  math.add(
                      math.sub(
                          Number(initialRemainingDebt || 0),
                          Number(
                              math.mul(
                                  Number(rate || 1),
                                  Number(
                                      initialPayment?.[0]?.initialPayment || 0
                                  )
                              )
                          )
                      ),
                      Number(creditAmount || 0),
                      Number(depositAmount || 0)
                  ),
                  Number(month)
              );

    const handleCreditChange = (value, type) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        const time =
            getFieldValue('creditType') === 0
                ? getFieldValue('time')
                : selectedCreditType.find(
                      ({ id }) => id === getFieldValue('time')
                  )?.month;
        if (
            type === 'percentage' &&
            re.test(Number(value)) &&
            Number(value) < 1000
        ) {
            const AMOUNT = id
                ? math
                      .div(
                          math.mul(
                              Number(value || 0),
                              Number(initialRemainingDebt || 0)
                          ),
                          100
                      )
                      .toFixed(2)
                : math
                      .div(
                          math.mul(
                              Number(value || 0),
                              math.sub(
                                  Number(initialRemainingDebt || 0),
                                  Number(
                                      math.mul(
                                          Number(rate || 1),
                                          Number(
                                              initialPayment?.[0]
                                                  ?.initialPayment || 0
                                          )
                                      )
                                  )
                              )
                          ),
                          100
                      )
                      .toFixed(2);
            setFieldsValue({
                creditAmount: AMOUNT,
                monthlyPayment: round(
                    Number(
                        getMonthlyPayment(
                            AMOUNT,
                            getFieldValue('depositAmount'),
                            time
                        ) || 0
                    )
                ),
            });
        }
        if (type === 'amount' && re.test(value)) {
            const PERCENTAGE = id
                ? math
                      .div(
                          math.mul(Number(value || 0), 100),
                          Number(initialRemainingDebt || 0) || 1
                      )
                      .toFixed(2)
                : math
                      .div(
                          math.mul(Number(value || 0), 100),
                          Number(
                              math.sub(
                                  Number(initialRemainingDebt || 0),
                                  Number(
                                      math.mul(
                                          Number(rate || 1),
                                          Number(
                                              initialPayment?.[0]
                                                  ?.initialPayment || 0
                                          )
                                      )
                                  )
                              ) || 1
                          )
                      )
                      .toFixed(2);
            setFieldsValue({
                creditPercentage: PERCENTAGE,
                monthlyPayment: round(
                    Number(
                        getMonthlyPayment(
                            value,
                            getFieldValue('depositAmount'),
                            time
                        ) || 0
                    )
                ),
            });
        }
    };

    const handleDepositChange = (value, type) => {
        const time =
            getFieldValue('creditType') === 0
                ? getFieldValue('time')
                : selectedCreditType.find(
                      ({ id }) => id === getFieldValue('time')
                  )?.month;
        if (type === 'percentage') {
            const AMOUNT = id
                ? math
                      .div(
                          math.mul(
                              Number(value || 0),
                              math.sub(
                                  Number(initialRemainingDebt || 0),
                                  Number(
                                      math.mul(
                                          Number(rate || 1),
                                          Number(
                                              initialPayment?.[0]
                                                  ?.initialPayment || 0
                                          )
                                      )
                                  )
                              )
                          ),
                          100
                      )
                      .toFixed(2)
                : math
                      .div(
                          math.mul(
                              Number(value || 0),
                              math.sub(
                                  Number(initialRemainingDebt || 0),
                                  Number(
                                      math.mul(
                                          Number(rate || 1),
                                          Number(
                                              initialPayment?.[0]
                                                  ?.initialPayment || 0
                                          )
                                      )
                                  )
                              )
                          ),
                          100
                      )
                      .toFixed(2);
            setFieldsValue({
                depositAmount: AMOUNT,
                monthlyPayment: round(
                    Number(
                        getMonthlyPayment(
                            AMOUNT,
                            getFieldValue('creditAmount'),
                            time
                        ) || 0
                    )
                ),
            });
        }
        if (type === 'amount') {
            const PERCENTAGE = id
                ? math
                      .div(
                          math.mul(Number(value || 0), 100),
                          Number(initialRemainingDebt || 0) || 1
                      )
                      .toFixed(2)
                : math
                      .div(
                          math.mul(Number(value || 0), 100),
                          Number(
                              math.sub(
                                  Number(initialRemainingDebt || 0),
                                  Number(
                                      math.mul(
                                          Number(rate || 1),
                                          Number(
                                              initialPayment?.[0]
                                                  ?.initialPayment || 0
                                          )
                                      )
                                  )
                              ) || 1
                          )
                      )
                      .toFixed(2);
            setFieldsValue({
                depositPercentage: PERCENTAGE,
                monthlyPayment: round(
                    Number(
                        getMonthlyPayment(
                            value,
                            getFieldValue('creditAmount'),
                            time
                        ) || 0
                    )
                ),
            });
        }
    };

    return (
        <>
            <div>
                <Spin spinning={invoiceInfoLoading || invoicesLoading}>
                    <div className={styles.summaryBox}>
                        {summaries.map(({ label, value, percent }) => (
                            <Col span={6} className={styles.summaryCol}>
                                <Summary
                                    label={label}
                                    value={value}
                                    percent={percent}
                                    mainCurrency={invoiceCurrencyCode}
                                />
                            </Col>
                        ))}
                    </div>
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
                            header={
                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '22px',
                                    }}
                                >
                                    Kredit növü
                                </div>
                            }
                            key="1"
                            className={styles.collapse}
                        >
                            <div className={styles.fieldsContainer}>
                                <div className={styles.field}>
                                    <ProFormItem label="İlkin ödəniş">
                                        <p>
                                            {id
                                                ? formatNumberToLocale(
                                                      defaultNumberFormat(
                                                          initialPaymentTransactions.reduce(
                                                              (
                                                                  total,
                                                                  {
                                                                      invoicePaymentAmountConvertedToInvoiceCurrency,
                                                                  }
                                                              ) =>
                                                                  total +
                                                                  Number(
                                                                      invoicePaymentAmountConvertedToInvoiceCurrency
                                                                  ),
                                                              0
                                                          )
                                                      )
                                                  )
                                                : formatNumberToLocale(
                                                      defaultNumberFormat(
                                                          math.add(
                                                              Number(
                                                                  initialPaymentTransactions.reduce(
                                                                      (
                                                                          total,
                                                                          {
                                                                              invoicePaymentAmountConvertedToInvoiceCurrency,
                                                                          }
                                                                      ) =>
                                                                          total +
                                                                          Number(
                                                                              invoicePaymentAmountConvertedToInvoiceCurrency
                                                                          ),
                                                                      0
                                                                  )
                                                              ),
                                                              math.mul(
                                                                  Number(
                                                                      rate || 1
                                                                  ),
                                                                  Number(
                                                                      initialPayment?.[0]
                                                                          ?.initialPayment ||
                                                                          0
                                                                  )
                                                              )
                                                          )
                                                      )
                                                  )}{' '}
                                            {invoiceCurrencyCode}
                                        </p>
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}>
                                    <ProFormItem label="Qalıq borc (Kredit məbləği)">
                                        {id
                                            ? formatNumberToLocale(
                                                  defaultNumberFormat(
                                                      Number(
                                                          initialRemainingDebt ||
                                                              0
                                                      )
                                                  )
                                              )
                                            : formatNumberToLocale(
                                                  defaultNumberFormat(
                                                      math.sub(
                                                          Number(
                                                              initialRemainingDebt ||
                                                                  0
                                                          ),
                                                          Number(
                                                              math.mul(
                                                                  Number(
                                                                      rate || 1
                                                                  ),
                                                                  Number(
                                                                      initialPayment?.[0]
                                                                          ?.initialPayment ||
                                                                          0
                                                                  )
                                                              )
                                                          )
                                                      )
                                                  )
                                              )}{' '}
                                        {invoiceCurrencyCode}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}></div>
                                <div className={styles.field}>
                                    <ProFormItem label="Ödəniş cədvəlinə gedəcək məbləğ">
                                        {id
                                            ? formatNumberToLocale(
                                                  defaultNumberFormat(
                                                      math.add(
                                                          Number(
                                                              initialRemainingDebt ||
                                                                  0
                                                          ),
                                                          Number(
                                                              getFieldValue(
                                                                  'creditAmount'
                                                              ) || 0
                                                          ),
                                                          Number(
                                                              getFieldValue(
                                                                  'depositAmount'
                                                              ) || 0
                                                          )
                                                      )
                                                  )
                                              )
                                            : formatNumberToLocale(
                                                  defaultNumberFormat(
                                                      math.add(
                                                          math.sub(
                                                              Number(
                                                                  initialRemainingDebt ||
                                                                      0
                                                              ),
                                                              Number(
                                                                  math.mul(
                                                                      Number(
                                                                          rate ||
                                                                              1
                                                                      ),
                                                                      Number(
                                                                          initialPayment?.[0]
                                                                              ?.initialPayment ||
                                                                              0
                                                                      )
                                                                  )
                                                              )
                                                          ),
                                                          Number(
                                                              getFieldValue(
                                                                  'creditAmount'
                                                              ) || 0
                                                          ),
                                                          Number(
                                                              getFieldValue(
                                                                  'depositAmount'
                                                              ) || 0
                                                          )
                                                      )
                                                  )
                                              )}{' '}
                                        {invoiceCurrencyCode}
                                    </ProFormItem>
                                </div>

                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Kredit növü"
                                        help={getFieldError('creditType')?.[0]}
                                    >
                                        {getFieldDecorator('creditType', {
                                            getValueFromEvent: creditType =>
                                                creditType,
                                            rules: disabled
                                                ? []
                                                : [requiredRule],
                                        })(
                                            <ProSelect
                                                allowClear={false}
                                                placeholder="Seçin"
                                                onChange={event =>
                                                    handleCreditTypeChange(
                                                        event
                                                    )
                                                }
                                                data={
                                                    !id ||
                                                    creditPayments?.find(
                                                        ({ creditId }) =>
                                                            creditId ===
                                                            Number(id)
                                                    )?.creditTypeId === 0
                                                        ? [
                                                              {
                                                                  id: 0,
                                                                  name:
                                                                      'Sərbəst',
                                                              },
                                                              ...creditTypes,
                                                          ]
                                                        : creditTypes
                                                              .map(
                                                                  ({ id }) => id
                                                              )
                                                              .includes(
                                                                  creditPayments?.find(
                                                                      ({
                                                                          creditId,
                                                                      }) =>
                                                                          creditId ===
                                                                          Number(
                                                                              id
                                                                          )
                                                                  )
                                                                      ?.creditTypeId
                                                              )
                                                        ? [
                                                              {
                                                                  id: 0,
                                                                  name:
                                                                      'Sərbəst',
                                                              },
                                                              ...creditTypes,
                                                          ]
                                                        : [
                                                              {
                                                                  id: 0,
                                                                  name:
                                                                      'Sərbəst',
                                                              },
                                                              {
                                                                  id: creditPayments?.find(
                                                                      ({
                                                                          creditId,
                                                                      }) =>
                                                                          creditId ===
                                                                          Number(
                                                                              id
                                                                          )
                                                                  )
                                                                      ?.creditTypeId,
                                                                  name: creditPayments?.find(
                                                                      ({
                                                                          creditId,
                                                                      }) =>
                                                                          creditId ===
                                                                          Number(
                                                                              id
                                                                          )
                                                                  )
                                                                      ?.creditTypeName,
                                                              },
                                                              ...creditTypes,
                                                          ]
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Kredit faizi"
                                        help={
                                            getFieldError(
                                                'creditPercentage'
                                            )?.[0]
                                        }
                                    >
                                        {getFieldDecorator('creditPercentage', {
                                            getValueFromEvent: event =>
                                                handleAmount(
                                                    event,
                                                    'creditPercentage',
                                                    true
                                                ),
                                            rules: disabled
                                                ? []
                                                : [requiredRule],
                                        })(
                                            <ProInput
                                                onChange={event =>
                                                    handleCreditChange(
                                                        event.target.value,
                                                        'percentage'
                                                    )
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Kredit faizi məbləği"
                                        help={
                                            getFieldError('creditAmount')?.[0]
                                        }
                                    >
                                        {getFieldDecorator('creditAmount', {
                                            getValueFromEvent: event =>
                                                handleAmount(
                                                    event,
                                                    'creditAmount'
                                                ),
                                            rules: disabled
                                                ? []
                                                : [requiredRule],
                                        })(
                                            <ProInput
                                                onChange={event =>
                                                    handleCreditChange(
                                                        event.target.value,
                                                        'amount'
                                                    )
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Aylıq ödəniş"
                                        help={
                                            getFieldError('monthlyPayment')?.[0]
                                        }
                                    >
                                        {getFieldDecorator('monthlyPayment', {
                                            getValueFromEvent: event =>
                                                handleAmount(
                                                    event,
                                                    'monthlyPayment'
                                                ),
                                            rules: disabled
                                                ? []
                                                : [requiredRule],
                                        })(
                                            <ProInput
                                                onChange={event =>
                                                    handleMonthlyPaymentChange(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    getFieldValue(
                                                        'creditType'
                                                    ) !== 0
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Müddət (Ay)/Dəfə"
                                        help={getFieldError('time')?.[0]}
                                    >
                                        {getFieldDecorator('time', {
                                            getValueFromEvent: time => {
                                                if (
                                                    getFieldValue(
                                                        'creditType'
                                                    ) === 0
                                                ) {
                                                    const re = /^[0-9]{1,9}$/;
                                                    if (
                                                        re.test(
                                                            time.target.value
                                                        ) &&
                                                        Number(
                                                            time.target.value
                                                        ) > 0 &&
                                                        Number(
                                                            time.target.value
                                                        ) < 100
                                                    ) {
                                                        const selected = {
                                                            depositPercentage:
                                                                getFieldValue(
                                                                    'depositPercentage'
                                                                ) || 0,
                                                            creditPercentage:
                                                                getFieldValue(
                                                                    'creditPercentage'
                                                                ) || 0,
                                                        };
                                                        handleTimeChange(
                                                            time.target.value,
                                                            selected
                                                        );
                                                        return time.target
                                                            .value;
                                                    }
                                                    if (
                                                        time.target.value === ''
                                                    )
                                                        return null;
                                                    return getFieldValue(
                                                        'time'
                                                    );
                                                }
                                                const selectedCredit = selectedCreditType?.find(
                                                    item => item.id === time
                                                );
                                                const newDepositAmount = id
                                                    ? math.div(
                                                          math.mul(
                                                              Number(
                                                                  selectedCredit?.depositPercentage ||
                                                                      0
                                                              ),
                                                              Number(
                                                                  initialRemainingDebt ||
                                                                      0
                                                              )
                                                          ),
                                                          100
                                                      )
                                                    : math.div(
                                                          math.mul(
                                                              Number(
                                                                  selectedCredit?.depositPercentage ||
                                                                      0
                                                              ),
                                                              math.sub(
                                                                  Number(
                                                                      initialRemainingDebt ||
                                                                          0
                                                                  ),
                                                                  Number(
                                                                      math.mul(
                                                                          Number(
                                                                              rate ||
                                                                                  1
                                                                          ),
                                                                          Number(
                                                                              initialPayment?.[0]
                                                                                  ?.initialPayment ||
                                                                                  0
                                                                          )
                                                                      )
                                                                  )
                                                              )
                                                          ),
                                                          100
                                                      );
                                                const newCreditAmount = id
                                                    ? math.div(
                                                          math.mul(
                                                              Number(
                                                                  selectedCredit?.creditPercentage ||
                                                                      0
                                                              ),
                                                              Number(
                                                                  initialRemainingDebt ||
                                                                      0
                                                              )
                                                          ),
                                                          100
                                                      )
                                                    : math.div(
                                                          math.mul(
                                                              Number(
                                                                  selectedCredit?.creditPercentage ||
                                                                      0
                                                              ),
                                                              math.sub(
                                                                  Number(
                                                                      initialRemainingDebt ||
                                                                          0
                                                                  ),
                                                                  Number(
                                                                      math.mul(
                                                                          Number(
                                                                              rate ||
                                                                                  1
                                                                          ),
                                                                          Number(
                                                                              initialPayment?.[0]
                                                                                  ?.initialPayment ||
                                                                                  0
                                                                          )
                                                                      )
                                                                  )
                                                              )
                                                          ),
                                                          100
                                                      );
                                                handleTimeChange(
                                                    selectedCredit?.month,
                                                    selectedCredit
                                                );
                                                setFieldsValue({
                                                    creditPercentage: Number(
                                                        selectedCredit?.creditPercentage ||
                                                            0
                                                    ).toFixed(2),
                                                    depositPercentage: Number(
                                                        selectedCredit?.depositPercentage ||
                                                            0
                                                    ).toFixed(2),
                                                    creditAmount: Number(
                                                        newCreditAmount
                                                    ).toFixed(2),
                                                    depositAmount: Number(
                                                        newDepositAmount
                                                    ).toFixed(2),
                                                    monthlyPayment: id
                                                        ? round(
                                                              math.div(
                                                                  math.add(
                                                                      Number(
                                                                          initialRemainingDebt ||
                                                                              0
                                                                      ),
                                                                      Number(
                                                                          newCreditAmount ||
                                                                              0
                                                                      ),
                                                                      Number(
                                                                          newDepositAmount ||
                                                                              0
                                                                      )
                                                                  ),
                                                                  Number(
                                                                      selectedCredit?.month ||
                                                                          1
                                                                  )
                                                              )
                                                          )
                                                        : round(
                                                              math.div(
                                                                  math.add(
                                                                      math.sub(
                                                                          Number(
                                                                              initialRemainingDebt ||
                                                                                  0
                                                                          ),
                                                                          Number(
                                                                              math.mul(
                                                                                  Number(
                                                                                      rate ||
                                                                                          1
                                                                                  ),
                                                                                  Number(
                                                                                      initialPayment?.[0]
                                                                                          ?.initialPayment ||
                                                                                          0
                                                                                  )
                                                                              )
                                                                          )
                                                                      ),
                                                                      Number(
                                                                          newCreditAmount ||
                                                                              0
                                                                      ),
                                                                      Number(
                                                                          newDepositAmount ||
                                                                              0
                                                                      )
                                                                  ),
                                                                  Number(
                                                                      selectedCredit?.month ||
                                                                          1
                                                                  )
                                                              )
                                                          ),
                                                });
                                                return time;
                                            },
                                            rules: disabled
                                                ? []
                                                : [requiredRule],
                                        })(
                                            getFieldValue('creditType') ===
                                                0 ? (
                                                <ProInput />
                                            ) : (
                                                <ProSelect
                                                    // loading={stocksLoading}
                                                    placeholder="Seçin"
                                                    data={selectedCreditType}
                                                    disabled={
                                                        getFieldValue(
                                                            'creditType'
                                                        ) === undefined
                                                    }
                                                    keys={['month']}
                                                />
                                            )
                                        )}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Depozit faizi"
                                        help={
                                            getFieldError(
                                                'depositPercentage'
                                            )?.[0]
                                        }
                                    >
                                        {getFieldDecorator(
                                            'depositPercentage',
                                            {
                                                getValueFromEvent: event =>
                                                    handleAmount(
                                                        event,
                                                        'depositPercentage',
                                                        true
                                                    ),
                                                rules: disabled
                                                    ? []
                                                    : [requiredRule],
                                            }
                                        )(
                                            <ProInput
                                                onChange={event =>
                                                    handleDepositChange(
                                                        event.target.value,
                                                        'percentage'
                                                    )
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="Depozit məbləği"
                                        help={
                                            getFieldError('depositAmount')?.[0]
                                        }
                                    >
                                        {getFieldDecorator('depositAmount', {
                                            getValueFromEvent: event =>
                                                handleAmount(
                                                    event,
                                                    'depositAmount'
                                                ),
                                            rules: disabled
                                                ? []
                                                : [requiredRule],
                                        })(
                                            <ProInput
                                                onChange={event =>
                                                    handleDepositChange(
                                                        event.target.value,
                                                        'amount'
                                                    )
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                                <div className={styles.field}>
                                    <ProFormItem
                                        label="İlkin ödəniş tarixi"
                                        help={getFieldError('date')?.[0]}
                                    >
                                        {getFieldDecorator('date', {
                                            rules: disabled
                                                ? []
                                                : [requiredRule],
                                        })(
                                            <ProDatePicker
                                                size="large"
                                                format={dateFormat}
                                                allowClear={false}
                                                placeholder="Seçin"
                                                disabledDate={d =>
                                                    !d ||
                                                    d.isBefore(
                                                        moment(
                                                            getFieldValue(
                                                                'dateTime'
                                                            ),
                                                            dateFormat
                                                        ).subtract(1, 'day')
                                                    )
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                            </div>
                            <Table
                                className={styles.creditTablesTable}
                                columns={columns}
                                rowKey={row => row.id}
                                dataSource={getTotal(creditPayment)}
                                loading={createCreditTableLoading}
                            />
                        </Panel>
                    </Collapse>
                </Spin>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    users: state.usersReducer.users,
    clients: state.contactsReducer.clients,
    contracts: state.contractsReducer.contracts,
    currencies: state.kassaReducer.currencies,
    endPrice: state.salesOperation.endPrice,
    contractDetails: state.salesOperation.contractDetails,
    selectedProducts: state.salesOperation.selectedProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    products: state.salesOperation.productsByName,
    profile: state.profileReducer.profile, // used for operator id
    mainCurrency: state.kassaReducer.mainCurrency,
    invoiceInfoLoading: state.loadings.invoicesInfo,
    invoicesLoading: state.loadings.invoiceListByContactId,
    createCreditTableLoading: state.loadings.createCreditTable,
    allProducts: state.productReducer.products,

    creditTypes: state.creditReducer.creditTypes,
});

export default connect(
    mapStateToProps,
    {
        handleResetInvoiceFields,
        handleEditInvoice,
        // API
        fetchUsers,
        fetchContracts,
        fetchCurrencies,
        fetchClients,
        fetchStocks,
        updateInvoiceCurrencyCode,
        fetchMainCurrency,
        setSelectedProducts,
        fetchCreditType,
        createCreditTable,
    }
)(CreditTerms);
