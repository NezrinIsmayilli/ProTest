/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { cookies } from 'utils/cookies';
import { Link, useHistory } from 'react-router-dom';
import {
    fetchAllCashboxNames,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import {
    fetchAdvancePaymentByContactId,
    fetchInvoiceListByContactId,
    fetchContacts,
    fetchLastDateOfAdvanceByContactId,
} from 'store/actions/contact';
import { fetchAccountBalance } from 'store/actions/finance/operations';
import {
    createAdvancePayment,
    editAdvancePayment,
} from 'store/actions/finance/initialBalance';
import { Button, Form, Row, Col, Tooltip, Spin } from 'antd';
import { FaChevronRight } from 'react-icons/fa';
import { requiredRule } from 'utils/rules';
import { fullDateTimeWithSecond, round } from 'utils';
import {
    ProDatePicker,
    ProSelect,
    ProFormItem,
    ProTextArea,
    ProInput,
    ProAsyncSelect,
} from 'components/Lib';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { toast } from 'react-toastify';
import roundTo from 'round-to';
import CashboxInfoButton from './CashboxInfoButton';
import styles from '../styles.module.scss';
import { TypeOfPayment, AccountBalance, OperationType } from '../shared';
import AddAccount from '../shared/AddAccount';
import ContactAdd from './ContactAdd';

const math = require('exact-math');

function disabledDate(current) {
    return current && current >= moment().endOf('day');
}

function Advance(props) {
    const {
        allCashBoxNames,
        fetchAccountBalance,
        createAdvancePayment,
        editAdvancePayment,
        fetchCurrencies,
        fetchAllCashboxNames,
        fetchAdvancePaymentByContactId,
        fetchInvoiceListByContactId,
        fetchLastDateOfAdvanceByContactId,
        currencies,
        form,
        returnUrl,
        editId,
        fetchContacts,
        balanceLoading,
        paymentLoading,
        advanceLoading,
        permissionsList,
        operationsList,
        lastDateLoading,
        currenciesLoading,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    const [paymentData, setPaymentData] = useState({
        operationType: 1,
        paymentType: 1,
        accountBalance: [],
    });
    const [advanceBalance, setAdvanceBalance] = useState([]);
    const [contactItem, setContactItem] = useState(false);
    const [data, setData] = useState(undefined);
    const [contacts, setContacts] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);
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
            fetchLastDateOfAdvanceByContactId(
                operationsList[0].contactId,
                ({ data }) => {
                    if (data !== null) {
                        setIsDisabled(
                            getFieldValue('operationDate').isBefore(
                                moment(data, 'DD-MM-YYYY HH:mm:ss')
                            )
                        );
                    }
                }
            );
            setFieldsValue({
                counterparty: operationsList[0].contactId,
                currency:
                    editId && operationsList
                        ? operationsList[0]?.currencyId
                        : currencies[0].id,
                AdvanceAccount: operationsList[0]?.cashboxId,
                paymentAmount: round(operationsList[0]?.amount),
            });
            handleChangeCounterparty(
                operationsList[0].contactId,
                moment(
                    operationsList[0]?.dateOfTransaction,
                    fullDateTimeWithSecond
                ).format(fullDateTimeWithSecond)
            );
            setPaymentData(prevPaymentData => ({
                ...prevPaymentData,
                paymentType: operationsList[0]?.paymentTypeId,
            }));
        }
        setFieldsValue({
            operationDate:
                editId && operationsList
                    ? moment(
                          operationsList[0]?.dateOfTransaction,
                          fullDateTimeWithSecond
                      )
                    : moment(),
            category:
                editId && operationsList
                    ? operationsList[0]?.operationDirectionId
                    : 1,
        });
    }, [editId, operationsList]);

    useEffect(() => {
        if (data) {
            if (cookies.get('_TKN_UNIT_')) {
                fetchAdvancePaymentByContactId(
                    contacts[0]?.id,
                    {
                        businessUnitIds: [cookies.get('_TKN_UNIT_')],
                        dateTime: getFieldValue('operationDate').format(
                            fullDateTimeWithSecond
                        ),
                    },
                    fetchAdvancePaymentCallback
                );
            } else {
                fetchAdvancePaymentByContactId(
                    contacts[0]?.id,
                    {
                        businessUnitIds: undefined,
                        dateTime: getFieldValue('operationDate').format(
                            fullDateTimeWithSecond
                        ),
                    },
                    fetchAdvancePaymentCallback
                );
            }
            setFieldsValue({
                counterparty: contacts[0]?.id,
            });
        }
    }, [contacts]);

    const handleContactItem = () => {
        setContactItem(true);
    };
    const history = useHistory();

    const changeOperationType = operationType => {
        setFieldsValue({ category: operationType });
    };

    const handleChangeCounterparty = (selectedCounterpartyId, date) => {
        fetchAdvancePaymentByContactId(
            selectedCounterpartyId,
            {
                businessUnitIds: editId
                    ? operationsList[0]?.businessUnitId === null
                        ? [0]
                        : [operationsList[0]?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
                dateTime:
                    date ||
                    getFieldValue('operationDate').format(
                        fullDateTimeWithSecond
                    ),
            },
            fetchAdvancePaymentCallback
        );
    };

    const fetchAdvancePaymentCallback = ({ data }) => {
        const { myAmount, contactsAmount } = data;
        const newBalance = myAmount.concat(
            contactsAmount.map(currencyBalance => ({
                ...currencyBalance,
                amount: math.mul(Number(currencyBalance.amount), -1),
            }))
        );
        setAdvanceBalance(newBalance);
    };

    const handlePaymentAmount = event => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value) && event.target.value <= 1000000)
            return event.target.value;
        if (event.target.value === '') return null;
        return getFieldValue('paymentAmount');
    };

    const handlePaymentTypeChange = paymentType => {
        setPaymentData(prevPaymentData => ({
            ...prevPaymentData,
            paymentType,
        }));
        setFieldsValue({
            AdvanceAccount: undefined,
        });
        allCashBoxNames.filter(cashbox => cashbox.type === paymentType);
        if (filteredCashboxes.length === 1) {
            setFieldsValue({
                AdvanceAccount: filteredCashboxes[0].id,
            });
            if (filteredCashboxes.length === 1) {
                handlePaymentAccountChange(filteredCashboxes[0].id);
            }
        }
    };
    useEffect(() => {
        if (getFieldValue(`AdvanceAccount`)) {
            handlePaymentAccountChange(getFieldValue(`AdvanceAccount`));
        }
        if (getFieldValue('counterparty')) {
            fetchAdvancePaymentByContactId(
                getFieldValue('counterparty'),
                {
                    businessUnitIds: editId
                        ? operationsList[0]?.businessUnitId === null
                            ? [0]
                            : [operationsList[0]?.businessUnitId]
                        : cookies.get('_TKN_UNIT_')
                        ? [cookies.get('_TKN_UNIT_')]
                        : undefined,
                    dateTime: getFieldValue('operationDate').format(
                        fullDateTimeWithSecond
                    ),
                },
                fetchAdvancePaymentCallback
            );
        }
    }, [getFieldValue('operationDate')]);
    const handlePaymentAccountChange = paymentAccountId => {
        fetchAccountBalance({
            id: paymentAccountId,
            filters: {
                dateTime: getFieldValue('operationDate').format(
                    fullDateTimeWithSecond
                ),
            },
            callBack: data => {
                setPaymentData(prevPaymentData => ({
                    ...prevPaymentData,
                    accountBalance: data.data,
                }));
            },
        });
    };

    useEffect(() => {
        if (currencies.length !== 0)
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
    }, [currencies]);
    useEffect(() => {
        fetchCurrencies({
            dateTime: getFieldValue('operationDate')?.format(
                fullDateTimeWithSecond
            ),
            withRatesOnly: 1,
            limit: 1000,
        });
    }, [getFieldValue('operationDate')]);
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
    const handleCompleteOperation = (event, nextSubmit) => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const accountCurrencyBalance = paymentData.accountBalance.filter(
                    accountBalance =>
                        accountBalance.tenantCurrencyId === values.currency
                )[0];
                const currencyCode = currencies.filter(
                    currency => currency.id === values.currency
                )[0].code;
                // if (
                //     roundToDown(values.paymentAmount) >
                //         roundToDown(accountCurrencyBalance?.balance || 0) &&
                //     paymentData.operationType === -1
                // ) {
                //     return toast.error(
                //         `Seçilmiş kassada ${currencyCode} valyutasında kifayət qədər məbləğ yoxdur.`
                //     );
                // }

                const {
                    counterparty,
                    operationDate,
                    AdvanceAccount,
                    paymentAmount,
                    currency,
                    description,
                    category,
                } = values;

                const data = {
                    contact: counterparty,
                    type: category,
                    dateOfTransaction: operationDate.format(
                        fullDateTimeWithSecond
                    ),
                    cashbox: AdvanceAccount,
                    typeOfPayment: paymentData.paymentType,
                    amount: roundTo(Number(paymentAmount), 2),
                    currency,
                    description: description || null,
                };
                if (nextSubmit) {
                    if (editId) {
                        editAdvancePayment(
                            editId,
                            data,
                            onCreateCallBackNext,
                            onFailure
                        );
                    } else {
                        createAdvancePayment(
                            data,
                            onCreateCallBackNext,
                            onFailure
                        );
                    }
                } else if (editId) {
                    editAdvancePayment(
                        editId,
                        data,
                        onCreateCallBack,
                        onFailure
                    );
                } else {
                    createAdvancePayment(data, onCreateCallBack, onFailure);
                }
            }
        });
    };

    const onFailure = ({ error }) => {
        const errData = error?.response?.data?.error?.errorData;
        const cashboxName =
            errData?.cashbox.length > 15
                ? `${errData?.cashbox.substring(0, 15)} ...`
                : errData?.cashbox;
        if (editId && operationsList[0]?.operationDirectionId === 1) {
            let amount = 0;
            if (
                errData?.currencyCode !==
                    currencies.find(
                        curr => curr.id === getFieldValue('currency')
                    ).code ||
                errData?.cashbox !==
                    allCashBoxNames
                        .filter(
                            cashbox => cashbox.type === paymentData.paymentType
                        )
                        .find(acc => acc.id === getFieldValue('AdvanceAccount'))
                        .name ||
                (operationsList[0]?.dateOfTransaction !==
                    getFieldValue('operationDate').format(
                        fullDateTimeWithSecond
                    ) &&
                    getFieldValue('category') !== -1)
            ) {
                amount = math.mul(Number(errData.amount || 0), -1);
            } else if (getFieldValue('category') === -1) {
                amount = math.sub(
                    Number(math.mul(Number(errData.amount || 0), -1)),
                    Number(getFieldValue('paymentAmount'))
                );
            } else {
                amount =
                    errData?.cashbox ===
                        allCashBoxNames
                            .filter(
                                cashbox =>
                                    cashbox.type === paymentData.paymentType
                            )
                            .find(
                                acc =>
                                    acc.id === getFieldValue('AdvanceAccount')
                            ).name &&
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
                getFieldValue('category') === -1
                    ? `Əməliyyat növü dəyişdirilə bilməz. ${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                          amount,
                      ]} ${errData?.currencyCode} az ola bilməz. Tarix:  ${
                          errData?.date
                      }`
                    : `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                          amount,
                      ]} ${errData?.currencyCode} az ola bilməz. Tarix: ${
                          errData?.date
                      }`
            );
        } else {
            const amount = math.add(
                Number(getFieldValue('paymentAmount')),
                Number(errData.amount)
            );
            if (Number(amount) <= 0) {
                toast.error(
                    `Seçilmiş kassada ${errData?.currencyCode} valyutasında kifayət qədər məbləğ yoxdur.`
                );
            } else {
                toast.error(
                    `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                        amount,
                    ]} ${errData?.currencyCode} çox ola bilməz. Tarix: ${
                        errData?.date
                    }`
                );
            }
        }
    };

    const onCreateCallBack = () => {
        toast.success('Əməliyyat uğurla tamamlandı.', {
            className: 'success-toast',
        });
        history.replace(returnUrl);
    };

    const onCreateCallBackNext = () => {
        toast.success('Əməliyyat uğurla tamamlandı.', {
            className: 'success-toast',
        });
        window.location.reload();
    };

    const filteredCashboxes = allCashBoxNames.filter(
        cashbox => cashbox.type === paymentData.paymentType
    );
    useEffect(() => {
        // if (filteredCashboxes.length === 1) {
        //     setFieldsValue({
        //         AdvanceAccount: filteredCashboxes[0].id,
        //     });
        //     if (filteredCashboxes.length === 1) {
        //         handlePaymentAccountChange(filteredCashboxes[0].id);
        //     }
        // }
    }, [paymentData.paymentType]);

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
                AdvanceAccount: filteredCashboxes?.filter(
                    person => person.name == addedAccount
                )[0]?.id,
            });
        }
        if (
            filteredCashboxes?.filter(person => person.name == addedAccount)[0]
        ) {
            SetaccountVisible(false);
            handlePaymentAccountChange(
                filteredCashboxes?.filter(
                    person => person.name == addedAccount
                )[0]?.id
            );
            SetAddedAccount(null);
        }
    }, [allCashBoxNames.length, addedAccount]);

    const ajaxContactsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
        fetchContacts(filters, data => {
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
                if (page === 1) {
                    setFieldsValue({
                        counterparty:
                            contacts.length === 1
                                ? contacts[0].id
                                : getFieldValue('counterparty'),
                    });
                    if (contacts.length === 1) {
                        handleChangeCounterparty(contacts[0].id);
                    }
                }
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setContacts(appendList);
            } else {
                setContacts(contacts.concat(appendList));
            }
        });
    };

    return (
        <>
            <AddAccount
                accountVisible={accountVisible}
                SetaccountVisible={SetaccountVisible}
                Account={filteredCashboxes}
                SetAddedAccount={SetAddedAccount}
                activeTab={paymentData.paymentType}
            />
            <ContactAdd
                visible={contactItem}
                toggleVisible={setContactItem}
                setData={setData}
                ajaxContactsSelectRequest={ajaxContactsSelectRequest}
            />
            <Spin spinning={lastDateLoading || false}>
                {/* lastDateLoading */}
                <Form onSubmit={handleCompleteOperation}>
                    <div className={styles.parentBox}>
                        <div className={styles.paper}>
                            <div style={{ position: 'relative' }}>
                                <Tooltip title="Əlaqə əlavə et">
                                    <PlusIcon
                                        color="#FF716A"
                                        className={styles.plusBtn}
                                        onClick={handleContactItem}
                                    />
                                </Tooltip>
                                <ProFormItem
                                    label="Qarşı tərəf"
                                    help={getFieldError('counterparty')?.[0]}
                                >
                                    {getFieldDecorator('counterparty', {
                                        getValueFromEvent: account => {
                                            handleChangeCounterparty(account);
                                            return account;
                                        },
                                        rules: [requiredRule],
                                    })(
                                        // <ProSelect
                                        //     size="large"
                                        //     data={contacts}
                                        //     allowClear={false}
                                        // />
                                        <ProAsyncSelect
                                            allowClear={false}
                                            selectRequest={
                                                ajaxContactsSelectRequest
                                            }
                                            disabled={isDisabled}
                                            data={
                                                editId && operationsList
                                                    ? [
                                                          {
                                                              id:
                                                                  operationsList[0]
                                                                      ?.contactId,
                                                              name:
                                                                  operationsList[0]
                                                                      ?.contactOrEmployee,
                                                          },
                                                          ...contacts.filter(
                                                              contact =>
                                                                  contact.id !==
                                                                  operationsList[0]
                                                                      ?.contactId
                                                          ),
                                                      ]
                                                    : contacts
                                            }
                                        />
                                    )}
                                </ProFormItem>
                                {getFieldValue('counterparty') &&
                                    (permissionsList
                                        .transaction_recievables_report
                                        .permission !== 0 &&
                                    permissionsList.transaction_payables_report
                                        .permission !== 0 ? (
                                        <CashboxInfoButton
                                            fetchInfo={callback =>
                                                fetchInvoiceListByContactId(
                                                    getFieldValue(
                                                        'counterparty'
                                                    ),
                                                    callback
                                                )
                                            }
                                            fetchAdvance={callback =>
                                                fetchAdvancePaymentByContactId(
                                                    getFieldValue(
                                                        'counterparty'
                                                    ),
                                                    {
                                                        businessUnitIds: cookies.get(
                                                            '_TKN_UNIT_'
                                                        )
                                                            ? [
                                                                  cookies.get(
                                                                      '_TKN_UNIT_'
                                                                  ),
                                                              ]
                                                            : undefined,
                                                        dateTime: getFieldValue(
                                                            'operationDate'
                                                        ).format(
                                                            fullDateTimeWithSecond
                                                        ),
                                                    },
                                                    callback
                                                )
                                            }
                                        />
                                    ) : null)}
                            </div>
                            {getFieldValue('counterparty') && (
                                <AccountBalance
                                    label="Balans:"
                                    keys={['amount', 'code', 'currencyId']}
                                    type="Tenant balance"
                                    loading={advanceLoading}
                                    list={Object.values(advanceBalance)}
                                    typeOfPayment={paymentData.paymentType}
                                    editId={editId}
                                    operationsList={operationsList?.map(
                                        list => ({
                                            ...list,
                                            cashboxId: list.contactId,
                                        })
                                    )}
                                    selectedAccount={getFieldValue(
                                        'counterparty'
                                    )}
                                />
                            )}
                        </div>

                        <div className={styles.paper}>
                            <OperationType
                                disabled={isDisabled}
                                value={getFieldValue('category')}
                                onClickType={changeOperationType}
                            />
                            <ProFormItem
                                label="Əməliyyatın kateqoriyası"
                                help={getFieldError('category')?.[0]}
                                keys={['name']}
                            >
                                {getFieldDecorator('category', {
                                    getValueFromEvent: category => category,
                                    rules: [requiredRule],
                                })(
                                    <ProSelect
                                        data={[
                                            { name: 'Avans mədaxil', id: 1 },
                                            { name: 'Avans məxaric', id: -1 },
                                        ]}
                                        allowClear={false}
                                        disabled
                                    />
                                )}
                            </ProFormItem>
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
                                        disabled={isDisabled}
                                    />
                                )}
                            </ProFormItem>

                            <TypeOfPayment
                                typeOfPayment={paymentData.paymentType}
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
                                            help={
                                                getFieldError(
                                                    'AdvanceAccount'
                                                )?.[0]
                                            }
                                        >
                                            {getFieldDecorator(
                                                'AdvanceAccount',
                                                {
                                                    getValueFromEvent: account => {
                                                        handlePaymentAccountChange(
                                                            account
                                                        );
                                                        return account;
                                                    },
                                                    rules: [requiredRule],
                                                }
                                            )(
                                                <ProSelect
                                                    data={allCashBoxNames.filter(
                                                        cashbox =>
                                                            cashbox.type ===
                                                            paymentData.paymentType
                                                    )}
                                                    allowClear={false}
                                                />
                                            )}
                                        </ProFormItem>
                                    </div>
                                </Col>
                            </Row>
                            {getFieldValue('AdvanceAccount') && (
                                <AccountBalance
                                    label="Əməliyyat tarixi üzrə qalıq:"
                                    list={paymentData.accountBalance}
                                    loading={balanceLoading}
                                    typeOfPayment={paymentData.paymentType}
                                    editId={editId}
                                    operationsList={operationsList}
                                    selectedAccount={getFieldValue(
                                        'AdvanceAccount'
                                    )}
                                />
                            )}

                            <Row style={{ margin: '10px 0' }}>
                                <Col span={18}>
                                    <ProFormItem
                                        label="Ödəniləcək məbləğ"
                                        help={
                                            getFieldError('paymentAmount')?.[0]
                                        }
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
                                        })(<ProInput disabled={isDisabled} />)}
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
                                                disabled={isDisabled}
                                                loading={currenciesLoading}
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                            </Row>

                            {/* get note from user */}
                            <Row style={{ margin: '10px 0 60px 0' }}>
                                <Col span={24}>
                                    <ProFormItem
                                        label="Əlavə məlumat"
                                        help={getFieldError('description')?.[0]}
                                        customStyle={styles.formItem}
                                    >
                                        {getFieldDecorator('description', {
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
                                    loading={paymentLoading}
                                    disabled={paymentLoading}
                                    htmlType="submit"
                                    type="primary"
                                    className={styles.submit}
                                >
                                    Təsdiq et
                                </Button>
                                {editId ? null : (
                                    <Button
                                        loading={paymentLoading}
                                        disabled={paymentLoading}
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
                                {/* <Can I={read} a={permissions.transaction}> */}
                                <Link to="/finance/operations/?tab=1">
                                    <Button>İmtina et</Button>
                                </Link>
                                {/* </Can> */}
                            </div>
                        </div>
                    </div>
                </Form>
            </Spin>
        </>
    );
}

const mapStateToProps = state => ({
    contacts: state.contactsReducer.contacts,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    currencies: state.kassaReducer.currencies,
    // Loadings
    balanceLoading: state.loadings.accountBalance,
    lastDateLoading: state.loadings.lastDateOfAdvanceByContactId,
    isLoading: state.kassaReducer.isLoading,
    paymentLoading: state.loadings.createAdvancePayment,
    advanceLoading: state.loadings.advancePaymentByContactId,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
    operationsList: state.financeOperationsReducer.operationsList,
    currenciesLoading: state.loadings.fetchCurrencies,
});
export default connect(
    mapStateToProps,
    {
        fetchContacts,
        fetchCurrencies,
        fetchAllCashboxNames,
        fetchAccountBalance,
        createAdvancePayment,
        editAdvancePayment,
        fetchAdvancePaymentByContactId,
        fetchInvoiceListByContactId,
        fetchLastDateOfAdvanceByContactId,
    }
)(Form.create({ name: 'AdvanceForm' })(Advance));
