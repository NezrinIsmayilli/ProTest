/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Link, useHistory } from 'react-router-dom';
import moment from 'moment';
import { fetchAccountBalance } from 'store/actions/finance/operations';
import {
    createOperationTransfer,
    editOperationTransfer,
} from 'store/actions/finance/initialBalance';
import {
    fetchAllCashboxNames,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import { fetchUnitCashbox } from 'store/actions/businessUnit';
import { Button, Form, Row, Col, Tooltip } from 'antd';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { FaChevronRight } from 'react-icons/fa';
import {
    Can,
    ProDatePicker,
    ProSelect,
    ProFormItem,
    ProInput,
    ProTextArea,
} from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { roundToDown, fullDateTimeWithSecond, round } from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import { toast } from 'react-toastify';
import AddAccount from '../shared/AddAccount';
import styles from '../styles.module.scss';
import { TypeOfPayment, AccountBalance } from '../shared';

const { read } = accessTypes;
const math = require('exact-math');

// Can not select days after today
function disabledDate(current) {
    return current && current >= moment().endOf('day');
}

function Transfer(props) {
    const {
        allCashBoxNames,
        currencies,
        fetchAccountBalance,
        createOperationTransfer,
        editOperationTransfer,
        fetchAllCashboxNames,
        fetchUnitCashbox,
        fetchCurrencies,
        returnUrl,
        editId,
        form,
        profile,
        isLoading,
        transferLoading,
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

    const [transferData, setTransferData] = useState({
        from: {
            balance: [],
            type: 1,
            account: undefined,
            loading: false,
        },
        to: {
            balance: [],
            type: 1,
            account: undefined,
            loading: false,
        },
        currency: undefined,
    });
    const [loader, setLoader] = useState(false);
    const [unitCashbox, setUnitCashbox] = useState(undefined);
    const history = useHistory();

    const [ToAccountVisible, SetToAccountVisible] = useState(false);
    const [addedToAccount, SetaddedToAccount] = useState(null);

    const handleToAccount = () => {
        SetaddedToAccount(null);
        SetToAccountVisible(true);
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
        if (editId && operationsList.length > 0) {
            if (currencies?.length !== 0) {
                setFieldsValue({
                    operationDate:
                        editId && operationsList
                            ? moment(
                                  operationsList[0]?.dateOfTransaction,
                                  fullDateTimeWithSecond
                              )
                            : moment(),
                });
                setTransferData({
                    ...transferData,
                    currency:
                        editId && operationsList
                            ? currencies?.find(
                                  ({ id }) =>
                                      id === operationsList[0]?.currencyId
                              )
                            : currencies[0],
                });
            }
        } else {
            setFieldsValue({
                operationDate: moment(),
            });
        }
    }, [currencies, editId, operationsList]);

    useEffect(() => {
        if (currencies?.length !== 0) {
            setFieldsValue({
                currency:
                    editId && operationsList
                        ? operationsList[0]?.currencyId
                        : currencies?.filter(
                              currency =>
                                  currency.id === getFieldValue('currency')
                          ).length > 0
                        ? getFieldValue('currency')
                        : currencies[0].id,
            });
            setTransferData({
                ...transferData,
                currency:
                    editId && operationsList
                        ? currencies?.find(
                              ({ id }) => id === operationsList[0]?.currencyId
                          )
                        : currencies?.filter(
                              currency =>
                                  currency.id === getFieldValue('currency')
                          ).length > 0
                        ? currencies?.find(
                              currency =>
                                  currency.id === getFieldValue('currency')
                          )
                        : currencies[0],
            });
        }
    }, [currencies]);
    useEffect(() => {
        fetchCurrencies({ limit: 1000 });
    }, []);
    useEffect(() => {
        if (editId && operationsList?.length > 0) {
            const fromData = operationsList.find(
                ({ cashInOrCashOut }) => cashInOrCashOut === -1
            );
            const toData = operationsList.find(
                ({ cashInOrCashOut }) => cashInOrCashOut === 1
            );
            setTransferData({
                from: {
                    ...transferData?.from,
                    type: fromData?.paymentTypeId,
                },
                to: {
                    ...transferData?.to,
                    type: toData?.paymentTypeId,
                },
            });
            // changeTypeOfPayment(fromData?.paymentTypeId, 'from')
            setFieldsValue({
                from: fromData.cashboxId,
                to: toData.cashboxId,

                // currency: operationsList[0].currencyId,
                // description: operationsList[0]?.description,
                // Paccount: operationsList[0]?.cashboxId || undefined,
                paymentAmount: round(operationsList[0]?.amount),
            });
            // handlePaymentTypeChange(operationsList[0]?.paymentTypeId, true);
        }
    }, [editId, operationsList]);
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
                fetchUnitCashbox({
                    id:
                        operationsList[0]?.businessUnitId === null
                            ? [0]
                            : [operationsList[0]?.businessUnitId],
                    onSuccess: ({ data }) => {
                        setUnitCashbox(
                            data.map(item => ({
                                ...item,
                                transferCashboxes: item.transferCashboxes.map(
                                    cashbox => ({
                                        ...cashbox,
                                        id: cashbox.cashboxId,
                                        name: cashbox.cashboxName,
                                    })
                                ),
                            }))
                        );
                    },
                });
            }
        } else if (profile.businessUnits.length === 1) {
            fetchUnitCashbox({
                id: [profile.businessUnits?.[0].id],
                onSuccess: ({ data }) => {
                    setUnitCashbox(
                        data.map(item => ({
                            ...item,
                            transferCashboxes: item.transferCashboxes.map(
                                cashbox => ({
                                    ...cashbox,
                                    id: cashbox.cashboxId,
                                    name: cashbox.cashboxName,
                                })
                            ),
                        }))
                    );
                },
            });
            fetchAllCashboxNames({ limit: 1000 });
        } else if (cookies.get('_TKN_UNIT_')) {
            fetchAllCashboxNames({
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
                limit: 1000,
            });
            fetchUnitCashbox({
                id: [cookies.get('_TKN_UNIT_')],
                onSuccess: ({ data }) => {
                    setUnitCashbox(
                        data.map(item => ({
                            ...item,
                            transferCashboxes: item.transferCashboxes.map(
                                cashbox => ({
                                    ...cashbox,
                                    id: cashbox.cashboxId,
                                    name: cashbox.cashboxName,
                                })
                            ),
                        }))
                    );
                },
            });
        } else {
            fetchAllCashboxNames({ limit: 1000 });
            setUnitCashbox(undefined);
        }
    }, [cookies.get('_TKN_UNIT_'), editId, operationsList]);
    const handleCompleteOperation = (event, nextSubmit) => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const accountCurrencyBalance = transferData.from.balance.filter(
                    accountBalance =>
                        accountBalance.tenantCurrencyId === values.currency
                )[0];
                const currencyCode = currencies.filter(
                    currency => currency.id === values.currency
                )[0].code;
                if (
                    roundToDown(
                        editId && operationsList.length > 0
                            ? math.add(
                                  operationsList.find(
                                      ({ cashInOrCashOut }) =>
                                          cashInOrCashOut === -1
                                  )?.amount || 0,
                                  accountCurrencyBalance?.balance || 0
                              )
                            : accountCurrencyBalance?.balance || 0
                    ) <= 0
                ) {
                    return toast.error(
                        `Seçilmiş kassada ${currencyCode} valyutasında kifayət qədər məbləğ yoxdur.`
                    );
                }
                setLoader(true);

                const {
                    operationDate,
                    from,
                    to,
                    currency,
                    paymentAmount,
                    description,
                } = values;

                const data = {
                    dateOfTransaction: operationDate.format(
                        fullDateTimeWithSecond
                    ),
                    cashBoxTypeFrom: transferData.from.type,
                    cashBoxNameFrom: from,
                    cashBoxTypeTo: transferData.to.type,
                    cashBoxNameTo: to,
                    currency,
                    description,
                    amount: Number(paymentAmount),
                };
                if (nextSubmit) {
                    if (editId) {
                        editOperationTransfer(
                            editId,
                            data,
                            onCreateCallBackNext,
                            onFailure
                        );
                    } else {
                        createOperationTransfer(
                            data,
                            onCreateCallBackNext,
                            onFailure
                        );
                    }
                } else if (editId) {
                    editOperationTransfer(
                        editId,
                        data,
                        onCreateCallBack,
                        onFailure
                    );
                } else {
                    createOperationTransfer(data, onCreateCallBack, onFailure);
                }
            }
        });
    };

    const onCreateCallBack = () => {
        setLoader(false);
        toast.success('Əməliyyat uğurla tamamlandı.');
        history.replace(returnUrl);
    };

    const onCreateCallBackNext = () => {
        toast.success('Əməliyyat uğurla tamamlandı.');
        window.location.reload();
    };

    const onFailure = ({ error }) => {
        setLoader(false);
        const errData = error?.response?.data?.error?.errorData;
        const cashboxName =
            errData?.cashbox.length > 15
                ? `${errData?.cashbox.substring(0, 15)} ...`
                : errData?.cashbox;
        if (
            errData?.cashbox ===
            allCashBoxNames.find(acc => acc.id === getFieldValue('from')).name
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
                                ({ cashInOrCashOut }) => cashInOrCashOut === 1
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

        // const amount = math.add(
        //     Number(getFieldValue('paymentAmount')),
        //     Number(errData.amount)
        // );
        // if (Number(amount) <= 0) {
        //     toast.error(
        //         `Seçilmiş kassada ${errData?.currencyCode} valyutasında kifayət qədər məbləğ yoxdur.`
        //     );
        // } else {
        //     toast.error(
        //         `${
        //             errData?.cashbox
        //         } hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
        //             amount,
        //         ]} ${errData?.currencyCode} çox ola bilməz. Tarix: ${
        //             errData?.date
        //         }`
        //     );
        // }
    };

    const handlePaymentAmount = event => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value) && event.target.value <= 1000000)
            return event.target.value;
        if (event.target.value === '') return null;
        return getFieldValue('paymentAmount');
    };

    const changeTypeOfPayment = (value, type) => {
        if (type === 'from') {
            const SendAccount = allCashBoxNames?.filter(
                cashbox =>
                    cashbox.type === value && getFieldValue('to') !== cashbox.id
            );
            // setFieldsValue({
            //     from: SendAccount.length === 1 ? SendAccount[0].id : undefined,
            // });
            // if (SendAccount[0]?.id) {
            //     fetchAccountBalance({
            //         id: SendAccount[0].id,
            //         filter: {
            //             dateTime: getFieldValue('operationDate')?.format(
            //                 fullDateTimeWithSecond
            //             ),
            //         },
            //         callBack: data => {
            //             setTransferData(prevData => ({
            //                 ...prevData,
            //                 [type]: {
            //                     ...transferData[type],
            //                     type: value,
            //                     balance: data.data,
            //                     loading: false,
            //                 },
            //             }));
            //         },
            //     });
            // } else {
            setTransferData(prevData => ({
                ...prevData,
                [type]: {
                    ...transferData[type],
                    type: value,
                    balance: [],
                    loading: false,
                },
            }));
            // }
        } else if (type === 'to') {
            const RecieveAccount = unitCashbox
                ? getFieldValue('from')
                    ? [
                          ...unitCashbox
                              ?.find(
                                  cashbox =>
                                      cashbox.id === getFieldValue('from')
                              )
                              .transferCashboxes?.filter(
                                  cashbox => cashbox.typeId === value
                              ),
                          ...unitCashbox
                              .filter(
                                  cashbox =>
                                      cashbox.id !== getFieldValue('from')
                              )
                              .filter(cashbox => cashbox.type === value),
                      ]
                    : unitCashbox.filter(cashbox => cashbox.type === value)
                : allCashBoxNames.filter(
                      cashbox =>
                          cashbox.type === value &&
                          getFieldValue('from') !== cashbox.id
                  );
            // setFieldsValue({
            //     to:
            //         RecieveAccount.length === 1
            //             ? RecieveAccount[0].id
            //             : undefined,
            // });
            // if (RecieveAccount[0]?.id) {
            //     fetchAccountBalance({
            //         id: RecieveAccount[0].id,
            //         filter: {
            //             dateTime: getFieldValue('operationDate')?.format(
            //                 fullDateTimeWithSecond
            //             ),
            //         },
            //         callBack: data => {
            //             setTransferData(prevData => ({
            //                 ...prevData,
            //                 [type]: {
            //                     ...transferData[type],
            //                     type: value,
            //                     balance: data.data,
            //                     loading: false,
            //                 },
            //             }));
            //         },
            //     });
            // } else {
            setTransferData(prevData => ({
                ...prevData,
                [type]: {
                    ...transferData[type],
                    type: value,
                    balance: [],
                    loading: false,
                },
            }));
            // }
        }
    };
    useEffect(() => {
        if (getFieldValue('operationDate')) {
            if (getFieldValue(`from`)) {
                fetchAccountBalance({
                    id: getFieldValue(`from`),
                    filters: {
                        dateTime: getFieldValue('operationDate').format(
                            fullDateTimeWithSecond
                        ),
                    },
                    callBack: data => {
                        setTransferData(prevData => ({
                            ...prevData,
                            from: {
                                ...transferData.from,
                                balance: data.data,
                                loading: false,
                            },
                        }));
                    },
                });
            }
            if (getFieldValue(`to`)) {
                fetchAccountBalance({
                    id: getFieldValue(`to`),
                    filters: {
                        dateTime: getFieldValue('operationDate').format(
                            fullDateTimeWithSecond
                        ),
                    },
                    callBack: data => {
                        setTransferData(prevData => ({
                            ...prevData,
                            to: {
                                ...transferData.to,
                                balance: data.data,
                                loading: false,
                            },
                        }));
                    },
                });
            }
        }
    }, [getFieldValue('operationDate')]);
    const handleAccountChange = (type, account) => {
        setTransferData(prevTransferData => ({
            ...prevTransferData,
            [type]: {
                ...transferData[type],
                balance: [],
                loading: true,
            },
        }));
        if (account) {
            fetchAccountBalance({
                id: account,
                filters: {
                    dateTime: getFieldValue('operationDate')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                callBack: data => {
                    setTransferData(prevData => ({
                        ...prevData,
                        [type]: {
                            ...transferData[type],
                            balance: data.data,
                            loading: false,
                        },
                    }));
                },
            });
        }
    };

    const SendAccount = allCashBoxNames?.filter(
        cashbox =>
            cashbox.type === transferData.from.type &&
            getFieldValue('to') !== cashbox.id
    );
    const RecieveAccount = unitCashbox
        ? getFieldValue('from')
            ? [
                  ...unitCashbox
                      ?.find(cashbox => cashbox.id === getFieldValue('from'))
                      .transferCashboxes?.filter(
                          cashbox => cashbox.typeId === transferData.to.type
                      ),
                  ...unitCashbox
                      .filter(cashbox => cashbox.id !== getFieldValue('from'))
                      .filter(cashbox => cashbox.type === transferData.to.type),
              ]
            : unitCashbox.filter(
                  cashbox => cashbox.type === transferData.to.type
              )
        : allCashBoxNames.filter(
              cashbox =>
                  cashbox.type === transferData.to.type &&
                  getFieldValue('from') !== cashbox.id
          );

    // useEffect(() => {
    //     if (getFieldValue('from') && RecieveAccount.length === 1) {
    //         setFieldsValue({
    //             to: RecieveAccount[0].id,
    //         });
    //         handleAccountChange('to', RecieveAccount[0].id);
    //     } else if (SendAccount.length === 1) {
    //         setFieldsValue({
    //             from: SendAccount[0].id,
    //         });
    //         handleAccountChange('from', SendAccount[0].id);
    //     }
    // }, [
    //     getFieldValue('from'),
    //     RecieveAccount.length,
    //     SendAccount.length,
    //     transferData.to.type,
    // ]);

    useEffect(() => {
        if (addedToAccount) {
            fetchUnitCashbox({
                id: [cookies.get('_TKN_UNIT_')],
                onSuccess: ({ data }) => {
                    setUnitCashbox(
                        data.map(item => ({
                            ...item,
                            transferCashboxes: item.transferCashboxes.map(
                                cashbox => ({
                                    ...cashbox,
                                    id: cashbox.cashboxId,
                                    name: cashbox.cashboxName,
                                })
                            ),
                        }))
                    );
                },
            });
            setFieldsValue({
                to: RecieveAccount?.filter(
                    person => person.name == addedToAccount
                )[0]?.id,
            });
        }
        if (
            RecieveAccount?.filter(person => person.name == addedToAccount)[0]
        ) {
            SetToAccountVisible(false);
            handleAccountChange(
                'to',
                RecieveAccount?.filter(
                    person => person.name == addedToAccount
                )[0]?.id
            );
            SetaddedToAccount(null);
        }
    }, [unitCashbox?.length, addedToAccount]);
    return (
        <>
            {/* To Account */}
            <AddAccount
                accountVisible={ToAccountVisible}
                SetaccountVisible={SetToAccountVisible}
                Account={RecieveAccount}
                SetAddedAccount={SetaddedToAccount}
                activeTab={transferData.to.type}
            />
            <Form onSubmit={handleCompleteOperation}>
                <div className={styles.parentBox}>
                    <div className={styles.paper}>
                        {/* From Account */}
                        <TypeOfPayment
                            typeOfPayment={transferData.from.type}
                            changeTypeOfPayment={changeTypeOfPayment}
                            type="from"
                            disabled={transferData.from.loading}
                        />
                        <Row style={{ margin: '10px 0' }}>
                            <Col span={24}>
                                <ProFormItem
                                    label="Göndərən"
                                    help={getFieldError('from')?.[0]}
                                >
                                    {getFieldDecorator('from', {
                                        getValueFromEvent: account => {
                                            handleAccountChange(
                                                'from',
                                                account
                                            );
                                            return account;
                                        },
                                        rules: [requiredRule],
                                    })(
                                        <ProSelect
                                            data={allCashBoxNames?.filter(
                                                cashbox =>
                                                    cashbox.type ===
                                                        transferData.from
                                                            .type &&
                                                    getFieldValue('to') !==
                                                        cashbox.id
                                            )}
                                            allowClear
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>
                        {getFieldValue('from') && (
                            <AccountBalance
                                label="Əməliyyat tarixi üzrə qalıq:"
                                loading={transferData.from.loading}
                                list={transferData.from.balance}
                                editId={editId}
                                operationsList={operationsList.filter(
                                    ({ cashInOrCashOut }) =>
                                        cashInOrCashOut === -1
                                )}
                                typeOfPayment={transferData.from.type}
                                selectedAccount={getFieldValue('from')}
                            />
                        )}

                        <div className={styles.selectMargin}>
                            <TypeOfPayment
                                typeOfPayment={transferData.to.type}
                                type="to"
                                changeTypeOfPayment={changeTypeOfPayment}
                                disabled={transferData.to.loading}
                            />

                            <Row style={{ margin: '10px 0' }}>
                                <Col span={24}>
                                    <div style={{ position: 'relative' }}>
                                        <Tooltip title="Yeni hesab əlavə et">
                                            <PlusIcon
                                                color="#FF716A"
                                                className={styles.plusBtn}
                                                onClick={() =>
                                                    handleToAccount()
                                                }
                                            />
                                        </Tooltip>
                                        <ProFormItem
                                            label="Qəbul edən"
                                            help={getFieldError('to')?.[0]}
                                        >
                                            {getFieldDecorator('to', {
                                                getValueFromEvent: account => {
                                                    handleAccountChange(
                                                        'to',
                                                        account
                                                    );
                                                    return account;
                                                },
                                                rules: [requiredRule],
                                            })(
                                                <ProSelect
                                                    data={RecieveAccount}
                                                    allowClear
                                                />
                                            )}
                                        </ProFormItem>
                                    </div>
                                </Col>
                            </Row>
                            {getFieldValue('to') && (
                                <AccountBalance
                                    label="Əməliyyat tarixi üzrə qalıq:"
                                    loading={transferData.to.loading}
                                    list={transferData.to.balance}
                                    editId={editId}
                                    operationsList={operationsList.filter(
                                        ({ cashInOrCashOut }) =>
                                            cashInOrCashOut === 1
                                    )}
                                    typeOfPayment={transferData.to.type}
                                    selectedAccount={getFieldValue('to')}
                                />
                            )}
                        </div>

                        <ProFormItem
                            label="Əməliyyat tarixi"
                            help={getFieldError('operationDate')?.[0]}
                        >
                            {getFieldDecorator('operationDate', {
                                getValueFromEvent: date => date,
                                rules: [requiredRule],
                            })(
                                <ProDatePicker
                                    disabledDate={disabledDate}
                                    format={fullDateTimeWithSecond}
                                />
                            )}
                        </ProFormItem>

                        <Row style={{ margin: '10px 0' }}>
                            <Col span={18}>
                                <ProFormItem
                                    label="Ödəniləcək məbləğ"
                                    help={getFieldError('paymentAmount')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('paymentAmount', {
                                        getValueFromEvent: event =>
                                            handlePaymentAmount(event),
                                        rules: [
                                            requiredRule,
                                            {
                                                type: 'number',
                                                min: 0.1,
                                                message:
                                                    'Ödəniş məbləği 0 ola bilməz.',
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
                                    help={getFieldError('currency')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('currency', {
                                        getValueFromEvent: value => value,
                                        rules: [requiredRule],
                                    })(
                                        <ProSelect
                                            keys={['code']}
                                            data={currencies}
                                            allowClear={false}
                                            loading={currenciesLoading}
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
                            {/* <Can I={read} a={permissions.transaction}> */}
                            <Link to="/finance/operations/?tab=1">
                                <Button>İmtina et</Button>
                            </Link>
                            {/* </Can> */}
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
    transferLoading: state.cashBoxBalanceReducer.accountBalance,
    isLoading: state.kassaReducer.isLoading,
    currencies: state.kassaReducer.currencies,
    profile: state.profileReducer.profile,
    operationsList: state.financeOperationsReducer.operationsList,
    currenciesLoading: state.loadings.fetchCurrencies,
});
export default connect(
    mapStateToProps,
    {
        fetchAccountBalance,
        fetchAllCashboxNames,
        fetchUnitCashbox,
        createOperationTransfer,
        editOperationTransfer,
        fetchCurrencies,
    }
)(Form.create({ name: 'TransferForm' })(Transfer));
