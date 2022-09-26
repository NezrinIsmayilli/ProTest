/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import moment from 'moment';
import { Link, useHistory } from 'react-router-dom';
import { fetchWorkers } from 'store/actions/hrm/workers';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import {
    fetchAccountBalance,
    fetchTenantBalance,
} from 'store/actions/finance/operations';
import {
    createTenantPayment,
    editTenantPayment,
} from 'store/actions/finance/initialBalance';
import { Button, Form, Row, Col, Tooltip } from 'antd';
import { FaChevronRight } from 'react-icons/fa';
import { requiredRule } from 'utils/rules';
import { fullDateTimeWithSecond, round } from 'utils';
import {
    ProDatePicker,
    ProSelect,
    ProFormItem,
    ProTextArea,
    ProInput,
} from 'components/Lib';

import { fetchLastDateOfBalanceByContactId } from 'store/actions/contact';

import { toast } from 'react-toastify';
import roundTo from 'round-to';
import {
    fetchCurrencies,
    fetchAllCashboxNames,
} from 'store/actions/settings/kassa';
import AddAccount from '../shared/AddAccount';
import styles from '../styles.module.scss';
import { TypeOfPayment, AccountBalance, OperationType } from '../shared';

const math = require('exact-math');

function disabledDate(current) {
    return current && current >= moment().endOf('day');
}

