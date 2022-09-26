/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import moment from 'moment';
import { Link, useHistory, useParams } from 'react-router-dom';
import { fetchWorkers } from 'store/actions/hrm/workers';

import {
    fetchTenantBalance,
    fetchAccountBalance,
} from 'store/actions/finance/operations';
import {
    fetchAllCashboxNames,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import {
    editInvoice,
    fetchProductionInfo,
    fetchProductionMaterialExpense,
    fetchProductionEmployeeExpense,
    fetchProductionExpense,
    setSelectedProductionEmployeeExpense,
    setSelectedProductionExpense,
    setSelectedProductionMaterial,
    fetchMaterialList,
    fetchProductionExpensesList,
    editTransferProduction,
    editProductionCost,
    createProductionProductOrder,
    fetchProductionProductOrder,
    handleResetInvoiceFields,
} from 'store/actions/sales-operation';
import {
    createExpensePayment,
    editExpensePayment,
} from 'store/actions/finance/initialBalance';
import { fetchExpenseCatalogs } from 'store/actions/expenseItem';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { Button, Form, Row, Col, Divider, Tooltip } from 'antd';
import { fetchContracts } from 'store/actions/contracts';
import { FaChevronRight } from 'react-icons/fa';
import { requiredRule } from 'utils/rules';
import {
    messages,
    round,
    roundToDown,
    fullDateTimeWithSecond,
    today,
    dateFormat,
    defaultNumberFormat,
} from 'utils';
import {
    ProDatePicker,
    ProSelect,
    ProFormItem,
    ProTextArea,
    ProInput,
    ProUpload,
    UpdateExpenseModal,
} from 'components/Lib';
import { accessTypes } from 'config/permissions';
import { fetchLastDateOfBalanceByContactId } from 'store/actions/contact';

import { toast } from 'react-toastify';
import {
    TypeOfPayment,
    OperationType,
    AccountBalance,
    AdvancePayment,
    ExpenseRow,
} from '../shared';
import styles from '../styles.module.scss';
import AddAccount from '../shared/AddAccount';

const math = require('exact-math');
const roundTo = require('round-to');

// Can not select days after today
function disabledDate(current, date) {
    return current && current >= moment(date, dateFormat).endOf('day');
}

function Payment(props) {
    const {
        fetchAllCashboxNames,
        workers,
        tenant,
        allCashBoxNames,
        currencies,
        contracts,
        fetchAccountBalance,
        fetchSalesInvoiceList,
        productionInvoices,
        fetchWorkers,
        fetchTenantBalance,
        fetchContracts,
        form,
        returnUrl,
        editId,
        operationsList,
        balanceLoading,
        tenantBalanceLoading,
        createExpensePayment,
        editExpensePayment,
        fetchExpenseCatalogs,
        expenseCatalogs,
        fetchProductionInfo,
        fetchProductionMaterialExpense,
        fetchProductionEmployeeExpense,
        fetchProductionExpense,
        setSelectedProductionEmployeeExpense,
        setSelectedProductionExpense,
        setSelectedProductionMaterial,
        fetchMaterialList,
        fetchProductionExpensesList,
        selectedProductionExpense,
        selectedProductionEmployeeExpense,
        selectedProductionMaterial,
        materialInvoices,
        productionExpensesList,
        editTransferProduction,
        editProductionCost,
        createProductionProductOrder,
        fetchProductionProductOrder,
        fetchCurrencies,
        handleResetInvoiceFields,
        fetchLastDateOfBalanceByContactId,
        // loadings
        materialsLoading,
        productionExpensesListLoading,
        selectedMaterialLoading,
        selectedEmployeeExpenseLoading,
        selectedExpenseLoading,
        currenciesLoading,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    const [paymentData, setPaymentData] = useState({
        operationType: -1,
        paymentType: 1,
        accountBalance: [],
    });
    const dispatch = useDispatch();
    const [advancePayment, setAdvancePayment] = useState({});
    const [useAdvance, setUseAdvance] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [expenses, setExpenses] = useState([undefined]);
    const [loader, setLoader] = useState(false);
    const [currencyCode, setCurrencyCode] = useState(undefined);
    const history = useHistory();
    const [updateModalIsVisible, setUpdateModalIsVisible] = useState(false);
    const [itemIndex, setItemIndex] = useState(undefined);
    const [productionId, setProductionId] = useState(undefined);
    const [productionInfo, setProductionInfo] = useState(undefined);
    const [summaries, setSummaries] = useState(undefined);
    const [productionOrders, setProductionOrders] = useState([]);
    const [allProductionData, setAllProductionData] = useState([]);
    const approveBtnType = React.useRef(false);
    const [accountVisible, SetaccountVisible] = useState(false);
    const [addedAccount, SetAddedAccount] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [date, setDate] = useState(today);

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

    const [defaultUpdateData, setDefaultUpdateData] = useState({
        id: undefined,
        parentId: undefined,
        parentName: undefined,
        expenseType: undefined,
        name: undefined,
        type: undefined,
        editType: undefined,
    });
    const toggleUpdateModal = () => {
        setUpdateModalIsVisible(
            prevUpdateModalIsVisible => !prevUpdateModalIsVisible
        );
    };
    const handleAddModal = (id, index) => {
        setDefaultUpdateData({
            id: undefined,
            name: undefined,
            parentId: id,
            parentName: expenseCatalogs?.root
                ?.filter(({ type }) => type !== 6)
                .find(item => item.id === id).name,
            type: 'item',
            editType: 'new',
        });
        setItemIndex(index);
        toggleUpdateModal();
    };
    const onSuccessItemUpdate = data => {
        toggleUpdateModal();
        fetchExpenseCatalogs();
        setFieldsValue({
            expenses: getFieldValue('expenses').map((expense, expenseIndex) =>
                expenseIndex === itemIndex
                    ? {
                          ...expense,
                          subCatalog: data.data.id,
                      }
                    : expense
            ),
        });
    };
    const handleAdvanceChange = checked => {
        if (checked) {
            const advanceBalance = advancePayment.myAmount;
            const advanceCurrency = advanceBalance?.[0];
            setFieldsValue({
                currency: advanceCurrency?.currencyId,
                Paccount: undefined,
            });
            setCurrencyCode(advanceCurrency.code);
            if (
                operationsList[0]?.employeeId ||
                getFieldValue('counterparty')
            ) {
                fetchLastDateOfBalanceByContactId(
                    operationsList[0]?.employeeId ||
                        getFieldValue('counterparty'),
                    ({ data }) => {
                        if (data !== null) {
                            setDate(data, fullDateTimeWithSecond);
                            setFieldsValue({
                                dateOfTransaction: moment(
                                    data,
                                    fullDateTimeWithSecond
                                ),
                            });
                        }
                    }
                );
            }
        } else {
            setPaymentData(prevPaymentData => ({
                ...prevPaymentData,
                paymentType: 1,
            }));
            setDate(today);
        }
        setUseAdvance(checked);
    };
    const handleExpenseChange = (value, index) => {
        setExpenses(prevExpenses =>
            prevExpenses.map((prevExpense, prevIndex) =>
                prevIndex === index ? Number(value) : prevExpense
            )
        );
    };
    const handleAddExpenseClick = (clickType = 'add', selectedIndex) => {
        if (clickType === 'add') {
            setExpenses(prevExpenses => [...prevExpenses, null]);
        }
        if (clickType === 'remove') {
            setExpenses(prevExpenses =>
                prevExpenses.filter(
                    (prevExpense, index) => index !== selectedIndex
                )
            );
            setFieldsValue({
                expenses: getFieldValue('expenses').filter(
                    (_, index) => index !== selectedIndex
                ),
            });
        }
    };
    const handleCounterpartyChange = counterparty => {
        if (counterparty) {
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
                fetchAdvancePaymentCallback
            );
        }
        setAdvancePayment({});
    };

    const handleTotalAmountChange = () => {
        const totalAmount = getFieldValue('expenses').reduce(
            (total, current) => math.add(total, Number(current.amount) || 0),
            0
        );
        setFieldsValue({ paymentAmount: totalAmount });
    };

    const fetchAdvancePaymentCallback = ({ data }) => {
        const advanceBalance = {};
        if (data.length > 0) {
            data.forEach(
                advance => (advanceBalance[advance.currencyId] = advance)
            );
        }
        return setAdvancePayment({ myAmount: Object.values(advanceBalance) });
    };

    const changeOperationType = operationType => {
        setFieldsValue({ category: undefined, subCategory: undefined });
        setPaymentData(prevPaymentData => ({
            ...prevPaymentData,
            operationType,
        }));
    };

    const handlePaymentAmount = event => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value) && event.target.value <= 1000000)
            return event.target.value;
        if (event.target.value === '') return null;
        return getFieldValue('paymentAmount');
    };

    const handlePaymentTypeChange = (paymentType, edit = false) => {
        setPaymentData(prevPaymentData => ({
            ...prevPaymentData,
            paymentType,
        }));
        const Account = allCashBoxNames.filter(
            cashbox => cashbox.type === paymentType
        );
        if (Account.length === 1) {
            setFieldsValue({
                Paccount: Account[0].id,
            });

            handlePaymentAccountChange(Account[0].id);
        } else if (!edit) {
            setFieldsValue({
                Paccount: undefined,
            });
        }
    };

    useEffect(() => {
        if (getFieldValue(`Paccount`)) {
            fetchAccountBalance({
                id: getFieldValue(`Paccount`),
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
                fetchAdvancePaymentCallback
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

    const handleCurrencyChange = newCurrencyId => {
        const newCurrency = currencies.filter(
            currency => currency.id === newCurrencyId
        )[0];
        if (newCurrency) {
            setCurrencyCode(newCurrency.code);
        }
    };
    useEffect(() => {
        if (currencies?.length > 0) {
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
                // operationDate:
                //     editId && operationsList
                //         ? moment(
                //               operationsList[0]?.dateOfTransaction,
                //               fullDateTimeWithSecond
                //           )
                //         : moment(),
            });
            setCurrencyCode(
                editId && operationsList
                    ? operationsList[0]?.currencyCode
                    : currencies?.filter(
                          currency => currency.id === getFieldValue('currency')
                      ).length > 0
                    ? currencies?.find(
                          currency => currency.id === getFieldValue('currency')
                      ).code
                    : currencies[0].code
            );

            if (editId && operationsList) {
                setFieldsValue({
                    expenses: [
                        {
                            catalog: operationsList[0]?.transactionCatalogId,
                            subCatalog: operationsList[0]?.transactionItemId,
                            amount: round(operationsList[0]?.amount),
                        },
                    ],
                });
            }
        }
    }, [currencies, operationsList]);

    useEffect(() => {
        fetchExpenseCatalogs();
        fetchCurrencies({ withRatesOnly: 1, limit: 1000 });
        return () => {
            handleResetInvoiceFields();
        };
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
                fetchContracts({
                    limit: 1000,
                    businessUnitIds:
                        operationsList[0]?.businessUnitId === null
                            ? [0]
                            : [operationsList[0]?.businessUnitId],
                });
                fetchSalesInvoiceList({
                    filters: {
                        invoiceTypes: [11],
                        allProduction: 1,
                        isDeleted: 0,
                        businessUnitIds:
                            operationsList[0]?.businessUnitId === null
                                ? [0]
                                : [operationsList[0]?.businessUnitId],
                        limit: 10000,
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
            fetchContracts({
                limit: 1000,
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
            });
            fetchSalesInvoiceList({
                filters: {
                    invoiceTypes: [11],
                    allProduction: 1,
                    isDeleted: 0,
                    businessUnitIds: [cookies.get('_TKN_UNIT_')],
                    limit: 10000,
                },
            });
        } else {
            fetchAllCashboxNames({ limit: 1000 });
            fetchWorkers({ filters: { lastEmployeeActivityType: 1 } });
            fetchContracts({ limit: 1000 });
            fetchSalesInvoiceList({
                filters: {
                    invoiceTypes: [11],
                    allProduction: 1,
                    isDeleted: 0,
                    limit: 10000,
                },
            });
        }
    }, [cookies.get('_TKN_UNIT_'), editId, operationsList]);

    useEffect(() => {
        handleTotalAmountChange();
    }, [expenses]);

    const Account = allCashBoxNames.filter(
        cashbox => cashbox.type === paymentData.paymentType
    );
    useEffect(() => {
        if (!id && !editId) {
            if (workers.length === 1) {
                setFieldsValue({
                    counterparty: workers[0].id,
                });
                handleCounterpartyChange(workers[0].id);
            } else {
                setFieldsValue({
                    counterparty: undefined,
                });
            }
        }
    }, [workers]);

    useEffect(() => {
        if (paymentData.paymentType === 1 && !editId) {
            const account = allCashBoxNames.filter(
                cashbox => cashbox.type === paymentData.paymentType
            );
            if (account.length === 1) {
                setFieldsValue({
                    Paccount: account[0].id,
                });

                handlePaymentAccountChange(account[0].id);
            }
        }
    }, [paymentData.paymentType, allCashBoxNames]);

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
                Paccount: Account?.filter(
                    person => person.name == addedAccount
                )[0]?.id,
            });
        }
        if (Account?.filter(person => person.name == addedAccount)[0]) {
            SetaccountVisible(false);
            handlePaymentAccountChange(
                Account?.filter(person => person.name == addedAccount)[0]?.id
            );
            SetAddedAccount(null);
        }
    }, [allCashBoxNames.length, addedAccount]);

    const productionArr = productionInvoices.map(invoice => ({
        ...invoice,
        name: `${invoice.invoiceNumber} - ${
            invoice.clientName ? invoice.clientName : 'Daxili sifariş'
        }`,
    }));

    useEffect(() => {
        if (!id) {
            if (
                !getFieldValue('expenseType') &&
                productionInvoices.length === 0
            ) {
                setFieldsValue({
                    contract: { ...tenant, id: 0 }.id,
                });
            } else {
                setFieldsValue({
                    expenseType: 2,
                    contract: 0,
                });
            }
            if (getFieldValue('expenseType') === 1) {
                setFieldsValue({
                    contract:
                        productionArr.length === 1
                            ? productionArr[0].id
                            : undefined,
                });
            } else if (getFieldValue('expenseType') === 0) {
                setFieldsValue({
                    contract:
                        contractsArr.length === 1
                            ? contractsArr[0].id
                            : undefined,
                });
            }
        }
    }, [productionArr.length, productionInvoices.length]);

    useEffect(() => {
        if (editId && operationsList?.length > 0) {
            if (operationsList[0]?.isEmployeePayment) {
                fetchLastDateOfBalanceByContactId(
                    operationsList[0].employeeId,
                    ({ data }) => {
                        if (data !== null) {
                            setIsDisabled(
                                moment(
                                    operationsList[0].dateOfTransaction,
                                    fullDateTimeWithSecond
                                )?.isBefore(moment(data, 'DD-MM-YYYY HH:mm:ss'))
                            );
                        }
                    }
                );
            }
            setFieldsValue({
                counterparty: operationsList[0].employeeId,
                operationDate: moment(
                    operationsList[0].dateOfTransaction,
                    fullDateTimeWithSecond
                ),
                currency: operationsList[0].currencyId,
                expenses: [
                    {
                        catalog: operationsList[0]?.transactionCatalogId,
                        subCatalog: operationsList[0]?.transactionItemId,
                        amount: round(operationsList[0]?.amount),
                    },
                ],
                description: operationsList[0]?.description,
                Paccount: operationsList[0]?.cashboxId || undefined,
                paymentAmount: round(operationsList[0]?.amount),
            });
            setUseAdvance(operationsList[0]?.isEmployeePayment);
            handlePaymentTypeChange(operationsList[0]?.paymentTypeId, true);
            handleCounterpartyChange(operationsList[0].employeeId);
            setCurrencyCode(
                editId && operationsList
                    ? operationsList[0]?.currencyCode
                    : currencies[0].code
            );
        } else {
            setFieldsValue({
                operationDate: moment(),
            });
        }
    }, [editId, operationsList]);

    useEffect(() => {
        if (editId && operationsList?.length > 0 && !id) {
            setFieldsValue({
                expenseType: operationsList[0]?.paymentInvoiceId
                    ? 1
                    : operationsList[0]?.contractId
                    ? 0
                    : 2,
                contract: operationsList[0]?.paymentInvoiceId
                    ? operationsList[0]?.paymentInvoiceId
                    : operationsList[0]?.contractId
                    ? operationsList[0]?.contractId
                    : { ...tenant, id: 0 }.id,
            });
        }
    }, [editId, operationsList, productionInvoices]);

    const onFailure = ({ error }) => {
        setLoader(false);
        const errData = error?.response?.data?.error?.errorData;
        const errKey = error?.response?.data?.error?.errors;

        if (errKey?.key && errKey?.key === 'wrong_employee_amount') {
            toast.error(
                `Təhtəl hesab balansında kifayət qədər vəsait yoxdur. Seçilmış tarixdə ödəniləcək məbləğ ${defaultNumberFormat(
                    errKey?.data?.number
                )} ${
                    currencies.find(
                        curr => curr.id === getFieldValue('currency')
                    ).code
                } çox ola bilməz.`
            );
        } else {
            const cashboxName =
                errData?.cashbox.length > 15
                    ? `${errData?.cashbox.substring(0, 15)} ...`
                    : errData?.cashbox;
            if (editId && operationsList[0]?.operationDirectionId === 1) {
                const amount =
                    errData?.cashbox ===
                        Account.find(acc => acc.id === getFieldValue('account'))
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
        }
    };

    const handleCompleteOperation = (event, nextSubmit) => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const {
                    counterparty,
                    operationDate,
                    Paccount,
                    description,
                    expenses,
                    currency,
                    expenseType,
                    contract,
                } = values;
                setProductionId(contract);
                setLoader(true);

                const data = {
                    employee: counterparty,
                    type: paymentData.operationType,
                    useEmployeeBalance: useAdvance,
                    dateOfTransaction: operationDate.format(
                        fullDateTimeWithSecond
                    ),
                    cashbox: Paccount || null,
                    typeOfPayment: paymentData.paymentType || null,
                    description: description || null,
                    contract:
                        expenseType === 1
                            ? null
                            : contract === 0
                            ? null
                            : contract,
                    invoice: expenseType === 1 ? contract : null,
                    expenses_ul: expenses.map(
                        ({ catalog, subCatalog, amount }) => ({
                            transactionCatalog: catalog,
                            transactionItem: subCatalog || null,
                            amount: Number(amount),
                            currency,
                        })
                    ),
                };
                if (editId) {
                    editExpensePayment(
                        editId,
                        data,
                        () => {
                            onCreateCallBack(
                                expenseType,
                                contract,
                                nextSubmit,
                                true
                            );
                        },
                        onFailure
                    );
                } else {
                    createExpensePayment(
                        data,
                        () => {
                            onCreateCallBack(expenseType, contract, nextSubmit);
                        },
                        onFailure
                    );
                }
            }
        });
    };

    const onCreateCallBack = (
        expenseType,
        expense,
        nextSubmit,
        isEdit = false
    ) => {
        approveBtnType.current = nextSubmit ? 2 : 1;
        if (
            isEdit &&
            operationsList[0]?.paymentInvoiceId !== null &&
            operationsList[0]?.paymentInvoiceId !== expense
        ) {
            fetchProductionInfo({
                id: Number(operationsList[0]?.paymentInvoiceId),
                onSuccess: ({ data }) => {
                    const totalQuantity = data?.invoiceProducts?.content.reduce(
                        (total_amount, { quantity }) =>
                            math.add(total_amount, Number(quantity) || 0),
                        0
                    );
                    const cost =
                        Number(data.cost) > 0
                            ? math.div(
                                  math.sub(
                                      Number(data.cost),
                                      Number(operationsList[0]?.amount) || 0
                                  ) || 0,
                                  Number(totalQuantity) || 1
                              )
                            : 0;
                    let newTransferData = {};
                    newTransferData = {
                        operationDate: data.operationDate,
                        stock: data.stockToId,
                        invoiceProducts_ul: data.invoiceProducts?.content.map(
                            ({
                                planned_cost,
                                planned_price,
                                invoiceProductId,
                            }) => ({
                                id: invoiceProductId,
                                plannedCost: Number(planned_cost),
                                plannedPrice: Number(planned_price),
                                itemCost:
                                    cost === 0
                                        ? 0
                                        : roundTo(Number(cost), 2) || 0,
                            })
                        ),
                    };
                    if (data?.stockToId !== null) {
                        editTransferProduction({
                            data: newTransferData,
                            id: Number(operationsList[0]?.paymentInvoiceId),
                        });
                    } else {
                        let newData = {};
                        newData = {
                            invoiceProducts_ul: data.invoiceProducts?.content.map(
                                ({ invoiceProductId }) => ({
                                    id: invoiceProductId,
                                    itemCost:
                                        cost === 0
                                            ? 0
                                            : roundTo(Number(cost), 2) || 0,
                                })
                            ),
                        };
                        editProductionCost({
                            data: newData,
                            id: Number(operationsList[0]?.paymentInvoiceId),
                        });
                    }
                    if (expenseType === 1) {
                        fetchProductionInfo({
                            id: expense,
                            onSuccess: ({ data }) => {
                                setProductionInfo(data);
                                const allData = data.invoiceProducts.content
                                    .filter(item => item.materials?.length > 0)
                                    .map(product => ({
                                        ...product,
                                        name: product.productName,
                                        invoiceQuantity: product.quantity,
                                        productContent: product.materials.map(
                                            item => ({
                                                ...item,
                                                idForFind: product.id,
                                                selectedProductId:
                                                    product.invoiceProductId,
                                            })
                                        ),
                                    }));
                                fetchProductionProductOrder({
                                    filters: {
                                        invoiceProducts: [
                                            ...[].concat(
                                                ...allData.map(item =>
                                                    item.productContent.map(
                                                        ({
                                                            selectedProductId,
                                                        }) => selectedProductId
                                                    )
                                                )
                                            ),
                                        ],
                                    },
                                    onSuccessCallback: ({ data }) => {
                                        let tmp = {};
                                        if (data.length > 0) {
                                            data.forEach((value, index) => {
                                                if (
                                                    tmp[value.productMaterialId]
                                                ) {
                                                    tmp = {
                                                        ...tmp,
                                                        [value.productMaterialId]: {
                                                            ...tmp[
                                                                value
                                                                    .productMaterialId
                                                            ],
                                                            orders: value.orderId
                                                                ? [
                                                                      ...tmp[
                                                                          value
                                                                              .productMaterialId
                                                                      ].orders,
                                                                      {
                                                                          direction:
                                                                              value.orderDirection,
                                                                          id:
                                                                              value.orderId,
                                                                          serialNumber:
                                                                              value.orderSerialNumber,
                                                                      },
                                                                  ]
                                                                : [],
                                                        },
                                                    };
                                                } else {
                                                    tmp[
                                                        value.productMaterialId
                                                    ] = {
                                                        productId:
                                                            value.productMaterialId,
                                                        orders: [
                                                            {
                                                                direction:
                                                                    value.orderDirection,
                                                                id:
                                                                    value.orderId,
                                                                serialNumber:
                                                                    value.orderSerialNumber,
                                                            },
                                                        ],
                                                    };
                                                }
                                            });
                                        }

                                        setProductionOrders(Object.values(tmp));
                                        setAllProductionData(allData);
                                    },
                                });
                                fetchProductionExpense({
                                    id: expense,
                                    onSuccess: ({ data }) => {
                                        dispatch(
                                            setSelectedProductionExpense({
                                                newSelectedProductionExpense: [
                                                    ...data,
                                                ],
                                            })
                                        );
                                    },
                                });
                                fetchMaterialList({
                                    filters: {
                                        isDeleted: 0,
                                        attachedInvoices: [expense],
                                        invoiceTypes: [6],
                                        limit: 1000,
                                    },
                                });
                                fetchProductionExpensesList({
                                    filters: {
                                        invoices: [expense],
                                        vat: 0,
                                        limit: 1000,
                                    },
                                });
                                fetchProductionMaterialExpense({
                                    id: expense,
                                    onSuccess: ({ data }) => {
                                        dispatch(
                                            setSelectedProductionMaterial({
                                                newSelectedProductionMaterial: [
                                                    ...data,
                                                ],
                                            })
                                        );
                                    },
                                });
                                fetchProductionEmployeeExpense({
                                    id: expense,
                                    onSuccess: ({ data }) => {
                                        dispatch(
                                            setSelectedProductionEmployeeExpense(
                                                {
                                                    newSelectedProductionEmployeeExpense: [
                                                        ...data,
                                                    ],
                                                }
                                            )
                                        );
                                    },
                                });
                            },
                        });
                    } else {
                        toast.success(messages.successText);
                        history.replace(returnUrl);
                    }
                },
            });
        } else if (expenseType === 1) {
            fetchProductionInfo({
                id: expense,
                onSuccess: ({ data }) => {
                    setProductionInfo(data);
                    const allData = data.invoiceProducts.content
                        .filter(item => item.materials?.length > 0)
                        .map(product => ({
                            ...product,
                            name: product.productName,
                            invoiceQuantity: product.quantity,
                            productContent: product.materials.map(item => ({
                                ...item,
                                idForFind: product.id,
                                selectedProductId: product.invoiceProductId,
                            })),
                        }));
                    fetchProductionProductOrder({
                        filters: {
                            invoiceProducts: [
                                ...[].concat(
                                    ...allData.map(item =>
                                        item.productContent.map(
                                            ({ selectedProductId }) =>
                                                selectedProductId
                                        )
                                    )
                                ),
                            ],
                        },
                        onSuccessCallback: ({ data }) => {
                            let tmp = {};
                            if (data.length > 0) {
                                data.forEach((value, index) => {
                                    if (tmp[value.productMaterialId]) {
                                        tmp = {
                                            ...tmp,
                                            [value.productMaterialId]: {
                                                ...tmp[value.productMaterialId],
                                                orders: value.orderId
                                                    ? [
                                                          ...tmp[
                                                              value
                                                                  .productMaterialId
                                                          ].orders,
                                                          {
                                                              direction:
                                                                  value.orderDirection,
                                                              id: value.orderId,
                                                              serialNumber:
                                                                  value.orderSerialNumber,
                                                          },
                                                      ]
                                                    : [],
                                            },
                                        };
                                    } else {
                                        tmp[value.productMaterialId] = {
                                            productId: value.productMaterialId,
                                            orders: [
                                                {
                                                    direction:
                                                        value.orderDirection,
                                                    id: value.orderId,
                                                    serialNumber:
                                                        value.orderSerialNumber,
                                                },
                                            ],
                                        };
                                    }
                                });
                            }
                            setProductionOrders(Object.values(tmp));
                            setAllProductionData(allData);
                        },
                    });
                    fetchProductionExpense({
                        id: expense,
                        onSuccess: ({ data }) => {
                            dispatch(
                                setSelectedProductionExpense({
                                    newSelectedProductionExpense: [...data],
                                })
                            );
                        },
                    });
                    fetchMaterialList({
                        filters: {
                            isDeleted: 0,
                            attachedInvoices: [expense],
                            invoiceTypes: [6],
                            limit: 1000,
                        },
                    });
                    fetchProductionExpensesList({
                        filters: { invoices: [expense], vat: 0, limit: 1000 },
                    });
                    fetchProductionMaterialExpense({
                        id: expense,
                        onSuccess: ({ data }) => {
                            dispatch(
                                setSelectedProductionMaterial({
                                    newSelectedProductionMaterial: [...data],
                                })
                            );
                        },
                    });
                    fetchProductionEmployeeExpense({
                        id: expense,
                        onSuccess: ({ data }) => {
                            dispatch(
                                setSelectedProductionEmployeeExpense({
                                    newSelectedProductionEmployeeExpense: [
                                        ...data,
                                    ],
                                })
                            );
                        },
                    });
                },
            });
        } else if (nextSubmit) {
            toast.success('Əməliyyat uğurla tamamlandı.', {
                className: 'success-toast',
            });
            window.location.reload();
        } else {
            toast.success('Əməliyyat uğurla tamamlandı.', {
                className: 'success-toast',
            });
            history.replace(returnUrl);
        }
    };
    function toFixed(x) {
        if (Math.abs(x) < 1.0) {
            var e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = `0.${new Array(e).join('0')}${x.toString().substring(2)}`;
            }
        } else {
            var e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += new Array(e + 1).join('0');
            }
        }
        return x;
    }
    useEffect(() => {
        if (
            !materialsLoading &&
            !selectedMaterialLoading &&
            !selectedEmployeeExpenseLoading &&
            !selectedExpenseLoading &&
            !productionExpensesListLoading
        ) {
            const totalExpencePrice = selectedProductionExpense.reduce(
                (total, { price }) => total + Number(price),
                0
            );
            const totalEmployeePrice = selectedProductionEmployeeExpense.reduce(
                (total, { price, hours }) =>
                    total + math.mul(Number(price), Number(hours || 1)),
                0
            );
            const totalMaterialPrice = selectedProductionMaterial.reduce(
                (total, { price, quantity }) =>
                    total + math.mul(Number(price), Number(quantity)),
                0
            );
            const totaInvoicelMaterialPrice = materialInvoices?.reduce(
                (total, { amountInMainCurrency }) =>
                    total + Number(amountInMainCurrency),
                0
            );
            const totalProductionEmployeeExpensesList = productionExpensesList
                ?.filter(item => item.transactionType === 6)
                .reduce(
                    (total, { amountConvertedToMainCurrency }) =>
                        total + Number(amountConvertedToMainCurrency),
                    0
                );
            const totalProductionExpensesList = productionExpensesList
                ?.filter(
                    item =>
                        item.transactionType === 8 || item.transactionType === 9
                )
                .reduce(
                    (total, { amountConvertedToMainCurrency }) =>
                        total + Number(amountConvertedToMainCurrency),
                    0
                );
            const totalAllExpense = math.add(
                totalExpencePrice,
                totalEmployeePrice,
                totalMaterialPrice,
                totaInvoicelMaterialPrice,
                totalProductionEmployeeExpensesList,
                totalProductionExpensesList
            );
            setSummaries(totalAllExpense);
        }
    }, [
        selectedProductionExpense,
        selectedProductionEmployeeExpense,
        selectedProductionMaterial,
        materialInvoices,
        productionExpensesList,
        productionExpensesListLoading,
        selectedExpenseLoading,
        materialsLoading,
        selectedMaterialLoading,
        selectedEmployeeExpenseLoading,
    ]);
    useEffect(() => {
        if (summaries) {
            if (
                !materialsLoading &&
                !selectedMaterialLoading &&
                !selectedEmployeeExpenseLoading &&
                !selectedExpenseLoading &&
                !productionExpensesListLoading &&
                productionInfo
            ) {
                const totalQuantity = productionInfo.invoiceProducts?.content.reduce(
                    (total_amount, { quantity }) =>
                        math.add(total_amount, Number(quantity) || 0),
                    0
                );
                const cost =
                    Number(summaries) > 0
                        ? roundToDown(
                              math.div(
                                  Number(summaries) || 0,
                                  Number(totalQuantity) || 1
                              )
                          )
                        : 0;

                const newSelectedProducts = [
                    ...productionInfo.invoiceProducts?.content,
                ];

                const totalExpenseWithoutLastRow = newSelectedProducts
                    .slice(0, -1)
                    .reduce(
                        (total_amount, { quantity }) =>
                            math.add(
                                total_amount,
                                math.mul(Number(quantity), cost) || 0
                            ),
                        0
                    );

                const costForLastRow = math.div(
                    math.sub(
                        Number(summaries),
                        Number(totalExpenseWithoutLastRow)
                    ),
                    Number(newSelectedProducts.pop().quantity || totalQuantity)
                );

                const positiveCost =
                    toFixed(cost) < 0 || toFixed(cost) === -0
                        ? 0
                        : toFixed(cost);
                if (productionInfo?.stockToId !== null) {
                    let newTransferData = {};
                    newTransferData = {
                        operationDate: productionInfo.operationDate,
                        stock: productionInfo.stockToId,
                        invoiceProducts_ul: handleSelectedTransfer(
                            productionInfo.invoiceProducts?.content,
                            costForLastRow,
                            roundToDown(positiveCost)
                        ),
                    };
                    editTransferProduction({
                        data: newTransferData,
                        id: Number(productionId),
                        onSuccessCallback: () => {
                            if (
                                allProductionData.filter(
                                    ({ invoiceProductId }) =>
                                        invoiceProductId !== undefined
                                ).length > 0
                            ) {
                                if (
                                    productionOrders.filter(
                                        selectedOrder =>
                                            selectedOrder.orders.length > 0
                                    ).length > 0
                                ) {
                                    productionOrders
                                        .filter(
                                            selectedOrder =>
                                                selectedOrder.orders.length > 0
                                        )
                                        .map((item, index) => {
                                            const newSelectedOrders = {
                                                orders_ul: item.orders.map(
                                                    ({ id }) => id
                                                ),
                                                invoiceProduct: [
                                                    ...[].concat(
                                                        ...allProductionData.map(
                                                            content =>
                                                                content.productContent.map(
                                                                    items =>
                                                                        items
                                                                )
                                                        )
                                                    ),
                                                ].find(
                                                    ({ id }) =>
                                                        id === item.productId
                                                )?.selectedProductId,
                                                productMaterial: item.productId,
                                            };
                                            createProductionProductOrder({
                                                data: newSelectedOrders,
                                            });
                                        });
                                }
                            }
                            if (approveBtnType.current === 2) {
                                window.location.reload();
                            } else if (approveBtnType.current === 1) {
                                history.replace(returnUrl);
                            }
                            // history.replace(returnUrl);
                        },
                    });
                } else {
                    let newData = {};
                    newData = {
                        invoiceProducts_ul: handleSelectedProductionProducts(
                            productionInfo.invoiceProducts?.content,
                            costForLastRow,
                            roundToDown(positiveCost)
                        ),
                    };
                    editProductionCost({
                        data: newData,
                        id: Number(productionId),
                        onSuccessCallback: () => {
                            if (
                                allProductionData.filter(
                                    ({ invoiceProductId }) =>
                                        invoiceProductId !== undefined
                                ).length > 0
                            ) {
                                if (
                                    productionOrders.filter(
                                        selectedOrder =>
                                            selectedOrder.orders.length > 0
                                    ).length > 0
                                ) {
                                    productionOrders
                                        .filter(
                                            selectedOrder =>
                                                selectedOrder.orders.length > 0
                                        )
                                        .map((item, index) => {
                                            const newSelectedOrders = {
                                                orders_ul: item.orders.map(
                                                    ({ id }) => id
                                                ),
                                                invoiceProduct: [
                                                    ...[].concat(
                                                        ...allProductionData.map(
                                                            content =>
                                                                content.productContent.map(
                                                                    items =>
                                                                        items
                                                                )
                                                        )
                                                    ),
                                                ].find(
                                                    ({ id }) =>
                                                        id === item.productId
                                                )?.selectedProductId,
                                                productMaterial: item.productId,
                                            };
                                            createProductionProductOrder({
                                                data: newSelectedOrders,
                                            });
                                        });
                                }
                            }
                            if (approveBtnType.current === 2) {
                                window.location.reload();
                            } else if (approveBtnType.current === 1) {
                                history.replace(returnUrl);
                            }
                            // history.replace(returnUrl);
                        },
                    });
                }
            }
        }
    }, [summaries]);

    // Manipulate selected products to api required form.
    const handleSelectedTransfer = (
        selectedProducts,
        costForLastRow,
        positiveCost
    ) =>
        selectedProducts.map(
            ({ planned_cost, planned_price, invoiceProductId }, index) => {
                if (index === selectedProducts.length - 1) {
                    return {
                        id: invoiceProductId,
                        plannedCost: Number(planned_cost),
                        plannedPrice: Number(planned_price),
                        itemCost:
                            toFixed(costForLastRow) === 0
                                ? 0
                                : toFixed(costForLastRow) || 0,
                    };
                }
                return {
                    id: invoiceProductId,
                    plannedCost: Number(planned_cost),
                    plannedPrice: Number(planned_price),
                    itemCost: positiveCost === 0 ? 0 : positiveCost || 0,
                };
            }
        );

    const handleSelectedProductionProducts = (
        selectedProducts,
        costForLastRow,
        positiveCost
    ) =>
        selectedProducts.map(({ invoiceProductId }, index) => {
            if (index === selectedProducts.length - 1) {
                return {
                    id: invoiceProductId,
                    itemCost:
                        toFixed(costForLastRow) === 0
                            ? 0
                            : toFixed(costForLastRow) || 0,
                };
            }
            return {
                id: invoiceProductId,
                itemCost: positiveCost === 0 ? 0 : positiveCost || 0,
            };
        });

    const contractsArr = contracts.map(contract => ({
        ...contract,
        name: `${contract.counterparty_name} - ${contract.contract_no}`,
    }));

    const ContractFn = event => {
        if (event === 1) {
            setFieldsValue({
                contract:
                    productionArr.length === 1
                        ? productionArr[0].id
                        : undefined,
            });
        } else if (event === 0) {
            setFieldsValue({
                contract:
                    contractsArr.length === 1 ? contractsArr[0].id : undefined,
            });
        } else if (event === 2) {
            setFieldsValue({
                contract: { ...tenant, id: 0 }.id,
            });
        } else {
            setFieldsValue({
                contract: undefined,
            });
        }
    };

    return (
        <>
            <AddAccount
                accountVisible={accountVisible}
                SetaccountVisible={SetaccountVisible}
                Account={Account}
                SetAddedAccount={SetAddedAccount}
                activeTab={paymentData.paymentType}
            />

            <UpdateExpenseModal
                defaultUpdateData={defaultUpdateData}
                onSuccessItemUpdate={onSuccessItemUpdate}
                handleModal={toggleUpdateModal}
                isVisible={updateModalIsVisible}
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
                                    setFieldsValue({
                                        invoice: undefined,
                                    });
                                    setPaymentData(prevPaymentData => ({
                                        ...prevPaymentData,
                                        paymentType: 1,
                                    }));
                                    setUseAdvance(false);
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
                                    disabled={isDisabled}
                                />
                            )}
                        </ProFormItem>

                        <Row style={{ margin: '15px 0' }}>
                            <Col span={24}>
                                <AdvancePayment
                                    title="Təhtəl hesabdan ödə"
                                    subTitle="Balans:"
                                    advancePayment={advancePayment}
                                    checked={useAdvance}
                                    onChange={handleAdvanceChange}
                                    editId={editId}
                                    operationsList={operationsList}
                                    isPayment
                                    selectedCounterparty={getFieldValue(
                                        'counterparty'
                                    )}
                                    disabled={
                                        (editId &&
                                        operationsList?.[0]
                                            ?.operationDirectionId === 2
                                            ? !getFieldValue('counterparty') ||
                                              (getFieldValue('counterparty') ===
                                                  operationsList?.[0]
                                                      ?.employeeId &&
                                                  advancePayment.myAmount !==
                                                      null &&
                                                  advancePayment.myAmount
                                                      ?.map(
                                                          ({ currencyId }) =>
                                                              currencyId
                                                      )
                                                      .includes(
                                                          operationsList[0]
                                                              ?.currencyId
                                                      ) &&
                                                  getFieldValue(
                                                      'operationDate'
                                                  )?.format(
                                                      fullDateTimeWithSecond
                                                  ) ===
                                                      operationsList[0]
                                                          ?.dateOfTransaction &&
                                                  advancePayment.myAmount?.filter(
                                                      currencyBalance => {
                                                          if (
                                                              operationsList[0]
                                                                  ?.currencyId ===
                                                              currencyBalance.currencyId
                                                          ) {
                                                              return (
                                                                  Number(
                                                                      Number(
                                                                          currencyBalance.amount
                                                                      ) +
                                                                          Number(
                                                                              operationsList[0]
                                                                                  ?.amount
                                                                          )
                                                                  ) > 0
                                                              );
                                                          }
                                                          return (
                                                              Number(
                                                                  currencyBalance.amount
                                                              ) > 0
                                                          );
                                                      }
                                                  ).length === 0)
                                            : !getFieldValue('counterparty') ||
                                              advancePayment.myAmount?.filter(
                                                  currencyBalance =>
                                                      Number(
                                                          currencyBalance.amount
                                                      ) > 0
                                              ).length === 0) || isDisabled
                                    }
                                    loading={tenantBalanceLoading}
                                />
                            </Col>
                        </Row>
                        <OperationType
                            value={paymentData.operationType}
                            onClickType={changeOperationType}
                            disableReceivables
                        />
                    </div>

                    <div className={styles.paper}>
                        <ProFormItem
                            label="Əməliyyat tarixi"
                            help={getFieldError('operationDate')?.[0]}
                        >
                            {getFieldDecorator('operationDate', {
                                getValueFromEvent: date => {
                                    fetchCurrencies({
                                        dateTime: date?.format(
                                            fullDateTimeWithSecond
                                        ),
                                        withRatesOnly: 1,
                                        limit: 1000,
                                    });
                                    return date;
                                },
                                rules: [requiredRule],
                            })(
                                <ProDatePicker
                                    format={fullDateTimeWithSecond}
                                    disabledDate={current =>
                                        disabledDate(current, date)
                                    }
                                    disabled={isDisabled}
                                />
                            )}
                        </ProFormItem>

                        <Row gutter={8}>
                            {productionInvoices.length > 0 ? (
                                <Col span={8}>
                                    <ProFormItem
                                        label="Xərc mərkəzi növü"
                                        help={getFieldError('expenseType')?.[0]}
                                        keys={['name']}
                                    >
                                        {getFieldDecorator('expenseType', {
                                            getValueFromEvent: expenseType => {
                                                ContractFn(expenseType);
                                                return expenseType;
                                            },
                                            rules: [requiredRule],
                                        })(
                                            <ProSelect
                                                data={[
                                                    { id: 2, name: 'Baş ofis' },
                                                    { id: 0, name: 'Müqavilə' },
                                                    {
                                                        id: 1,
                                                        name: 'İstehsalat',
                                                    },
                                                ]}
                                                keys={['name']}
                                                disabled={isDisabled}
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                            ) : null}
                            <Col
                                span={productionInvoices?.length > 0 ? 10 : 12}
                            >
                                <ProFormItem
                                    label="Xərc mərkəzi"
                                    help={getFieldError('contract')?.[0]}
                                    keys={['name']}
                                >
                                    {getFieldDecorator('contract', {
                                        getValueFromEvent: category => category,
                                        rules: [requiredRule],
                                    })(
                                        <ProSelect
                                            disabled={
                                                (productionInvoices?.length >
                                                    0 &&
                                                    getFieldValue(
                                                        'expenseType'
                                                    ) === undefined) ||
                                                getFieldValue('expenseType') ===
                                                    2 ||
                                                isDisabled
                                            }
                                            data={
                                                getFieldValue('expenseType') ===
                                                2
                                                    ? [{ ...tenant, id: 0 }]
                                                    : getFieldValue(
                                                          'expenseType'
                                                      ) === 1
                                                    ? productionInvoices.map(
                                                          productionInvoice => ({
                                                              ...productionInvoice,
                                                              name: `${
                                                                  productionInvoice.invoiceNumber
                                                              } - ${
                                                                  productionInvoice.clientName
                                                                      ? productionInvoice.clientName
                                                                      : 'Daxili sifariş'
                                                              }`,
                                                          })
                                                      )
                                                    : productionInvoices.length ===
                                                      0
                                                    ? [
                                                          {
                                                              ...tenant,
                                                              id: 0,
                                                          },
                                                          ...contractsArr,
                                                      ]
                                                    : [...contractsArr]
                                            }
                                            keys={['name']}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                            <Col span={productionInvoices?.length > 0 ? 6 : 12}>
                                <ProFormItem
                                    label="Valyuta"
                                    help={getFieldError('currency')?.[0]}
                                >
                                    {getFieldDecorator('currency', {
                                        getValueFromEvent: currency => {
                                            handleCurrencyChange(currency);
                                            return currency;
                                        },
                                        rules: [requiredRule],
                                    })(
                                        <ProSelect
                                            allowClear={false}
                                            data={currencies}
                                            keys={['code']}
                                            disabled={isDisabled}
                                            loading={currenciesLoading}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>
                        <Divider />
                        {expenses.map((expense, index) => (
                            <ExpenseRow
                                editId={editId}
                                form={form}
                                index={index}
                                key={index}
                                handleAddExpenseClick={handleAddExpenseClick}
                                handleExpenseChange={handleExpenseChange}
                                currencyCode={currencyCode}
                                expenseCatalogs={expenseCatalogs}
                                handleAddModal={handleAddModal}
                                disabled={isDisabled}
                            />
                        ))}
                        <Divider />
                        <TypeOfPayment
                            typeOfPayment={paymentData.paymentType}
                            changeTypeOfPayment={handlePaymentTypeChange}
                            disabled={useAdvance}
                        />
                        <Row style={{ margin: '10px 0' }} gutter={4}>
                            <Col span={18}>
                                <div style={{ position: 'relative' }}>
                                    <Tooltip title="Yeni hesab əlavə et">
                                        <PlusIcon
                                            color="#FF716A"
                                            className={styles.plusBtn}
                                            onClick={() => handleAccount()}
                                            disabled={isDisabled}
                                            style={
                                                isDisabled
                                                    ? {
                                                          pointerEvents: 'none',
                                                          fill: '#868686',
                                                      }
                                                    : {
                                                          cursor: 'pointer',
                                                      }
                                            }
                                        />
                                    </Tooltip>
                                    <ProFormItem
                                        label="Hesab"
                                        help={getFieldError('Paccount')?.[0]}
                                    >
                                        {getFieldDecorator('Paccount', {
                                            getValueFromEvent: account => {
                                                handlePaymentAccountChange(
                                                    account
                                                );
                                                return account;
                                            },
                                            rules: useAdvance
                                                ? []
                                                : [requiredRule],
                                        })(
                                            <ProSelect
                                                data={allCashBoxNames.filter(
                                                    cashbox =>
                                                        cashbox.type ===
                                                        paymentData.paymentType
                                                )}
                                                allowClear={false}
                                                disabled={
                                                    useAdvance || isDisabled
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                            </Col>
                            <Col span={6}>
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
                                    })(
                                        <ProInput
                                            type="number"
                                            suffix={currencyCode}
                                            disabled
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>
                        {getFieldValue('Paccount') && (
                            <AccountBalance
                                typeOfPayment={paymentData.paymentType}
                                label="Əməliyyat tarixi üzrə qalıq:"
                                list={paymentData.accountBalance}
                                editId={editId}
                                operationsList={operationsList}
                                loading={balanceLoading}
                                selectedAccount={getFieldValue('Paccount')}
                            />
                        )}

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
                        {/* <ProUpload
                            documents={documents}
                            setDocuments={setDocuments}
                        /> */}
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
    workers: state.workersReducer.workers,
    workersLoading: state.loadings.fetchWorkers,
    contracts: state.contractsReducer.contracts,
    currencies: state.kassaReducer.currencies,
    tenant: state.tenantReducer.tenant,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    cashBoxBalance: state.cashBoxBalanceReducer.cashBoxBalance,
    expenseCatalogs: state.expenseItems.expenseCatalogs,
    productionInvoices: state.salesAndBuysReducer.invoices,
    selectedProductionExpense: state.salesOperation.selectedProductionExpense,
    selectedProductionEmployeeExpense:
        state.salesOperation.selectedProductionEmployeeExpense,
    selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
    materialInvoices: state.salesOperation.materialList,
    productionExpensesList: state.salesOperation.productionExpensesList,

    // Loadings
    balanceLoading: state.loadings.accountBalance,
    isLoading: state.kassaReducer.isLoading,
    tenantBalanceLoading: state.loadings.tenantBalance,
    materialsLoading: state.loadings.fetchMaterialList,
    productionExpensesListLoading: state.loadings.fetchProductionExpensesList,
    selectedMaterialLoading: state.loadings.fetchProductionMaterialExpense,
    selectedEmployeeExpenseLoading:
        state.loadings.fetchProductionEmployeeExpense,
    selectedExpenseLoading: state.loadings.fetchProductionExpense,
    operationsList: state.financeOperationsReducer.operationsList,
    currenciesLoading: state.loadings.fetchCurrencies,
});
export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceList,
        fetchWorkers,
        fetchExpenseCatalogs,
        fetchTenantBalance,
        fetchContracts,
        createExpensePayment,
        editExpensePayment,
        fetchAllCashboxNames,
        fetchAccountBalance,
        fetchCurrencies,
        fetchProductionInfo,
        fetchProductionMaterialExpense,
        fetchProductionEmployeeExpense,
        fetchProductionExpense,
        setSelectedProductionEmployeeExpense,
        setSelectedProductionExpense,
        setSelectedProductionMaterial,
        fetchMaterialList,
        fetchProductionExpensesList,
        editInvoice,
        editTransferProduction,
        editProductionCost,
        createProductionProductOrder,
        fetchProductionProductOrder,
        handleResetInvoiceFields,
        fetchLastDateOfBalanceByContactId,
    }
)(
    Form.create({
        name: 'PaymentForm',
    })(Payment)
);
