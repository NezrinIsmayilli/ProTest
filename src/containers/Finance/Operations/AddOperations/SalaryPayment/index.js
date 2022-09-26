/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { cookies } from 'utils/cookies';
import { connect, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import {
    createOperationSalaryPayment,
    editOperationSalaryPayment,
} from 'store/actions/finance/initialBalance';
import {
    fetchContracts,
    fetchFilteredContracts,
} from 'store/actions/contracts';
import { BsInfo } from 'react-icons/all';
// actions
import {
    fetchAdvancePaymentByContactId,
    fetchInvoiceListByContactId,
} from 'store/actions/contact';
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
    fetchAllCashboxNames,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import {
    fetchAccountBalance,
    fetchSalaryPaymentEmployees,
    getPaidSalaries,
} from 'store/actions/finance/operations';
import { Button, Form, Row, Col, Tooltip } from 'antd';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { FaChevronRight } from 'react-icons/fa';
import moment from 'moment';
import {
    ProSelect,
    ProTextArea,
    ProInput,
    ProFormItem,
    ProDatePicker,
} from 'components/Lib';
import { toast } from 'react-toastify';
import { requiredRule } from 'utils/rules';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import {
    round,
    fullDateTimeWithSecond,
    roundToDown,
    formatNumberToLocale,
    defaultNumberFormat,
    messages,
} from 'utils';
import styles from '../styles.module.scss';
import { Dept, TypeOfPayment, AccountBalance } from '../shared';
import AddAccount from '../shared/AddAccount';

const math = require('exact-math');
const roundTo = require('round-to');

const SalaryPayment = props => {
    const {
        createOperationSalaryPayment,
        allCashBoxNames,
        currencies,
        fetchSalesInvoiceList,
        fetchAccountBalance,
        getPaidSalaries,
        returnUrl,
        editId,
        operationsList,
        form,
        fetchCurrencies,
        fetchAllCashboxNames,
        fetchSalaryPaymentEmployees,
        balanceLoading,
        employeesLoading,
        paymentLoading,
        fetchFilteredContracts,
        filteredContracts,
        tenant,
        paidSalaries,
        productionInvoices,
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
        editOperationSalaryPayment,
        handleResetInvoiceFields,
        // loadings
        materialsLoading,
        productionExpensesListLoading,
        selectedMaterialLoading,
        selectedEmployeeExpenseLoading,
        selectedExpenseLoading,
        productionInfoLoading,
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

    const dispatch = useDispatch();
    const [employees, setEmployees] = useState([]);
    const [productionId, setProductionId] = useState(undefined);
    const [productionInfo, setProductionInfo] = useState(undefined);
    const [summaries, setSummaries] = useState(undefined);
    const [productionOrders, setProductionOrders] = useState([]);
    const [allProductionData, setAllProductionData] = useState([]);
    const [salaryAvailable, setSalaryAvailable] = useState(false);
    const approveBtnType = React.useRef(false);
    const [accountVisible, SetaccountVisible] = useState(false);
    const [addedAccount, SetAddedAccount] = useState(null);
    const [loader, setLoader] = useState(false);

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

    const [salaryPaymentData, setSalaryPaymentData] = useState({
        employee: undefined,
        currency: undefined,
        accountBalances: [],
        typeOfPayment: 1,
        debt: [],
    });

    const history = useHistory();

    const handleEmployeeChange = employee => {
        const selectedEmployee = employees.find(
            currentEmployee => currentEmployee.id === employee
        );
        if (selectedEmployee) {
            const { currencyId } = selectedEmployee;
            setFieldsValue({ currency: currencyId });
            setSalaryPaymentData(prevSalaryPaymentData => ({
                ...prevSalaryPaymentData,
                employee: selectedEmployee,
            }));
        }
    };

    const changeTypeOfPayment = (operationType, edit = false) => {
        setSalaryPaymentData(prevSalaryPaymentData => ({
            ...prevSalaryPaymentData,
            typeOfPayment: operationType,
            accountBalances: [],
        }));

        const Account = allCashBoxNames.filter(
            cashbox => cashbox.type === operationType
        );
        if (Account.length === 1) {
            setFieldsValue({
                paymentAccount: Account[0].id,
            });

            handleAccountChange(Account[0].id);
        } else if (!edit) {
            setFieldsValue({
                paymentAccount: undefined,
            });
        }
    };
    useEffect(() => {
        if (getFieldValue(`paymentAccount`)) {
            fetchAccountBalance({
                id: getFieldValue(`paymentAccount`),
                filters: {
                    dateTime: getFieldValue('operationDate')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                callBack: data => {
                    setSalaryPaymentData(prevSalaryPaymentData => ({
                        ...prevSalaryPaymentData,
                        accountBalances: data.data,
                    }));
                },
            });
        }
    }, [getFieldValue('operationDate')]);
    const handleAccountChange = account => {
        setSalaryPaymentData(prevSalaryPaymentData => ({
            ...prevSalaryPaymentData,
            accountBalances: [],
        }));

        fetchAccountBalance({
            id: account,
            filters: {
                dateTime: getFieldValue('operationDate')?.format(
                    fullDateTimeWithSecond
                ),
            },
            callBack: data => {
                setSalaryPaymentData(prevSalaryPaymentData => ({
                    ...prevSalaryPaymentData,
                    accountBalances: data.data,
                }));
            },
        });
    };

    const handlePaymentAmount = event => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value) && event.target.value <= 1000000)
            return event.target.value;
        if (event.target.value === '') return null;
        return getFieldValue('paymentAmount');
    };

    const onFailureCallback = ({ error }) => {
        setLoader(false);
        const errData = error?.response?.data?.error?.errorData;
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
    };

    const completeOperation = (event, nextSubmit) => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                if (Object.keys(paidSalaries)?.length === 0) {
                    toast.error(
                        'Əməkdaşın borcu olmadığından əməkhaqqı ödənilə bilməz'
                    );
                } else {
                    const {
                        employee,
                        operationDate,
                        paymentAccount,
                        paymentAmount,
                        currency,
                        description,
                        contract,
                        expenseType,
                    } = values;
                    setProductionId(contract);
                    setLoader(true);
                    const data = {
                        cashboxName: paymentAccount,
                        employee,
                        dateOfTransaction: operationDate.format(
                            fullDateTimeWithSecond
                        ),
                        contract:
                            expenseType === 1
                                ? null
                                : contract === 0
                                ? null
                                : contract,
                        invoice: expenseType === 1 ? contract : null,
                        typeOfPayment: salaryPaymentData.typeOfPayment,
                        description,
                        currency,
                        amount: Number(paymentAmount || 0),
                    };
                    if (editId) {
                        editOperationSalaryPayment(
                            editId,
                            data,
                            () => {
                                onSuccessCallback(
                                    expenseType,
                                    contract,
                                    nextSubmit,
                                    true
                                );
                            },
                            onFailureCallback
                        );
                    } else {
                        createOperationSalaryPayment(
                            data,
                            () => {
                                onSuccessCallback(
                                    expenseType,
                                    contract,
                                    nextSubmit
                                );
                            },
                            onFailureCallback
                        );
                    }
                }
            }
        });
    };

    const onSuccessCallback = (
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
                        data.cost > 0
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

    const productionArr = productionInvoices.map(invoice => ({
        ...invoice,
        name: `${invoice.invoiceNumber} - ${
            invoice.clientName ? invoice.clientName : 'Daxili sifariş'
        }`,
    }));

    const Account = allCashBoxNames.filter(
        cashbox => cashbox.type === salaryPaymentData.typeOfPayment
    );

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
            setFieldsValue({
                employee: operationsList[0].employeeId,
                operationDate: moment(
                    operationsList[0]?.dateOfTransaction,
                    fullDateTimeWithSecond
                ),
                currency: operationsList[0].currencyId,
                description: operationsList[0]?.description,
                paymentAccount: operationsList[0]?.cashboxId || undefined,
                paymentAmount: round(operationsList[0]?.amount),
            });
            changeTypeOfPayment(operationsList[0]?.paymentTypeId, true);
        } else {
            setFieldsValue({
                operationDate: moment(),
            });
        }
    }, [editId, operationsList]);

    useEffect(() => {
        if (
            editId &&
            operationsList &&
            operationsList[0].employeeId === getFieldValue('employee') &&
            employees.length > 0
        ) {
            handleEmployeeChange(operationsList[0].employeeId);
        }
    }, [editId, operationsList, employees]);

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

    useEffect(() => {
        if (currencies.length !== 0) {
            setSalaryPaymentData(prevSalaryPaymentData => ({
                ...prevSalaryPaymentData,
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
            }));
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
        }
    }, [currencies, operationsList]);
    useEffect(() => {
        if (
            getFieldValue('employee') !== undefined &&
            getFieldValue('employee')
        ) {
            getPaidSalaries(
                getFieldValue('employee'),
                editId ? { excludeCashboxTransactionId: editId } : undefined
            );
            setSalaryAvailable(true);
        } else {
            setSalaryAvailable(false);
        }
    }, [getFieldValue('employee')]);

    useEffect(() => {
        fetchCurrencies({ limit: 1000 });
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
                fetchSalaryPaymentEmployees({
                    filters: {
                        businessUnitIds:
                            operationsList[0]?.businessUnitId === null
                                ? [0]
                                : [operationsList[0]?.businessUnitId],
                    },
                    onSuccessCallback: ({ data }) => {
                        setEmployees(data);
                    },
                });
                fetchFilteredContracts({
                    directions: [2],
                    status: 1,
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
            fetchSalaryPaymentEmployees({
                filters: { businessUnitIds: [cookies.get('_TKN_UNIT_')] },
                onSuccessCallback: ({ data }) => {
                    setEmployees(data);
                },
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
            fetchFilteredContracts({
                directions: [2],
                status: 1,
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
            });
        } else {
            fetchAllCashboxNames({ limit: 1000 });
            fetchSalaryPaymentEmployees({
                onSuccessCallback: ({ data }) => {
                    setEmployees(data);
                },
            });
            fetchSalesInvoiceList({
                filters: {
                    invoiceTypes: [11],
                    allProduction: 1,
                    isDeleted: 0,
                    limit: 10000,
                },
            });
            fetchFilteredContracts({ directions: [2], status: 1 });
        }
    }, [cookies.get('_TKN_UNIT_'), editId, operationsList]);

    useEffect(() => {
        if (!id && !editId) {
            if (employees.length === 1) {
                setFieldsValue({
                    employee: employees[0].id,
                });
                handleEmployeeChange(employees[0].id);
            } else {
                setFieldsValue({
                    employee: undefined,
                });
            }
        }
    }, [employees]);

    useEffect(() => {
        if (salaryPaymentData.typeOfPayment === 1 && !editId) {
            const Account = allCashBoxNames.filter(
                cashbox => cashbox.type === salaryPaymentData.typeOfPayment
            );
            if (Account.length === 1) {
                handleAccountChange(Account[0].id);
                setFieldsValue({
                    paymentAccount: Account[0].id,
                });
            }
        }
    }, [salaryPaymentData.typeOfPayment, allCashBoxNames]);

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
                paymentAccount: Account?.filter(
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

    useEffect(() => {
        if (Object.keys(paidSalaries)?.length > 0) {
            if (
                Number(
                    moment(Object.keys(paidSalaries).pop(), 'MM/YYYY').format(
                        'MM'
                    ) || 0
                ) < Number(getFieldValue('operationDate').format('MM') || 0)
            ) {
                setFieldsValue({
                    operationDate: moment(
                        `${getFieldValue('operationDate').format(
                            'DD'
                        )}/${moment(
                            Object.keys(paidSalaries).pop(),
                            'MM/YYYY'
                        ).format('MM/YYYY')}`,
                        'DD/MM/YYYY'
                    ),
                });
            }
        }
    }, [paidSalaries]);

    const contractsArr = filteredContracts.map(contract => ({
        ...contract,
        name: `${contract.counterparty_name} - ${contract.contract_no}`,
    }));

    const salaries = Object.keys(paidSalaries).map(tab => (
        <div>
            {tab} -{' '}
            {formatNumberToLocale(
                defaultNumberFormat(paidSalaries[tab].toBePaid || 0)
            )}{' '}
            {salaryPaymentData.employee?.currencyCode}
        </div>
    ));

    const disabledDate = current =>
        !Object.keys(paidSalaries)
            .map(sala => moment(sala, 'MM/YYYY')?.format('MM-YYYY'))
            .includes(current?.format('MM-YYYY'));

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
                activeTab={salaryPaymentData.typeOfPayment}
            />

            <Form onSubmit={completeOperation}>
                <div className={styles.parentBox}>
                    <div className={styles.paper}>
                        {/* Employees search input */}
                        <Row
                            style={{
                                margin: '10px 0',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Col span={23}>
                                <ProFormItem
                                    label="Əməkdaş"
                                    help={getFieldError('employee')?.[0]}
                                >
                                    {getFieldDecorator('employee', {
                                        getValueFromEvent: employeeId => {
                                            handleEmployeeChange(employeeId);
                                            return employeeId;
                                        },
                                        rules: [requiredRule],
                                    })(
                                        <ProSelect
                                            className={styles.employeeSelect}
                                            loading={employeesLoading}
                                            keys={[
                                                'name',
                                                'surname',
                                                'patronymic',
                                            ]}
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
                                                          ...employees.filter(
                                                              employee =>
                                                                  employee.id !==
                                                                  operationsList[0]
                                                                      ?.employeeId
                                                          ),
                                                      ]
                                                    : employees
                                            }
                                            allowClear={false}
                                            style={{ width: '98%' }}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                            <Col span={1}>
                                <div className={styles.customInfo}>
                                    <Tooltip
                                        placement="right"
                                        title={salaryAvailable ? salaries : []}
                                    >
                                        <BsInfo />
                                    </Tooltip>
                                </div>
                            </Col>
                        </Row>
                        {getFieldValue('employee') && (
                            <Dept
                                currency={
                                    salaryPaymentData.employee?.currencyCode
                                }
                                value={
                                    editId &&
                                    operationsList?.length > 0 &&
                                    operationsList[0].employeeId ===
                                        getFieldValue('employee')
                                        ? math.add(
                                              Number(
                                                  operationsList[0]?.amount || 0
                                              ),
                                              Number(
                                                  salaryPaymentData.employee
                                                      ?.currentBalance || 0
                                              )
                                          )
                                        : salaryPaymentData.employee
                                              ?.currentBalance
                                }
                            />
                        )}
                    </div>
                    <div className={styles.paper}>
                        <ProFormItem
                            label="Əməliyyat tarixi"
                            help={getFieldError('operationDate')?.[0]}
                        >
                            {getFieldDecorator('operationDate', {
                                getValueFromEvent: date => date,
                                rules: [requiredRule],
                            })(
                                <ProDatePicker
                                    disabledDate={
                                        disabledDate
                                        // d =>
                                        // !d ||
                                        // d.isBefore(moment().startOf('month')) ||
                                        // d.isAfter(moment().endOf('day'))
                                    }
                                    format={fullDateTimeWithSecond}
                                />
                            )}
                        </ProFormItem>
                        <Row
                            style={{
                                margin: '10px 0',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
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
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                            ) : null}
                            <Col
                                span={productionInvoices?.length > 0 ? 16 : 24}
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
                                                    2
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
                        </Row>
                        <TypeOfPayment
                            typeOfPayment={salaryPaymentData.typeOfPayment}
                            changeTypeOfPayment={changeTypeOfPayment}
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
                                            getFieldError('paymentAccount')?.[0]
                                        }
                                    >
                                        {getFieldDecorator('paymentAccount', {
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
                                                        salaryPaymentData.typeOfPayment
                                                )}
                                                allowClear={false}
                                            />
                                        )}
                                    </ProFormItem>
                                </div>
                            </Col>
                        </Row>

                        {getFieldValue('paymentAccount') && (
                            <AccountBalance
                                label="Əməliyyat tarixi üzrə qalıq:"
                                list={salaryPaymentData.accountBalances}
                                loading={balanceLoading}
                                editId={editId}
                                operationsList={operationsList}
                                typeOfPayment={salaryPaymentData.typeOfPayment}
                                selectedAccount={getFieldValue(
                                    'paymentAccount'
                                )}
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
                                            disabled={getFieldValue('employee')}
                                            keys={['code']}
                                            data={currencies}
                                            allowClear={false}
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
                                type="primary"
                                htmlType="submit"
                                className={styles.submit}
                                loading={
                                    paymentLoading ||
                                    materialsLoading ||
                                    productionExpensesListLoading ||
                                    selectedMaterialLoading ||
                                    selectedEmployeeExpenseLoading ||
                                    selectedExpenseLoading ||
                                    productionInfoLoading ||
                                    loader
                                }
                                disabled={
                                    paymentLoading ||
                                    materialsLoading ||
                                    productionExpensesListLoading ||
                                    selectedMaterialLoading ||
                                    selectedEmployeeExpenseLoading ||
                                    selectedExpenseLoading ||
                                    productionInfoLoading ||
                                    loader
                                }
                            >
                                Təsdiq et
                            </Button>
                            {editId ? null : (
                                <Button
                                    loading={
                                        paymentLoading ||
                                        materialsLoading ||
                                        productionExpensesListLoading ||
                                        selectedMaterialLoading ||
                                        selectedEmployeeExpenseLoading ||
                                        selectedExpenseLoading ||
                                        productionInfoLoading ||
                                        loader
                                    }
                                    disabled={
                                        paymentLoading ||
                                        materialsLoading ||
                                        productionExpensesListLoading ||
                                        selectedMaterialLoading ||
                                        selectedEmployeeExpenseLoading ||
                                        selectedExpenseLoading ||
                                        productionInfoLoading ||
                                        loader
                                    }
                                    type="primary"
                                    onClick={(e, nextSubmit) =>
                                        completeOperation(
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
};

const mapStateToProps = state => ({
    currencies: state.kassaReducer.currencies,
    cashBoxBalance: state.cashBoxBalanceReducer.cashBoxBalance,
    cashBoxBalanceLoading: state.cashBoxBalanceReducer.isLoading,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    contracts: state.contractsReducer.contracts,
    filteredContracts: state.contractsReducer.filteredContracts,
    tenant: state.tenantReducer.tenant,
    paidSalaries: state.financeOperationsReducer.paidSalaries,
    productionInvoices: state.salesAndBuysReducer.invoices,
    selectedProductionExpense: state.salesOperation.selectedProductionExpense,
    selectedProductionEmployeeExpense:
        state.salesOperation.selectedProductionEmployeeExpense,
    selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
    materialInvoices: state.salesOperation.materialList,
    productionExpensesList: state.salesOperation.productionExpensesList,
    operationsList: state.financeOperationsReducer.operationsList,

    // Loadings
    balanceLoading: state.loadings.accountBalance,
    isLoading: state.kassaReducer.isLoading,
    employeesLoading: state.loadings.fetchSalaryPaymentEmployees,
    paymentLoading: state.loadings.createSalaryPayment,
    materialsLoading: state.loadings.fetchMaterialList,
    productionExpensesListLoading: state.loadings.fetchProductionExpensesList,
    selectedMaterialLoading: state.loadings.fetchProductionMaterialExpense,
    selectedEmployeeExpenseLoading:
        state.loadings.fetchProductionEmployeeExpense,
    selectedExpenseLoading: state.loadings.fetchProductionExpense,
    productionInfoLoading: state.loadings.productionInfo,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceList,
        fetchSalaryPaymentEmployees,
        fetchCurrencies,
        fetchContracts,
        fetchAllCashboxNames,
        createOperationSalaryPayment,
        fetchAdvancePaymentByContactId,
        fetchInvoiceListByContactId,
        fetchAccountBalance,
        fetchFilteredContracts,
        getPaidSalaries,
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
        editOperationSalaryPayment,
        handleResetInvoiceFields,
    }
)(Form.create({ name: 'SalaryPaymentForm' })(SalaryPayment));