function Tenant(props) {
    const {
        fetchAllCashboxNames,
        workers,
        workersLoading,
        allCashBoxNames,
        fetchAccountBalance,
        createTenantPayment,
        fetchWorkers,
        currencies,
        form,
        returnUrl,
        editId,
        balanceLoading,
        paymentLoading,
        tenantBalanceLoading,
        fetchTenantBalance,
        fetchCurrencies,
        operationsList,
        editTenantPayment,
        fetchLastDateOfBalanceByContactId,
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
    const [creationBalance, setCreationBalance] = useState({});

    const history = useHistory();
    const [accountVisible, SetaccountVisible] = useState(false);
    const [addedAccount, SetAddedAccount] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);

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
            fetchLastDateOfBalanceByContactId(
                operationsList[0].employeeId,
                ({ data }) => {
                    if (data !== null) {
                        setIsDisabled(
                            moment(
                                operationsList[0]?.dateOfTransaction,
                                fullDateTimeWithSecond
                            )?.isBefore(moment(data, 'DD-MM-YYYY HH:mm:ss'))
                        );
                    }
                }
            );
            setFieldsValue({
                counterparty: operationsList[0].employeeId,
                Taccount: operationsList[0]?.cashboxId,
                paymentAmount: round(operationsList[0]?.amount),
            });
            handleCounterpartyChange(operationsList[0].employeeId);
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
            currency:
                editId && operationsList
                    ? operationsList[0]?.currencyId
                    : currencies[0]?.id,
        });
    }, [editId, operationsList]);

    const changeOperationType = operationType => {
        setFieldsValue({ category: operationType });
    };

    const handlePaymentAmount = event => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value) && event.target.value <= 1000000)
            return event.target.value;
        if (event.target.value === '') return null;
        return getFieldValue('paymentAmount');
    };

    const handleCounterpartyChange = counterparty => {
        fetchTenantBalance(
            counterparty,
            {
                businessUnitIds: editId
                    ? operationsList[0]?.businessUnitId === null
                        ? [0]
                        : [operationsList[0]?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
                dateTime: getFieldValue('operationDate')?.format(
                    fullDateTimeWithSecond
                ),
            },
            fetchTenantBalanceCallback
        );
    };

    const fetchTenantBalanceCallback = ({ data }) => {
        const creationBalance = {};
        if (data.length > 0) {
            data.forEach(
                balance => (creationBalance[balance.currencyId] = balance)
            );
        }
        return setCreationBalance(creationBalance);
    };
    const handlePaymentTypeChange = paymentType => {
        setPaymentData(prevPaymentData => ({
            ...prevPaymentData,
            paymentType,
        }));
        setFieldsValue({
            Taccount: undefined,
        });
        if (filteredCashboxes.length === 1) {
            setFieldsValue({
                Taccount: filteredCashboxes[0].id,
            });
            if (filteredCashboxes.length === 1) {
                handlePaymentAccountChange(filteredCashboxes[0].id);
            }
        }
    };
    useEffect(() => {
        if (getFieldValue(`Taccount`)) {
            handlePaymentAccountChange(getFieldValue(`Taccount`));
        }
        if (getFieldValue('counterparty')) {
            fetchTenantBalance(
                getFieldValue('counterparty'),
                {
                    businessUnitIds: editId
                        ? operationsList[0]?.businessUnitId === null
                            ? [0]
                            : [operationsList[0]?.businessUnitId]
                        : cookies.get('_TKN_UNIT_')
                        ? [cookies.get('_TKN_UNIT_')]
                        : undefined,
                    dateTime: getFieldValue('operationDate')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                fetchTenantBalanceCallback
            );
        }
    }, [getFieldValue('operationDate')]);
    const handlePaymentAccountChange = paymentAccountId => {
        fetchAccountBalance({
            id: paymentAccountId,
            filters: {
                dateTime: getFieldValue('operationDate')?.format(
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
        if (currencies?.length > 0 && workers.length > 0) {
            handleCounterpartyChange(
                editId && operationsList
                    ? operationsList[0]?.employeeId
                    : workers[0].id
            );
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
                counterparty:
                    editId && operationsList
                        ? operationsList[0]?.employeeId
                        : workers[0].id,
            });
        }
    }, [currencies, workers]);

    useEffect(() => {
        fetchCurrencies({ limit: 1000 });
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
                fetchWorkers({
                    filters: {
                        businessUnitIds:
                            operationsList[0]?.businessUnitId === null
                                ? [0]
                                : [operationsList[0]?.businessUnitId],
                        lastEmployeeActivityType: 1,
                    },
                });
            }
        } else if (cookies.get('_TKN_UNIT_')) {
            fetchAllCashboxNames({
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
                limit: 1000,
            });
            fetchWorkers({
                filters: {
                    businessUnitIds: [cookies.get('_TKN_UNIT_')],
                    lastEmployeeActivityType: 1,
                },
            });
        } else {
            fetchAllCashboxNames({ limit: 1000 });
            fetchWorkers({ filters: { lastEmployeeActivityType: 1 } });
        }
    }, [cookies.get('_TKN_UNIT_')]);

    const onFailure = ({ error }) => {
        const errData = error?.response?.data?.error?.errorData;
        const cashboxName =
            errData?.cashbox.length > 15
                ? `${errData?.cashbox.substring(0, 15)} ...`
                : errData?.cashbox;
        if (editId && operationsList[0]?.operationDirectionId === 1) {
            const amount =
                errData?.cashbox ===
                    allCashBoxNames
                        .filter(
                            cashbox => cashbox.type === paymentData.paymentType
                        )
                        .find(acc => acc.id === getFieldValue('Taccount'))
                        .name &&
                errData?.currencyCode ===
                    currencies.find(
                        curr => curr.id === getFieldValue('currency')
                    ).code
                    ? math.sub(
                          Number(getFieldValue('paymentAmount')),
                          Number(errData.amount)
                      )
                    : math.mul(Number(errData.amount || 0), -1);
            toast.error(
                `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
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
                    Taccount,
                    paymentAmount,
                    currency,
                    description,
                    category,
                } = values;

                const data = {
                    employee: counterparty,
                    type: category,
                    dateOfTransaction: operationDate.format(
                        fullDateTimeWithSecond
                    ),
                    cashbox: Taccount,
                    typeOfPayment: paymentData.paymentType,
                    amount: roundTo(Number(paymentAmount), 2),
                    currency,
                    description: description || null,
                };
                if (nextSubmit) {
                    if (editId) {
                        editTenantPayment(
                            editId,
                            data,
                            onCreateCallBackNext,
                            onFailure
                        );
                    } else {
                        createTenantPayment(
                            data,
                            onCreateCallBackNext,
                            onFailure
                        );
                    }
                } else if (editId) {
                    editTenantPayment(
                        editId,
                        data,
                        onCreateCallBack,
                        onFailure
                    );
                } else {
                    createTenantPayment(data, onCreateCallBack, onFailure);
                }
            }
        });
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
        // if (filteredCashboxes) {
        //     setFieldsValue({
        //         Taccount:
        //             filteredCashboxes.length === 1
        //                 ? filteredCashboxes[0].id
        //                 : undefined,
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
                Taccount: filteredCashboxes?.filter(
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

    // useEffect(() => {
    //     if (workers.length === 1) {
    //         setFieldsValue({
    //             counterparty: workers[0].id,
    //         });
    //         handleCounterpartyChange(workers[0].id);
    //     }
    // }, [workers]);

    return (
        <>
            <AddAccount
                accountVisible={accountVisible}
                SetaccountVisible={SetaccountVisible}
                Account={filteredCashboxes}
                SetAddedAccount={SetAddedAccount}
                activeTab={paymentData.paymentType}
            />
            <Form onSubmit={handleCompleteOperation}>
                <div className={styles.parentBox}>
                    <div className={styles.paper}>
                        <ProFormItem
                            label="Əməkdaş"
                            help={getFieldError('counterparty')?.[0]}
                        >
                            {getFieldDecorator('counterparty', {
                                getValueFromEvent: account => {
                                    handleCounterpartyChange(account);
                                    return account;
                                },
                                rules: [requiredRule],
                            })(
                                <ProSelect
                                    data={
                                        editId && operationsList
                                            ? [
                                                  {
                                                      id:
                                                          operationsList[0]
                                                              ?.employeeId,
                                                      name:
                                                          operationsList[0]
                                                              ?.contactOrEmployee,
                                                  },
                                                  ...workers.filter(
                                                      worker =>
                                                          worker.id !==
                                                          operationsList[0]
                                                              ?.employeeId
                                                  ),
                                              ]
                                            : workers
                                    }
                                    keys={['name', 'surname', 'patronymic']}
                                    loading={workersLoading}
                                    allowClear={false}
                                    disabled={isDisabled}
                                />
                            )}
                        </ProFormItem>
                        {getFieldValue('counterparty') && (
                            <AccountBalance
                                label="Balans:"
                                keys={['amount', 'code', 'currencyId']}
                                type="Tenant balance"
                                loading={tenantBalanceLoading}
                                list={Object.values(creationBalance)}
                                typeOfPayment={paymentData.paymentType}
                                editId={editId}
                                operationsList={operationsList?.map(list => ({
                                    ...list,
                                    cashboxId: list.employeeId,
                                    operationDirectionId:
                                        list.cashInOrCashOut === -1 ? 1 : -1,
                                }))}
                                selectedAccount={getFieldValue('counterparty')}
                            />
                        )}
                    </div>

                    <div className={styles.paper}>
                        <OperationType
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
                                        {
                                            name:
                                                'Əməkdaşdan pulların alınması',
                                            id: 1,
                                        },
                                        {
                                            name: 'Əməkdaşa pulların verilməsi',
                                            id: -1,
                                        },
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
                                        help={getFieldError('Taccount')?.[0]}
                                    >
                                        {getFieldDecorator('Taccount', {
                                            getValueFromEvent: account => {
                                                handlePaymentAccountChange(
                                                    account
                                                );
                                                return account;
                                            },
                                            rules: [requiredRule],
                                        })(
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
                        {getFieldValue('Taccount') && (
                            <AccountBalance
                                label="Əməliyyat tarixi üzrə qalıq:"
                                list={paymentData.accountBalance}
                                loading={balanceLoading}
                                typeOfPayment={paymentData.paymentType}
                                editId={editId}
                                operationsList={operationsList}
                                selectedAccount={getFieldValue('Taccount')}
                            />
                        )}

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
        </>
    );
}

const mapStateToProps = state => ({
    workers: state.workersReducer.workers,
    workersLoading: state.loadings.fetchWorkers,
    currencies: state.kassaReducer.currencies,
    isLoading: state.kassaReducer.isLoading,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    cashBoxBalance: state.cashBoxBalanceReducer.cashBoxBalance,
    convertedAmount: state.convertCurrency.convertedAmount,
    balanceLoading: state.loadings.accountBalance,
    paymentLoading: state.loadings.createTenantPayment,
    tenantBalanceLoading: state.loadings.tenantBalance,
    operationsList: state.financeOperationsReducer.operationsList,
    currenciesLoading: state.loadings.fetchCurrencies,
});
export default connect(
    mapStateToProps,
    {
        fetchCurrencies,
        fetchAllCashboxNames,
        fetchWorkers,
        fetchAccountBalance,
        createTenantPayment,
        fetchTenantBalance,
        editTenantPayment,
        fetchLastDateOfBalanceByContactId,
    }
)(Form.create({ name: 'TenantForm' })(Tenant));
