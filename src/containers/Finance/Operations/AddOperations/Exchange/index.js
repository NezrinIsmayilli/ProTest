/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { cookies } from 'utils/cookies';
import moment from 'moment';
import { fetchAccountBalance } from 'store/actions/finance/operations';
import {
    fetchAllCashboxNames,
    fetchMainCurrency,
    fetchCurrencies,
    convertCurrency,
} from 'store/actions/settings/kassa';
import { Button, Form, Row, Col, Tooltip } from 'antd';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { FaChevronRight } from 'react-icons/fa';
import {
    ProDatePicker,
    ProSelect,
    ProFormItem,
    ProInput,
    ProTextArea,
} from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { roundToDown, fullDateTimeWithSecond, round } from 'utils';
import {
    createOperationExchange,
    editOperationExchange,
} from 'store/actions/finance/initialBalance';
import { toast } from 'react-toastify';
import AddAccount from '../shared/AddAccount';
import styles from '../styles.module.scss';
import { TypeOfPayment, AccountBalance, ExchangeRate } from '../shared';

const BigNumber = require('bignumber.js');
const math = require('exact-math');

function disabledDate(current) {
    return current && current >= moment().endOf('day');
}

function Exchange(props) {
    const {
        allCashBoxNames,
        mainCurrency,
        fetchAccountBalance,
        fetchAllCashboxNames,
        createOperationExchange,
        editOperationExchange,
        fetchMainCurrency,
        convertCurrency,
        fetchCurrencies,
        currencies,
        balanceLoading,
        convertLoading,
        returnUrl,
        editId,
        form,
        operationsList,
        currenciesLoading,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    const [exchangeData, setExchangeData] = useState({
        rate: undefined,
        paymentType: 1,
    });
    const [notRoundedRate, setNotRoundedRate] = useState(undefined);
    const [rateStatus, setRateStatus] = useState(true);
    const [accountBalances, setAccountBalances] = useState([]);
    const [loader, setLoader] = useState(false);
    const history = useHistory();
    const [accountVisible, SetaccountVisible] = useState(false);
    const [addedAccount, SetAddedAccount] = useState(null);

    const handleAccount = () => {
        SetAddedAccount(null);
        SetaccountVisible(true);
        if (editId) {
            cookies.set(
                '_TKN_UNIT_',
                operationsList[0]?.businessUnitId === null
                    ? 0
                    : operationsList[0]?.businessUnitId
            );
        }
    };

    useEffect(() => {
        if (editId && operationsList?.length > 0) {
            const fromData = operationsList.find(
                ({ cashInOrCashOut }) => cashInOrCashOut === -1
            );
            const toData = operationsList.find(
                ({ cashInOrCashOut }) => cashInOrCashOut === 1
            );
            setFieldsValue({
                fromCurrency: fromData.currencyId,
                toCurrency: toData.currencyId,
                fromAmount: round(fromData.amount),
                toAmount: round(toData.amount),
                dateOfTransaction: moment(
                    fromData.dateOfTransaction,
                    fullDateTimeWithSecond
                ),
                account: fromData.cashboxId,
            });
            handleChangeRate(
                operationsList[0]?.exchangeRate,
                operationsList[0]?.paymentTypeId
            );
        } else {
            setFieldsValue({
                dateOfTransaction: moment(),
            });
        }
    }, [editId, operationsList]);

    const handleChangeRate = (
        operationRate,
        paymentType,
        fromCurrency,
        toCurrency,
        dateOfTransaction
    ) => {
        if (operationRate) {
            setNotRoundedRate(new BigNumber(operationRate));
            setExchangeData(prevData => ({
                ...prevData,
                rate: roundToDown(Number(operationRate)),
                paymentType: paymentType || prevData.paymentType,
            }));
        } else {
            convertCurrency({
                params: {
                    fromCurrencyId:
                        fromCurrency || getFieldValue('fromCurrency'),
                    toCurrencyId: toCurrency || getFieldValue('toCurrency'),
                    amount: 1,
                    dateTime: (
                        dateOfTransaction || getFieldValue('dateOfTransaction')
                    ).format(fullDateTimeWithSecond),
                },
                onSuccessCallback: ({ data }) => {
                    const { rate } = data;
                    setNotRoundedRate(new BigNumber(rate));
                    setExchangeData(prevData => ({
                        ...prevData,
                        rate: roundToDown(Number(rate)),
                    }));
                },
            });
        }
    };
    useEffect(() => {
        fetchCurrencies({ limit: 1000 });
        fetchMainCurrency();
    }, []);

    useEffect(() => {
        if (editId) {
            if (operationsList) {
                fetchAllCashboxNames({
                    businessUnitIds:
                        operationsList[0]?.businessUnitId === null
                            ? [0]
                            : [operationsList[0]?.businessUnitId],
                    limit: 1000,
                });
            }
        } else if (cookies.get('_TKN_UNIT_')) {
            fetchAllCashboxNames({
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
                limit: 1000,
            });
        } else {
            fetchAllCashboxNames({ limit: 1000 });
        }
    }, [cookies.get('_TKN_UNIT_'), editId, operationsList]);

    useEffect(() => {
        if (!editId) {
            setFieldsValue({
                fromCurrency: mainCurrency?.id,
            });
        }
    }, [mainCurrency, editId]);
    useEffect(() => {
        if (accountBalances.length > 0 && !editId) {
            const fromCurrencyExists = accountBalances.find(
                balance =>
                    balance.tenantCurrencyId === getFieldValue('fromCurrency')
            );
            const toCurrencyExists = accountBalances.find(
                balance =>
                    balance.tenantCurrencyId === getFieldValue('toCurrency')
            );
            if (
                fromCurrencyExists &&
                Object.keys(fromCurrencyExists).length !== 0
            ) {
                setFieldsValue({
                    fromCurrency: fromCurrencyExists?.tenantCurrencyId,
                });
            } else {
                setFieldsValue({
                    fromCurrency: undefined,
                });
            }
            if (
                toCurrencyExists &&
                Object.keys(toCurrencyExists).length !== 0
            ) {
                setFieldsValue({
                    toCurrency: toCurrencyExists?.tenantCurrencyId,
                });
            } else {
                setFieldsValue({
                    toCurrency: undefined,
                });
            }
        }
    }, [accountBalances, editId]);

    useEffect(() => {
        if (rateStatus && !editId) {
            if (getFieldValue('toCurrency') && getFieldValue('fromCurrency')) {
                convertCurrency({
                    params: {
                        fromCurrencyId: getFieldValue('fromCurrency'),
                        toCurrencyId: getFieldValue('toCurrency'),
                        amount: 1,
                        dateTime: getFieldValue('dateOfTransaction').format(
                            fullDateTimeWithSecond
                        ),
                    },
                    onSuccessCallback: ({ data }) => {
                        const { rate } = data;
                        setNotRoundedRate(new BigNumber(rate));
                        setExchangeData(prevData => ({
                            ...prevData,
                            rate: roundToDown(Number(rate)),
                        }));
                    },
                });
            } else {
                setNotRoundedRate(undefined);
                setExchangeData(prevData => ({
                    ...prevData,
                    rate: undefined,
                }));
            }
        }
    }, [
        rateStatus,
        getFieldValue('toCurrency'),
        getFieldValue('fromCurrency'),
        getFieldValue('dateOfTransaction'),
    ]);

    useEffect(() => {
        if (!rateStatus) {
            if (getFieldValue('toAmount') && getFieldValue('fromAmount')) {
                const rate = new BigNumber(getFieldValue('toAmount')).dividedBy(
                    new BigNumber(getFieldValue('fromAmount'))
                );

                setNotRoundedRate(rate);
                setExchangeData(prevData => ({
                    ...prevData,
                    rate: Number(rate).toFixed(5),
                }));
            } else {
                setNotRoundedRate(0);
                setExchangeData(prevData => ({
                    ...prevData,
                    rate: 0,
                }));
            }
        }
    }, [getFieldValue('toAmount'), getFieldValue('fromAmount'), rateStatus]);
    useEffect(() => {
        if (rateStatus) {
            if (exchangeData.rate && getFieldValue('fromAmount')) {
                const amount = new BigNumber(
                    getFieldValue('fromAmount') || 0
                ).multipliedBy(new BigNumber(notRoundedRate || 1));
                setFieldsValue({ toAmount: amount.toFixed(2, 1) });
            } else {
                setFieldsValue({ toAmount: null });
            }
        }
    }, [exchangeData.rate, rateStatus]);
    const handleCompleteOperation = (event, nextSubmit) => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const accountCurrencyBalance = accountBalances.filter(
                    accountBalance =>
                        accountBalance.tenantCurrencyId === values.fromCurrency
                )[0];
                if (
                    roundToDown(values.fromAmount) >
                    roundToDown(accountCurrencyBalance?.balance || 0)
                ) {
                    return toast.error(
                        `Seçilmiş kassada ${accountCurrencyBalance?.currencyCode} valyutasında kifayət qədər məbləğ yoxdur.`
                    );
                }
                setLoader(true);

                const {
                    dateOfTransaction,
                    account,
                    fromAmount,
                    toAmount,
                    fromCurrency,
                    toCurrency,
                    description,
                } = values;

                const data = {
                    dateOfTransaction: dateOfTransaction.format(
                        fullDateTimeWithSecond
                    ),
                    cashbox: account,
                    fromAmount,
                    toAmount,
                    fromCurrency,
                    toCurrency,
                    description,
                };
                if (nextSubmit) {
                    if (editId) {
                        editOperationExchange(
                            editId,
                            data,
                            onCreateCallBack,
                            onFailure
                        );
                    } else {
                        createOperationExchange(
                            data,
                            onCreateCallBackNext,
                            onFailure
                        );
                    }
                } else if (editId) {
                    editOperationExchange(
                        editId,
                        data,
                        onCreateCallBack,
                        onFailure
                    );
                } else {
                    createOperationExchange(data, onCreateCallBack, onFailure);
                }
            }
        });
    };

    const onCreateCallBackNext = () => {
        toast.success('Əməliyyat uğurla tamamlandı.');
        window.location.reload();
    };

    const onCreateCallBack = () => {
        setLoader(false);
        toast.success('Əməliyyat uğurla tamamlandı.');
        history.replace(returnUrl);
    };

    const onFailure = ({ error }) => {
        setLoader(false);
        const errData = error?.response?.data?.error?.errorData;
        const cashboxName =
            errData?.cashbox?.length > 15
                ? `${errData?.cashbox.substring(0, 15)} ...`
                : errData?.cashbox;
        if (errData.length > 0) {
            if (
                errData?.cashbox ===
                allCashBoxNames.find(acc => acc.id === getFieldValue('from'))
                    .name
            ) {
                const newAmount = math.add(
                    Number(getFieldValue('paymentAmount')),
                    Number(errData.amount)
                );
                toast.error(
                    `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                        newAmount,
                    ]} ${errData?.currencyCode} çox ola bilməz. Tarix: ${
                        errData?.date
                    }`
                );
            } else {
                let amount = 0;
                if (
                    errData?.cashbox ===
                        operationsList.find(
                            ({ cashInOrCashOut }) => cashInOrCashOut === 1
                        )?.cashboxName ||
                    operationsList[0]?.dateOfTransaction !==
                        getFieldValue('operationDate').format(
                            fullDateTimeWithSecond
                        )
                ) {
                    amount = math.mul(Number(errData.amount || 0), -1);
                } else {
                    amount =
                        errData?.cashbox ===
                            (allCashBoxNames.find(
                                acc => acc.id === getFieldValue('to')
                            )?.name ||
                                operationsList.find(
                                    ({ cashInOrCashOut }) =>
                                        cashInOrCashOut === 1
                                ).cashboxName) &&
                        errData?.currencyCode ===
                            currencies.find(
                                curr => curr.id === getFieldValue('currency')
                            ).code
                            ? math.sub(
                                  Number(getFieldValue('paymentAmount')),
                                  Number(errData.amount)
                              )
                            : math.mul(Number(errData.amount || 0), -1);
                }
                toast.error(
                    `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                        amount,
                    ]} ${errData?.currencyCode} az ola bilməz. Tarix: ${
                        errData?.date
                    }`
                );
            }
        } else {
            toast.error(error?.response?.data?.error?.message);
        }
    };

    const handlePaymentAmount = (event, type) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value)) {
            if (type === 'from' && exchangeData.rate && rateStatus) {
                const amount =
                    Number(event.target.value || 0) *
                    Number(notRoundedRate || 1);
                setFieldsValue({ toAmount: round(amount) });
            } else if (type === 'to' && exchangeData.rate && rateStatus) {
                const amount =
                    Number(event.target.value || 0) /
                    Number(notRoundedRate || 1);
                setFieldsValue({ fromAmount: round(amount) });
            }
            return event.target.value;
        }
        if (event.target.value === '') {
            if (type === 'from') {
                if (rateStatus) {
                    setFieldsValue({ toAmount: null });
                } else {
                    setFieldsValue({ fromAmount: null });
                }
            } else if (type === 'to') {
                if (rateStatus) {
                    setFieldsValue({ fromAmount: null });
                } else {
                    setFieldsValue({ toAmount: null });
                }
            }
            return null;
        }
        if (type === 'from') {
            return getFieldValue('fromAmount');
        }
        return getFieldValue('toAmount');
    };

    const handlePaymentTypeChange = value => {
        setAccountBalances([]);
        setExchangeData({
            ...exchangeData,
            paymentType: value,
        });
        setFieldsValue({
            fromAmount: null,
            toAmount: null,
            toCurrency: null,
            fromCurrency: mainCurrency?.id,
        });
        const Account = allCashBoxNames.filter(
            cashbox => cashbox.type === value
        );

        if (Account.length === 1) {
            setFieldsValue({
                account: Account[0].id,
            });
            handleAccountChange(Account[0].id);
        } else {
            setFieldsValue({
                account: undefined,
            });
        }
    };
    useEffect(() => {
        if (getFieldValue(`account`)) {
            fetchAccountBalance({
                id: getFieldValue(`account`),
                filters: {
                    dateTime: getFieldValue('dateOfTransaction').format(
                        fullDateTimeWithSecond
                    ),
                },
                callBack: onSuccessAccountBalance,
            });
        }
    }, [getFieldValue('dateOfTransaction')]);
    const handleAccountChange = account => {
        setAccountBalances([]);
        if (account) {
            fetchAccountBalance({
                id: account,
                filters: {
                    dateTime: getFieldValue('dateOfTransaction')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                callBack: onSuccessAccountBalance,
            });
        }
    };
    const onSuccessAccountBalance = data => {
        if (data.data.length !== 0) {
            setAccountBalances(data.data);
        }
        if (data.data.length === 0) {
            setAccountBalances([]);
        }
    };
    const Account = allCashBoxNames.filter(
        cashbox => cashbox.type === exchangeData.paymentType
    );

    // useEffect(() => {
    //     if (Account.length === 1) {
    //         setFieldsValue({
    //             account: Account[0].id,
    //         });
    //         handleAccountChange(Account[0].id);
    //     } else {
    //         setFieldsValue({
    //             account: undefined,
    //         });
    //     }
    // }, [exchangeData.paymentType, Account.length]);

    useEffect(() => {
        if (addedAccount) {
            fetchAllCashboxNames({
                businessUnitIds: editId
                    ? operationsList[0]?.businessUnitId === null
                        ? [0]
                        : [operationsList[0]?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
                limit: 1000,
            });
            setFieldsValue({
                account: Account?.filter(
                    person => person.name == addedAccount
                )[0]?.id,
            });
        }
        if (Account?.filter(person => person.name == addedAccount)[0]) {
            SetaccountVisible(false);
            handleAccountChange(
                Account?.filter(person => person.name == addedAccount)[0]?.id
            );
            SetAddedAccount(null);
        }
    }, [allCashBoxNames.length, addedAccount]);

    return (
        <>
            <AddAccount
                accountVisible={accountVisible}
                SetaccountVisible={SetaccountVisible}
                Account={Account}
                SetAddedAccount={SetAddedAccount}
                activeTab={exchangeData.paymentType}
            />
            <Form onSubmit={handleCompleteOperation}>
                <div className={styles.parentBox}>
                    <div className={styles.paper}>
                        <ProFormItem
                            label="Əməliyyat tarixi"
                            help={getFieldError('dateOfTransaction')?.[0]}
                        >
                            {getFieldDecorator('dateOfTransaction', {
                                getValueFromEvent: date => {
                                    if (editId) {
                                        handleChangeRate(
                                            undefined,
                                            undefined,
                                            undefined,
                                            undefined,
                                            date
                                        );
                                    }
                                    return date;
                                },
                                rules: [requiredRule],
                            })(
                                <ProDatePicker
                                    disabledDate={disabledDate}
                                    format={fullDateTimeWithSecond}
                                />
                            )}
                        </ProFormItem>

                        <TypeOfPayment
                            typeOfPayment={exchangeData.paymentType}
                            changeTypeOfPayment={handlePaymentTypeChange}
                        />
                        <Row style={{ margin: '10px 0' }}>
                            <Col span={24}>
                                <div style={{ position: 'relative' }}>
                                    <Tooltip title="Yeni hesab əlavə et">
                                        <PlusIcon
                                            color="#FF716A"
                                            className={styles.plusBtn}
                                            onClick={() => handleAccount()}
                                        />
                                    </Tooltip>
                                    <ProFormItem
                                        label="Hesab"
                                        help={getFieldError('account')?.[0]}
                                    >
                                        {getFieldDecorator('account', {
                                            getValueFromEvent: account => {
                                                handleAccountChange(account);
                                                return account;
                                            },
                                            rules: [requiredRule],
                                        })(
                                            <ProSelect
                                                data={allCashBoxNames.filter(
                                                    cashbox =>
                                                        cashbox.type ===
                                                        exchangeData.paymentType
                                                )}
                                                allowClear={false}
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                            </Col>
                        </Row>
                        {getFieldValue('account') && (
                            <AccountBalance
                                label="Əməliyyat tarixi üzrə qalıq:"
                                list={accountBalances}
                                loading={balanceLoading}
                            />
                        )}
                        <Row style={{ margin: '10px 0' }}>
                            <Col span={18}>
                                <ProFormItem
                                    label="İlkin məbləğ"
                                    help={getFieldError('fromAmount')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('fromAmount', {
                                        getValueFromEvent: event =>
                                            handlePaymentAmount(event, 'from'),
                                        rules: [
                                            requiredRule,
                                            {
                                                type: 'number',
                                                min: 0.1,
                                                message:
                                                    'İlkin məbləğ 0 ola bilməz.',
                                                transform: value =>
                                                    Number(value),
                                            },
                                        ],
                                    })(<ProInput />)}
                                </ProFormItem>
                            </Col>
                            <Col span={6}>
                                <ProFormItem
                                    label="Valyuta"
                                    help={getFieldError('fromCurrency')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('fromCurrency', {
                                        getValueFromEvent: value => {
                                            if (
                                                value ===
                                                getFieldValue('toCurrency')
                                            ) {
                                                setFieldsValue({
                                                    toCurrency: undefined,
                                                });
                                            }
                                            if (editId) {
                                                handleChangeRate(
                                                    undefined,
                                                    undefined,
                                                    value
                                                );
                                            }
                                            return value;
                                        },
                                        rules: [requiredRule],
                                    })(
                                        <ProSelect
                                            keys={['code']}
                                            data={
                                                accountBalances.length > 0
                                                    ? [
                                                          ...accountBalances.map(
                                                              balance => ({
                                                                  ...balance,
                                                                  id:
                                                                      balance.tenantCurrencyId,
                                                                  code:
                                                                      balance.currencyCode,
                                                              })
                                                          ),
                                                      ].filter(
                                                          currency =>
                                                              currency.id !==
                                                              getFieldValue(
                                                                  'toCurrency'
                                                              )
                                                      )
                                                    : [mainCurrency]
                                            }
                                            loading={currenciesLoading}
                                            allowClear={false}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>
                        <ExchangeRate
                            form={form}
                            setNotRoundedRate={setNotRoundedRate}
                            convertLoading={convertLoading}
                            exchangeData={exchangeData}
                            setExchangeData={setExchangeData}
                            rateStatus={rateStatus}
                            setRateStatus={setRateStatus}
                        />
                        <Row style={{ margin: '10px 0' }}>
                            <Col span={18}>
                                <ProFormItem
                                    label="Çevrilmiş məbləğ"
                                    help={getFieldError('toAmount')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('toAmount', {
                                        getValueFromEvent: event =>
                                            handlePaymentAmount(event, 'to'),
                                        rules: [
                                            requiredRule,
                                            {
                                                type: 'number',
                                                min: 0.1,
                                                message:
                                                    'Çevrilmiş məbləğ 0 ola bilməz.',
                                                transform: value =>
                                                    Number(value),
                                            },
                                        ],
                                    })(<ProInput />)}
                                </ProFormItem>
                            </Col>
                            <Col span={6}>
                                <ProFormItem
                                    label="Valyuta"
                                    help={getFieldError('toCurrency')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('toCurrency', {
                                        getValueFromEvent: value => {
                                            if (editId) {
                                                handleChangeRate(
                                                    undefined,
                                                    undefined,
                                                    undefined,
                                                    value
                                                );
                                            }
                                            return value;
                                        },
                                        rules: [requiredRule],
                                    })(
                                        <ProSelect
                                            keys={['code']}
                                            data={[
                                                ...currencies.filter(
                                                    currency =>
                                                        currency.id !==
                                                        getFieldValue(
                                                            'fromCurrency'
                                                        )
                                                ),
                                            ]}
                                            loading={currenciesLoading}
                                            allowClear={false}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>

                        <Row style={{ margin: '10px 0 60px 0' }}>
                            <Col span={24}>
                                <ProFormItem
                                    label="Əlavə məlumat"
                                    help={getFieldError('description')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('description', {
                                        getValueFromEvent: event =>
                                            event.target.value,
                                        rules: [],
                                    })(
                                        <ProTextArea
                                            rows={5}
                                            autoSize={{
                                                minRows: 5,
                                                maxRows: 5,
                                            }}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>
                        <div className={styles.formAction}>
                            <Button
                                loading={loader}
                                disabled={loader}
                                type="primary"
                                htmlType="submit"
                                className={styles.submit}
                            >
                                Təsdiq et
                            </Button>
                            {editId ? null : (
                                <Button
                                    loading={loader}
                                    disabled={loader}
                                    type="primary"
                                    onClick={(e, nextSubmit) =>
                                        handleCompleteOperation(
                                            e,
                                            'nextSubmit',
                                            nextSubmit
                                        )
                                    }
                                    className={styles.submit}
                                >
                                    Təsdiq və Növbətiyə keçid
                                    <FaChevronRight />
                                </Button>
                            )}
                            {/* finance */}
                            <Link to="/finance/operations/?tab=1">
                                <Button>İmtina et</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Form>
        </>
    );
}

const mapStateToProps = state => ({
    cashBoxBalance: state.cashBoxBalanceReducer.cashBoxBalance,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    mainCurrency: state.kassaReducer.mainCurrency,
    isLoading: state.kassaReducer.isLoading,
    currencies: state.kassaReducer.currencies,
    balanceLoading: state.loadings.accountBalance,
    convertLoading: state.loadings.convertCurrency,
    operationsList: state.financeOperationsReducer.operationsList,
    currenciesLoading: state.loadings.fetchCurrencies,
});
export default connect(
    mapStateToProps,
    {
        fetchAccountBalance,
        fetchAllCashboxNames,
        fetchMainCurrency,
        convertCurrency,
        createOperationExchange,
        editOperationExchange,
        fetchCurrencies,
    }
)(Form.create({ name: 'ExchangeForm' })(Exchange));
