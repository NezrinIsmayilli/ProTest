/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import moment from 'moment';
import { Link, useHistory } from 'react-router-dom';
import {
    fetchAccountBalance,
    fetchCreationBalance,
} from 'store/actions/finance/operations';
import {
    createBalancePayment,
    editBalancePayment,
} from 'store/actions/finance/initialBalance';
import {
    fetchCurrencies,
    fetchAllCashboxNames,
} from 'store/actions/settings/kassa';
import { fetchUsers } from 'store/actions/users';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { Button, Form, Row, Col, Tooltip } from 'antd';
import { FaChevronRight } from 'react-icons/fa';
import { requiredRule } from 'utils/rules';
import { roundToDown, fullDateTimeWithSecond, round } from 'utils';
import {
    ProDatePicker,
    ProSelect,
    ProFormItem,
    ProTextArea,
    ProInput,
    ProAsyncSelect,
} from 'components/Lib';
import { toast } from 'react-toastify';
import roundTo from 'round-to';
import AddAccount from '../shared/AddAccount';
import styles from '../styles.module.scss';
import { TypeOfPayment, AccountBalance, OperationType } from '../shared';

const math = require('exact-math');

function disabledDate(current) {
    return current && current >= moment().endOf('day');
}

function Balance(props) {
    const {
        allCashBoxNames,
        fetchAccountBalance,
        fetchCreationBalance,
        tenantBalanceLoading,
        createBalancePayment,
        editBalancePayment,
        fetchAllCashboxNames,
        balanceLoading,
        currencies,
        form,
        returnUrl,
        editId,
        operationsList,
        fetchCurrencies,
        fetchUsers,
        currenciesLoading,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    const [tenantBalance, setTenantBalance] = useState({});
    const [paymentData, setPaymentData] = useState({
        operationType: 1,
        paymentType: 1,
        accountBalance: [],
    });
    const [loader, setLoader] = useState(false);
    const history = useHistory();
    const [employees, setEmployees] = useState([]);
    const [accountVisible, SetaccountVisible] = useState(false);
    const [addedAccount, SetAddedAccount] = useState(null);

    useEffect(() => {
        if (editId && operationsList?.length > 0) {
            setFieldsValue({
                counterparty: operationsList[0].relatedTenantPersonId,
                currency:
                    editId && operationsList
                        ? operationsList[0]?.currencyId
                        : currencies[0].id,
                Baccount: operationsList[0]?.cashboxId || undefined,
                paymentAmount: round(operationsList[0]?.amount),
            });
            handleCounterpartyChange(operationsList[0].relatedTenantPersonId);
            handlePaymentTypeChange(
                operationsList[0]?.paymentTypeId,
                operationsList[0]?.cashboxId || undefined
            );
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

    const handleCounterpartyChange = counterparty => {
        if (counterparty) {
            fetchCreationBalance(
                counterparty,
                {
                    businessUnitIds: cookies.get('_TKN_UNIT_')
                        ? [cookies.get('_TKN_UNIT_')]
                        : undefined,
                },
                fetchAdvancePaymentCallback
            );
            setTenantBalance({});
        }
    };

    const fetchAdvancePaymentCallback = ({ data }) => {
        const tenantBalance = {};
        if (data.length > 0) {
            data.forEach(
                balance => (tenantBalance[balance.currencyId] = balance)
            );
        }
        return setTenantBalance(tenantBalance);
    };

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

    const handlePaymentTypeChange = (paymentType, paymentId) => {
        setPaymentData(prevPaymentData => ({
            ...prevPaymentData,
            paymentType,
        }));
        setFieldsValue({
            Baccount: paymentId || undefined,
        });
        if (filteredCashboxes.length === 1) {
            setFieldsValue({
                Baccount: filteredCashboxes[0].id,
            });
            if (filteredCashboxes.length === 1) {
                handlePaymentAccountChange(filteredCashboxes[0].id);
            }
        }
    };
    useEffect(() => {
        if (getFieldValue(`Baccount`)) {
            handlePaymentAccountChange(getFieldValue(`Baccount`));
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
        if (currencies?.length > 0 && employees?.length > 0) {
            const selectedEmployee =
                employees.filter(employee => employee.isChief)?.length === 1
                    ? employees.filter(employee => employee.isChief)?.[0]?.id
                    : undefined;
            if (selectedEmployee) {
                handleCounterpartyChange(selectedEmployee);
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
                    counterparty: selectedEmployee,
                });
            } else {
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
            }
        }
    }, [currencies, employees]);

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

    const ajaxContactsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = {
            limit,
            page,
            'filters[search]': search,
            businessUnitIds: editId
                ? operationsList[0]?.businessUnitId === null
                    ? [0]
                    : [operationsList[0]?.businessUnitId]
                : cookies.get('_TKN_UNIT_')
                ? [cookies.get('_TKN_UNIT_')]
                : undefined,
            isAdmin: 1,
        };
        fetchUsers({
            filters,
            onSuccessCallback: data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }

                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!appendList.length);
                }
                if (stateReset) {
                    setEmployees(appendList);
                } else {
                    setEmployees(employees.concat(appendList));
                }
            },
        });
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
                    Baccount,
                    paymentAmount,
                    currency,
                    description,
                    category,
                } = values;

                setLoader(true);

                const data = {
                    relatedTenantPerson: counterparty,
                    type: category,
                    dateOfTransaction: operationDate.format(
                        fullDateTimeWithSecond
                    ),
                    cashbox: Baccount,
                    typeOfPayment: paymentData.paymentType,
                    amount: roundTo(Number(paymentAmount), 2),
                    currency,
                    description: description || null,
                };
                if (nextSubmit) {
                    if (editId) {
                        editBalancePayment(
                            editId,
                            data,
                            onCreateCallBackNext,
                            onFailureEdit
                        );
                    } else {
                        createBalancePayment(
                            data,
                            onCreateCallBackNext,
                            onFailure
                        );
                    }
                } else if (editId) {
                    editBalancePayment(
                        editId,
                        data,
                        onCreateCallBack,
                        onFailureEdit
                    );
                } else {
                    createBalancePayment(data, onCreateCallBack, onFailure);
                }
            }
        });
    };

    const filteredCashboxes = allCashBoxNames.filter(
        cashbox => cashbox.type === paymentData.paymentType
    );

    // useEffect(() => {
    //     if (filteredCashboxes) {
    //         setFieldsValue({
    //             Baccount:
    //                 filteredCashboxes.length === 1
    //                     ? filteredCashboxes[0].id
    //                     : undefined,
    //         });
    //         if (filteredCashboxes.length === 1) {
    //             handlePaymentAccountChange(filteredCashboxes[0].id);
    //         }
    //     }
    // }, [paymentData.paymentType]);

    useEffect(() => {
        if (addedAccount) {
            fetchAllCashboxNames({
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
                limit: 1000,
            });
            setFieldsValue({
                Baccount: filteredCashboxes?.filter(
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

    const onCreateCallBack = () => {
        setLoader(false);
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
    const onFailureEdit = ({ error }) => {
        setLoader(false);
        const errData = error?.response?.data?.error?.errorData;
        const cashboxName =
            errData?.cashbox.length > 15
                ? `${errData?.cashbox.substring(0, 15)} ...`
                : errData?.cashbox;
        if (operationsList[0]?.operationDirectionId === 1) {
            if (
                errData?.cashbox ===
                    allCashBoxNames
                        .filter(
                            cashbox => cashbox.type === paymentData.paymentType
                        )
                        .find(acc => acc.id === getFieldValue('Baccount'))
                        .name ||
                errData?.currencyCode ===
                    currencies.find(
                        curr => curr.id === getFieldValue('currency')
                    ).code
            ) {
                if (
                    getFieldValue('category') === -1 &&
                    operationsList[0]?.currencyId ===
                        getFieldValue('currency') &&
                    operationsList[0]?.cashboxId === getFieldValue('Baccount')
                ) {
                    const amount = math.sub(
                        Number(math.mul(Number(errData.amount || 0), -1)),
                        Number(getFieldValue('paymentAmount'))
                    );
                    toast.error(
                        `Əməliyyat növü dəyişdirilə bilməz. ${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                            amount,
                        ]} ${errData?.currencyCode} az ola bilməz. Tarix:  ${
                            errData?.date
                        }`
                    );
                } else {
                    const amount = math.mul(Number(errData.amount || 0), -1);
                    toast.error(
                        `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                            amount,
                        ]} ${errData?.currencyCode} az ola bilməz. Tarix: ${
                            errData?.date
                        }`
                    );
                }
            } else if (getFieldValue('category') === 1) {
                const amount = math.mul(Number(errData.amount || 0), -1);
                toast.error(
                    `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                        amount,
                    ]} ${errData?.currencyCode} az ola bilməz. Tarix: ${
                        errData?.date
                    }`
                );
            } else {
                const amount = math.sub(
                    Number(math.mul(Number(errData.amount || 0), -1)),
                    Number(getFieldValue('paymentAmount'))
                );
                if (Number(amount) <= 0) {
                    toast.error(
                        `Seçilmiş kassada ${errData?.currencyCode} valyutasında kifayət qədər məbləğ yoxdur.`
                    );
                } else {
                    toast.error(
                        `Əməliyyat növü dəyişdirilə bilməz. ${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                            amount,
                        ]} ${errData?.currencyCode} az ola bilməz. Tarix:  ${
                            errData?.date
                        }`
                    );
                }
            }
            // const amount =
            //     errData?.cashbox ===
            //         allCashBoxNames
            //             .filter(
            //                 cashbox => cashbox.type === paymentData.paymentType
            //             )
            //             .find(acc => acc.id === getFieldValue('Baccount'))
            //             .name &&
            //     errData?.currencyCode ===
            //         currencies.find(
            //             curr => curr.id === getFieldValue('currency')
            //         ).code
            //         ? math.sub(
            //               Number(getFieldValue('paymentAmount')),
            //               Number(errData.amount)
            //           )
            //         : math.mul(Number(errData.amount || 0), -1);
            // toast.error(
            //     getFieldValue('category') === -1
            //         ? `Əməliyyat növü dəyişdirilə bilməz. ${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
            //               amount,
            //           ]} ${errData?.currencyCode} az ola bilməz. Tarix:  ${
            //               errData?.date
            //           }`
            //         : `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
            //               amount,
            //           ]} ${errData?.currencyCode} az ola bilməz. Tarix: ${
            //               errData?.date
            //           }`
            // );
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
    const onFailure = () => {
        setLoader(false);
    };
    const chiefEmployee = employees.filter(employee => employee.isChief);
    useEffect(() => {
        if (chiefEmployee.length === 1) {
            setFieldsValue({
                counterparty: chiefEmployee[0].id,
            });
            handleCounterpartyChange(chiefEmployee[0].id);
        }
    }, [employees]);
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
                            label="Təsisçi"
                            help={getFieldError('counterparty')?.[0]}
                        >
                            {getFieldDecorator('counterparty', {
                                getValueFromEvent: account => {
                                    handleCounterpartyChange(account);
                                    return account;
                                },
                                rules: [requiredRule],
                            })(
                                // <ProSelect
                                //     data={employees.filter(
                                //         employee => employee.isChief
                                //     )}
                                //     keys={['name', 'lastName']}
                                //     allowClear={false}
                                // />
                                <ProAsyncSelect
                                    keys={['name', 'lastName']}
                                    allowClear={false}
                                    selectRequest={ajaxContactsSelectRequest}
                                    data={
                                        editId && operationsList
                                            ? [
                                                  {
                                                      id:
                                                          operationsList[0]
                                                              ?.relatedTenantPersonId,
                                                      name:
                                                          operationsList[0]
                                                              ?.contactOrEmployee,
                                                  },
                                                  ...employees.filter(
                                                      client =>
                                                          client.id !==
                                                          operationsList[0]
                                                              ?.relatedTenantPersonId
                                                  ),
                                              ]
                                            : employees
                                    }
                                />
                            )}
                        </ProFormItem>

                        {getFieldValue('counterparty') && (
                            <AccountBalance
                                label="Balans:"
                                keys={['amount', 'code', 'currencyId']}
                                type="Tenant balance"
                                loading={tenantBalanceLoading}
                                list={Object.values(tenantBalance)}
                                typeOfPayment={paymentData.paymentType}
                                editId={editId}
                                operationsList={operationsList?.map(list => ({
                                    ...list,
                                    cashboxId: list.relatedTenantPersonId,
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
                                        { name: 'Təsisçidən mədaxil', id: 1 },
                                        { name: 'Təsisçidən məxaric', id: -1 },
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
                                    format={fullDateTimeWithSecond}
                                    disabledDate={disabledDate}
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
                                        help={getFieldError('Baccount')?.[0]}
                                    >
                                        {getFieldDecorator('Baccount', {
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
                        {getFieldValue('Baccount') && (
                            <AccountBalance
                                label="Əməliyyat tarixi üzrə qalıq:"
                                list={paymentData.accountBalance}
                                loading={balanceLoading}
                                editId={editId}
                                operationsList={operationsList}
                                typeOfPayment={paymentData.paymentType}
                                selectedAccount={getFieldValue('Baccount')}
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
                                loading={loader}
                                disabled={loader}
                                htmlType="submit"
                                type="primary"
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
    currencies: state.kassaReducer.currencies,
    isLoading: state.kassaReducer.isLoading,
    cashBoxBalance: state.cashBoxBalanceReducer.cashBoxBalance,
    balanceLoading: state.loadings.accountBalance,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    tenantBalanceLoading: state.loadings.tenantBalance,
    operationsList: state.financeOperationsReducer.operationsList,
    currenciesLoading: state.loadings.fetchCurrencies,
});
export default connect(
    mapStateToProps,
    {
        fetchCurrencies,
        fetchAccountBalance,
        fetchAllCashboxNames,
        createBalancePayment,
        editBalancePayment,
        fetchCreationBalance,
        fetchUsers,
    }
)(Form.create({ name: 'BalanceForm' })(Balance));
