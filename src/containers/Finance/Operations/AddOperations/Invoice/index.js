/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { cookies } from 'utils/cookies';
import { connect, useDispatch } from 'react-redux';
import moment from 'moment';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import {
    fetchAdvancePaymentByContactId,
    fetchInvoiceListByContactId,
    convertCurrency,
    fetchLastDateOfAdvanceByContactId,
} from 'store/actions/contact';
import { fetchExpenseCatalogs } from 'store/actions/expenseItem';

import { fetchContracts } from 'store/actions/contracts';
import {
    fetchAllCashboxNames,
    fetchCurrencies,
    fetchMainCurrency,
} from 'store/actions/settings/kassa';
import {
    fetchTenantBalance,
    fetchAccountBalance,
} from 'store/actions/finance/operations';
import { BsInfo, BsListCheck } from 'react-icons/all';
import { fetchFilteredContacts } from 'store/actions/contacts-new';
import {
    fetchSalesInvoiceInfo,
    fetchSalesInvoiceList,
} from 'store/actions/salesAndBuys';
import {
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
    createOperationInvoice,
    editOperationInvoice,
} from 'store/actions/finance/initialBalance';

import { fetchWorkers } from 'store/actions/hrm/workers';

import { fetchCreditPayments } from 'store/actions/finance/paymentTable';
import {
    messages,
    roundToDown,
    customRound,
    fullDateTimeWithSecond,
    todayWithMinutes,
    dateFormat,
    defaultNumberFormat,
} from 'utils';
import {
    Input,
    Button,
    Spin,
    Form,
    Row,
    Col,
    Tooltip,
    Checkbox,
    Divider,
} from 'antd';
import swal from '@sweetalert/with-react';
import {
    ProDatePicker,
    ProSelect,
    ProFormItem,
    ProInput,
    ProModal,
    UpdateExpenseModal,
    ProAsyncSelect,
} from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { FaChevronRight } from 'react-icons/fa';
import OperationsDetails from 'containers/Finance/PaymentTable/operationsDetails';
import styles from '../styles.module.scss';
import {
    OperationType,
    AccountBalance,
    TypeOfPayment,
    AmountOfTransaction,
    ReceivablesPayables,
    AdvancePayment,
    Dept,
} from '../shared';
import { getInvoiceList, handleReceivablesPayables } from './actions';
import AddAccount from '../shared/AddAccount';
import AddInvoice from './AddInvoice';

const roundTo = require('round-to');
const math = require('exact-math');
const BigNumber = require('bignumber.js');

const { TextArea } = Input;

function Invoice(props) {
    const {
        currencies,
        convertCurrency,
        fetchAccountBalance,
        fetchAdvancePaymentByContactId,
        fetchAllCashboxNames,
        fetchInvoiceListByContactId,
        createOperationInvoice,
        editOperationInvoice,
        fetchSalesInvoiceInfo,
        form,
        editId,
        operationsList,
        allCashBoxNames,
        fetchFilteredContacts,
        fetchCurrencies,
        fetchCreditPayments,
        creditPayments,
        mainCurrency,
        fetchMainCurrency,

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
        selectedProductionExpense,
        selectedProductionEmployeeExpense,
        selectedProductionMaterial,
        materialInvoices,
        productionExpensesList,
        handleResetInvoiceFields,
        fetchLastDateOfAdvanceByContactId,

        // Loadings
        invoicesLoading,
        advanceLoading,
        convertLoading,
        balanceLoading,
        paymentLoading,
        invoiceInfoLoading,
        isLoading,
        creditsLoading,
        // loadings
        materialsLoading,
        productionExpensesListLoading,
        selectedMaterialLoading,
        selectedEmployeeExpenseLoading,
        selectedExpenseLoading,

        workersLoading,
        currenciesLoading,

        workers,
        productionInvoices,
        contracts,
        tenant,
        expenseCatalogs,

        fetchTenantBalance,
        fetchWorkers,
        fetchExpenseCatalogs,
        fetchContracts,
        fetchSalesInvoiceList,
    } = props;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    const isQueryVat = urlParams.get('isVat') === 'true';
    const approveBtnType = React.useRef(false);

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    const [invoiceData, setInvoiceData] = useState({
        invoice: undefined,
        balanceAccount: undefined,
        counterparty: undefined,
        currency: undefined,
        rate: undefined,
        typeOfOperation: 1,
        typeOfPayment: 1,
        counterpartyId: undefined,
    });

    const paymentDirection = {
        1: 'contactsAmount',
        [-1]: 'myAmount',
    };

    const dispatch = useDispatch();
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [useAdvance, setUseAdvance] = useState(false);
    const [receivables, setReceivables] = useState({});
    const [payables, setPayables] = useState({});
    const [invoices, setInvoices] = useState([]);
    const [advancePayment, setAdvancePayment] = useState([]);
    const [accountBalances, setAccountBalances] = useState([]);
    const [activeTab, setActiveTab] = useState(3);
    const [visible, setVisible] = useState(false);
    const [checked, setChecked] = useState(false);
    const [productionId, setProductionId] = useState(undefined);
    const [itemIndex, setItemIndex] = useState(undefined);
    const [currencyCode, setCurrencyCode] = useState(undefined);
    const [updateModalIsVisible, setUpdateModalIsVisible] = useState(false);
    const [loader, setLoader] = useState(false);
    const [productionInfo, setProductionInfo] = useState(undefined);
    const [summaries, setSummaries] = useState(undefined);
    const [productionOrders, setProductionOrders] = useState([]);
    const [allProductionData, setAllProductionData] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [accountVisible, SetaccountVisible] = useState(false);
    const [addedAccount, SetAddedAccount] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [invoiceModal, setInvoiceModal] = useState(false);
    const [date, setDate] = useState(todayWithMinutes);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [checkList, setCheckList] = useState({
        checkedListAll: [],
        ItemsChecked: false,
    });

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
    const [selectedInvoicePurchase, setSelectedInvoicePurchase] = useState(
        undefined
    );
    const [defaultUpdateData, setDefaultUpdateData] = useState({
        id: undefined,
        parentId: undefined,
        parentName: undefined,
        name: undefined,
        type: undefined,
        editType: undefined,
    });
    const history = useHistory();
    const returnUrl = '/finance/operations';

    const updateReceivablesPayables = invoices => {
        const { receivables, payables } = handleReceivablesPayables(
            invoices,
            editId,
            operationsList
        );

        setReceivables(receivables);
        setPayables(payables);
    };

    const handlePaymenInfo = () => {
        setVisible(!visible);
    };

    const disabledDate = d => {
        if (useAdvance) {
            if (date === null) {
                return (
                    (invoiceData?.invoice &&
                        d.isBefore(
                            moment(
                                invoiceData?.invoice?.operationDate,
                                fullDateTimeWithSecond
                            )
                        )) ||
                    d.isAfter(
                        moment(todayWithMinutes, fullDateTimeWithSecond).endOf(
                            'day'
                        )
                    )
                );
            }
            return (
                !d ||
                d.isBefore(
                    moment(date, fullDateTimeWithSecond)
                        .endOf('day')
                        .subtract(1, 'days')
                ) ||
                d.isAfter(
                    moment(todayWithMinutes, fullDateTimeWithSecond).endOf(
                        'day'
                    )
                )
            );
        }
        if (selectedInvoices.length > 1) {
            const moments = selectedInvoices.map(d =>
                moment(d.operationDate, fullDateTimeWithSecond)
            );
            const maxDate = moment.max(moments);
            return (
                d.isBefore(maxDate) ||
                d.isAfter(
                    moment(todayWithMinutes, fullDateTimeWithSecond).endOf(
                        'day'
                    )
                )
            );
        }
        if (invoiceData?.invoice) {
            return (
                (invoiceData?.invoice &&
                    d.isBefore(
                        moment(
                            invoiceData?.invoice?.operationDate,
                            fullDateTimeWithSecond
                        )
                    )) ||
                d.isAfter(
                    moment(todayWithMinutes, fullDateTimeWithSecond).endOf(
                        'day'
                    )
                )
            );
        }
        return (
            !d || d.isAfter(moment(date, fullDateTimeWithSecond).endOf('day'))
        );
    };

    const handleChangeCounterparty = (selectedCounterpartyId, edit = false) => {
        const selectedCounterparty = filteredContacts.filter(
            contact => contact.id === selectedCounterpartyId
        )[0];
        setInvoiceData(prevInvoiceData => ({
            ...prevInvoiceData,
            counterparty: selectedCounterparty,
            balanceAccount: undefined,
            typeOfPayment: edit ? operationsList[0]?.paymentTypeId : 1,
            typeOfOperation: edit
                ? operationsList[0]?.isAdvance
                    ? operationsList[0]?.cashInOrCashOut === 1
                        ? -1
                        : 1
                    : operationsList[0]?.cashInOrCashOut
                : 1,
            currency: edit
                ? currencies?.find(
                      ({ id }) => id === operationsList[0]?.currencyId
                  )
                : currencies?.[0],
            invoice: edit
                ? isQueryVat
                    ? `${operationsList[0]?.invoiceId}-vat`
                    : Number(operationsList[0]?.invoiceId)
                : undefined,
        }));

        fetchInvoiceListByContactId(selectedCounterpartyId, data =>
            fetchInvoiceListCallback(edit, data)
        );
        if (editId) {
            fetchAdvancePaymentByContactId(
                selectedCounterpartyId,
                {
                    businessUnitIds:
                        operationsList[0]?.businessUnitId === null
                            ? [0]
                            : [operationsList[0]?.businessUnitId],
                    dateTime: getFieldValue('dateOfTransaction')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                fetchAdvancePaymentCallback
            );
        } else if (cookies.get('_TKN_UNIT_')) {
            fetchAdvancePaymentByContactId(
                selectedCounterpartyId,
                {
                    businessUnitIds: [cookies.get('_TKN_UNIT_')],
                    dateTime: getFieldValue('dateOfTransaction')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                fetchAdvancePaymentCallback
            );
        } else {
            fetchAdvancePaymentByContactId(
                selectedCounterpartyId,
                {
                    businessUnitIds: undefined,
                    dateTime: getFieldValue('dateOfTransaction')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                fetchAdvancePaymentCallback
            );
        }
    };

    const fetchInvoiceListCallback = (edit, data) => {
        const invoices = data.data;
        setInvoices(invoices); // All invoices
        updateReceivablesPayables(invoices);

        if (
            invoices.filter(
                invoice =>
                    invoice.invoiceType === 2 ||
                    invoice.invoiceType === 4 ||
                    invoice.invoiceType === 13
            ).length === 0 &&
            invoices.filter(
                invoice =>
                    invoice.invoiceType === 1 ||
                    invoice.invoiceType === 10 ||
                    invoice.invoiceType === 3 ||
                    invoice.invoiceType === 12
            ).length > 0
        ) {
            handleOperationTypeChange(-1, invoices, edit);
        } else {
            handleOperationTypeChange(1, invoices, edit);
        }
    };

    const getFilteredCurrencies = (currencies, typeOfOperation) => {
        const filteredAdvances =
            advancePayment[paymentDirection[typeOfOperation]];
        const existsAdvanceCurrencies = filteredAdvances?.map(
            filteredAdvance => filteredAdvance.currencyId
        );

        const filteredCurrencies = currencies?.filter(currency =>
            existsAdvanceCurrencies?.includes(currency.id)
        );

        return filteredCurrencies;
    };

    const fetchAdvancePaymentCallback = ({ data }) => {
        const editedData = {
            myAmount:
                editId &&
                operationsList[0]?.isAdvance &&
                operationsList[0]?.cashInOrCashOut === 1 &&
                getFieldValue('counterparty') ===
                    operationsList[0]?.contactId &&
                !data?.myAmount
                    ?.map(({ currencyId }) => currencyId)
                    .includes(Number(operationsList[0]?.currencyId))
                    ? [
                          {
                              amount: operationsList[0]?.amount,
                              code: operationsList[0]?.currencyCode,
                              currencyId: operationsList[0]?.currencyId,
                              fromFront: true,
                          },
                          ...data?.myAmount,
                      ]
                    : [...data?.myAmount],
            contactsAmount:
                editId &&
                operationsList[0]?.isAdvance &&
                operationsList[0]?.cashInOrCashOut === -1 &&
                getFieldValue('counterparty') ===
                    operationsList[0]?.contactId &&
                !data?.contactsAmount
                    ?.map(({ currencyId }) => currencyId)
                    .includes(Number(operationsList[0]?.currencyId))
                    ? [
                          {
                              amount: operationsList[0]?.amount,
                              code: operationsList[0]?.currencyCode,
                              currencyId: operationsList[0]?.currencyId,
                              fromFront: true,
                          },
                          ...data?.contactsAmount,
                      ]
                    : [...data?.contactsAmount],
        };
        setAdvancePayment(editedData);
    };

    const handleOperationTypeChange = (operationType, invoicesList, edit) => {
        setUseAdvance(edit ? operationsList[0]?.isAdvance : false);
        setFieldsValue({
            invoice: edit
                ? isQueryVat
                    ? `${operationsList[0]?.invoiceId}-vat`
                    : Number(operationsList[0]?.invoiceId)
                : undefined,
            paymentAmount: edit
                ? customRound(operationsList[0]?.amount, 1, 2)
                : undefined,
        });
        setInvoiceData({
            ...invoiceData,
            typeOfPayment: edit ? operationsList[0]?.paymentTypeId : 1,
            rate: edit
                ? roundToDown(operationsList[0]?.invoicePaymentCustomRate)
                : invoiceData.rate,
            typeOfOperation: edit
                ? operationsList[0]?.isAdvance
                    ? operationsList[0]?.cashInOrCashOut === 1
                        ? -1
                        : 1
                    : operationsList[0]?.cashInOrCashOut
                : operationType,
            invoice: edit
                ? isQueryVat
                    ? `${operationsList[0]?.invoiceId}-vat`
                    : Number(operationsList[0]?.invoiceId)
                : undefined,
            currency: edit
                ? currencies?.find(
                      ({ id }) => id === operationsList[0]?.currencyId
                  )
                : currencies?.[0],
        });
        const Voices = getInvoiceList(
            invoicesList,
            edit
                ? operationsList[0]?.isAdvance
                    ? operationsList[0]?.cashInOrCashOut === 1
                        ? -1
                        : 1
                    : operationsList[0]?.cashInOrCashOut
                : operationType,
            editId,
            operationsList
        ).filter(invoice => Number(invoice.debtAmount) || invoice.fromEdit);

        if (Voices) {
            setFieldsValue({
                invoice:
                    Voices.length === 1
                        ? Voices[0].id
                        : edit
                        ? isQueryVat
                            ? `${operationsList[0]?.invoiceId}-vat`
                            : Number(operationsList[0]?.invoiceId)
                        : undefined,
            });
            if (edit) {
                handleSelectInvoice(
                    isQueryVat
                        ? `${operationsList[0]?.invoiceId}-vat`
                        : Number(operationsList[0]?.invoiceId),
                    invoicesList,
                    operationType,
                    edit
                );
                if (operationsList[0]?.employeeId) {
                    setFieldsValue({
                        employee: operationsList[0]?.employeeId,
                        catalog: operationsList[0]?.transactionCatalogId,
                        subCatalog: operationsList[0]?.transactionItemId,
                    });
                }
            }
            if (Voices.length === 1 && !edit) {
                handleSelectInvoice(Voices[0].id, invoicesList, operationType);
            }
            setChecked(edit ? !!operationsList[0]?.employeeId : false);
        } else {
            setFieldsValue({
                invoice: edit
                    ? isQueryVat
                        ? `${operationsList[0]?.invoiceId}-vat`
                        : Number(operationsList[0]?.invoiceId)
                    : undefined,
                paymentAmount: edit
                    ? customRound(operationsList[0]?.amount, 1, 2)
                    : undefined,
            });
        }
    };

    const handleCurrencyChange = selectedCurrencyId => {
        const selectedCurrency = currencies.filter(
            currency => currency.id === selectedCurrencyId
        )[0];
        if (selectedCurrency) {
            setCurrencyCode(selectedCurrency.code);
        }
        setInvoiceData({
            ...invoiceData,
            currency: selectedCurrency,
            edit: false,
        });
    };

    const handleSelectInvoice = (
        selectedInvoiceId,
        invoices,
        operationType,
        edit
    ) => {
        const selectedInvoice = getInvoiceList(
            invoices,
            edit
                ? operationsList[0]?.isAdvance
                    ? operationsList[0]?.cashInOrCashOut === 1
                        ? -1
                        : 1
                    : operationsList[0]?.cashInOrCashOut
                : operationType,
            editId,
            operationsList
        ).find(invoice => invoice.id === selectedInvoiceId);
        setSelectedInvoices([selectedInvoice]);
        setSelectedInvoicePurchase(selectedInvoiceId);
        if (
            getFieldValue('dateOfTransaction').isBefore(
                moment(selectedInvoice?.operationDate, fullDateTimeWithSecond)
            )
        ) {
            setFieldsValue({
                dateOfTransaction: moment(
                    selectedInvoice?.operationDate,
                    fullDateTimeWithSecond
                ),
                currency: selectedInvoice?.currencyId,
            });
        } else {
            setFieldsValue({
                currency: selectedInvoice?.currencyId,
            });
        }

        if (selectedInvoice?.invoiceType !== 1 || selectedInvoice?.isTax) {
            setChecked(false);
        }

        if (!selectedInvoice?.isTax) {
            fetchSalesInvoiceInfo({
                id: Number(selectedInvoiceId),
                onSuccess: data => {
                    const { creditId } = data.data;
                    setInvoiceData(prevData => ({
                        ...prevData,
                        currency: currencies?.find(
                            ({ id }) => id === selectedInvoice?.currencyId
                        ),
                        invoice: { creditId, ...selectedInvoice },
                        edit,
                    }));
                },
            });
        } else {
            setInvoiceData(prevData => ({
                ...prevData,
                currency: currencies?.find(
                    ({ id }) => id === selectedInvoice?.currencyId
                ),
                invoice: { ...selectedInvoice },
                edit,
            }));
        }
    };

    const selectedInvoice = getInvoiceList(
        invoices,
        invoiceData.typeOfOperation,
        editId,
        operationsList
    ).find(invoice => invoice.id === selectedInvoicePurchase);

    const changeTypeOfPayment = (e, edit = false) => {
        setInvoiceData({ ...invoiceData, typeOfPayment: e });
        const Account = allCashBoxNames.filter(cashbox => cashbox.type === e);
        if (Account.length === 1) {
            setFieldsValue({
                account: Account[0].id,
            });

            handleAccountBalance(Account[0].id);
        } else if (!edit) {
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
                    dateTime: getFieldValue('dateOfTransaction')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                ({ data }) => {
                    if (
                        data[paymentDirection[invoiceData.typeOfOperation]]
                            ?.length === 0 &&
                        useAdvance
                    ) {
                        setUseAdvance(false);
                    }
                    setAdvancePayment(data);
                }
            );
        }
    }, [getFieldValue('dateOfTransaction')]);

    const handleAccountBalance = account => {
        setAccountBalances([]);
        // setInvoiceData({ ...invoiceData, balanceAccount: account });
        fetchAccountBalance({
            id: account,
            filters: {
                dateTime: getFieldValue('dateOfTransaction')?.format(
                    fullDateTimeWithSecond
                ),
            },
            callBack: onSuccessAccountBalance,
        });
    };

    const onSuccessAccountBalance = data => {
        if (data.data.length !== 0) {
            setAccountBalances(data.data);
        }
        if (data.data.length === 0) {
            setAccountBalances([]);
        }
    };

    const handlePaymentAmount = (event, type) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value) && event.target.value <= 1000000)
            return event.target.value;
        if (event.target.value === '') {
            return null;
        }
        return getFieldValue(type);
    };
    const handleAdvanceChange = checked => {
        if (checked) {
            const advanceBalance =
                advancePayment[paymentDirection[invoiceData.typeOfOperation]];
            const advanceCurrency = advanceBalance[0];
            setFieldsValue({
                currency: advanceCurrency?.currencyId,
                account: undefined,
            });
            setInvoiceData(prevInvoiceData => ({
                ...prevInvoiceData,
                balanceAccount: undefined,
                currency: {
                    id: advanceCurrency.currencyId,
                    code: advanceCurrency.code,
                },
            }));
            setCurrencyCode(advanceCurrency.code);
            fetchLastDateOfAdvanceByContactId(
                operationsList[0]?.contactId || getFieldValue('counterparty'),
                ({ data }) => {
                    if (data !== null) {
                        if (
                            getFieldValue('dateOfTransaction').isBefore(
                                moment(data, 'DD-MM-YYYY HH:mm:ss')
                            )
                        ) {
                            setFieldsValue({
                                dateOfTransaction: moment(
                                    data,
                                    fullDateTimeWithSecond
                                ),
                            });
                        }
                        if (
                            moment(
                                invoiceData?.invoice?.operationDate,
                                fullDateTimeWithSecond
                            ).isBefore(moment(data, 'DD-MM-YYYY HH:mm:ss')) ||
                            getFieldValue('dateOfTransaction').isBefore(
                                moment(data, 'DD-MM-YYYY HH:mm:ss')
                            )
                        ) {
                            setDate(data);
                        } else {
                            setDate(
                                invoiceData?.invoice?.operationDate ||
                                    getFieldValue('dateOfTransaction').format(
                                        fullDateTimeWithSecond
                                    )
                            );
                        }
                    } else {
                        setDate(null);
                    }
                }
            );
        } else {
            setInvoiceData(prevInvoiceData => ({
                ...prevInvoiceData,
                typeOfPayment: 1,
            }));
            setDate(todayWithMinutes);
        }
        setUseAdvance(checked);
    };

    const completeOperation = (event, nextSubmit) => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                if (
                    selectedInvoices.length < 2 &&
                    Number(values.paymentAmount) >
                        roundToDown(
                            Number(
                                invoiceData.invoice?.creditId
                                    ? editId &&
                                      operationsList?.length > 0 &&
                                      operationsList[0].invoiceId ===
                                          getFieldValue('invoice')
                                        ? math.add(
                                              Number(
                                                  invoiceData.invoice
                                                      ?.remainingInvoiceDebtWithCredit ||
                                                      0
                                              ),
                                              Number(
                                                  operationsList[0]
                                                      ?.invoicePaymentAmountConvertedToInvoiceCurrency ||
                                                      0
                                              )
                                          )
                                        : invoiceData.invoice
                                              ?.remainingInvoiceDebtWithCredit
                                    : editId &&
                                      operationsList?.length > 0 &&
                                      operationsList[0].invoiceId ===
                                          getFieldValue('invoice')
                                    ? math.add(
                                          Number(
                                              invoiceData.invoice?.debtAmount ||
                                                  0
                                          ),
                                          Number(
                                              operationsList[0]
                                                  ?.invoicePaymentAmountConvertedToInvoiceCurrency ||
                                                  0
                                          )
                                      )
                                    : invoiceData.invoice?.debtAmount
                            ) / Number(invoiceData.rate)
                        )
                ) {
                    swal({
                        title: 'Diqqət!',
                        text: `Bu ödəniş nəticəsində ${roundTo.up(
                            math.sub(
                                Number(values.paymentAmount),
                                Number(
                                    invoiceData.invoice?.creditId
                                        ? editId &&
                                          operationsList?.length > 0 &&
                                          operationsList[0].invoiceId ===
                                              getFieldValue('invoice')
                                            ? math.add(
                                                  Number(
                                                      invoiceData.invoice
                                                          ?.remainingInvoiceDebtWithCredit ||
                                                          0
                                                  ),
                                                  Number(
                                                      operationsList[0]
                                                          ?.invoicePaymentAmountConvertedToInvoiceCurrency ||
                                                          0
                                                  )
                                              )
                                            : invoiceData.invoice
                                                  ?.remainingInvoiceDebtWithCredit
                                        : editId &&
                                          operationsList?.length > 0 &&
                                          operationsList[0].invoiceId ===
                                              getFieldValue('invoice')
                                        ? math.add(
                                              Number(
                                                  invoiceData.invoice
                                                      ?.debtAmount || 0
                                              ),
                                              Number(
                                                  operationsList[0]
                                                      ?.invoicePaymentAmountConvertedToInvoiceCurrency ||
                                                      0
                                              )
                                          )
                                        : invoiceData.invoice?.debtAmount
                                ) / Number(invoiceData.rate)
                            ),
                            4
                        )}${
                            invoiceData.currency.code
                        } avans məbləğ formalaşacaqdır!`,
                        buttons: ['İmtina', 'Təsdiq et'],
                        dangerMode: true,
                    }).then(confirm => {
                        if (confirm) {
                            makePayment(values, nextSubmit);
                        }
                    });
                } else {
                    makePayment(values, nextSubmit);
                }
            }
        });
    };

    const makePayment = (values, nextSubmit) => {
        const {
            counterparty,
            invoice,
            dateOfTransaction,
            paymentAmount,
            currency,
            account,
            description,
            employee,
            expenseType,
            contract,
            catalog,
            subCatalog,
        } = values;
        setProductionId(contract);
        setLoader(true);
        const id =
            Array.isArray(invoice) && invoice.length > 0
                ? invoice.map(item => Number(String(item).split('-')?.[0]))
                : [Number(String(invoice).split('-')?.[0])]; // VAT OR NOT EPIC CHECKOUT
        const data = {
            // contact: counterparty,
            type: useAdvance ? null : invoiceData.typeOfOperation,
            dateOfTransaction: dateOfTransaction.format(fullDateTimeWithSecond),
            cashbox: useAdvance ? null : account,
            typeOfPayment: invoiceData.typeOfPayment,
            description,
            useAdvance,
            invoices_ul: id || [],
            amounts_ul:
                selectedInvoices?.length > 1
                    ? selectedInvoices.map(({ mustPay }) => Number(mustPay))
                    : [Number(paymentAmount)],
            rate: invoiceData.rate,
            currencies_ul:
                selectedInvoices?.length > 1
                    ? selectedInvoices.map(item => currency)
                    : [currency],
            isTax:
                Array.isArray(invoice) && invoice.length > 0
                    ? String(invoice[0]).split('-')?.length > 1
                    : String(invoice).split('-')?.length > 1,
            employee: checked ? employee : null,
            contract: checked
                ? expenseType === 1
                    ? null
                    : contract === 0
                    ? null
                    : contract
                : null,
            productionInvoice: checked
                ? expenseType === 1
                    ? contract
                    : null
                : null,
            transactionCatalog: checked ? catalog : null,
            transactionItem: checked ? subCatalog : null,
        };
        // if (nextSubmit) {
        //     createOperationInvoice(
        //         data,
        //         onSuccessCallbackNext,
        //         onFailureCallback
        //     );
        // } else {
        //     createOperationInvoice(data, onSuccessCallback, onFailureCallback);
        // }
        if (editId) {
            editOperationInvoice(
                editId,
                data,
                () => {
                    onCreateCallBack(expenseType, contract, nextSubmit, true);
                },
                onFailureCallback
            );
        } else {
            createOperationInvoice(
                data,
                () => {
                    onCreateCallBack(expenseType, contract, nextSubmit);
                },
                onFailureCallback
            );
        }
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
            checked &&
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
        } else if (expenseType === 1 && checked) {
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
            toast.success('Məlumatlar yadda saxlanıldı.', {
                className: 'success-toast',
            });
            window.location.reload();
        } else {
            toast.success('Məlumatlar yadda saxlanıldı.', {
                className: 'success-toast',
            });
            // history.goBack();
            history.replace(returnUrl);
        }
    };
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
                if (productionInfo?.stockToId !== null) {
                    let newTransferData = {};
                    newTransferData = {
                        operationDate: productionInfo.operationDate,
                        stock: productionInfo.stockToId,
                        invoiceProducts_ul: handleSelectedTransfer(
                            productionInfo.invoiceProducts?.content
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
                            productionInfo.invoiceProducts?.content
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
    const handleSelectedTransfer = selectedProducts => {
        const totalQuantity = selectedProducts.reduce(
            (total_amount, { quantity }) =>
                math.add(total_amount, Number(quantity) || 0),
            0
        );

        return selectedProducts.map(
            ({ planned_cost, planned_price, invoiceProductId }) => ({
                id: invoiceProductId,
                plannedCost: Number(planned_cost),
                plannedPrice: Number(planned_price),
                itemCost:
                    summaries > 0
                        ? new BigNumber(summaries).dividedBy(
                              new BigNumber(totalQuantity)
                          )
                        : 0,
            })
        );
    };

    const handleSelectedProductionProducts = selectedProducts => {
        const totalQuantity = selectedProducts.reduce(
            (total_amount, { quantity }) =>
                math.add(total_amount, Number(quantity) || 0),
            0
        );
        return selectedProducts.map(({ invoiceProductId }) => ({
            id: invoiceProductId,
            itemCost:
                summaries > 0
                    ? new BigNumber(summaries).dividedBy(
                          new BigNumber(totalQuantity)
                      )
                    : 0,
        }));
    };
    // const onSuccessCallbackNext = () => {
    //     toast.success('Məlumatlar yadda saxlanıldı.');
    //     window.location.reload();
    // };
    // const onSuccessCallback = () => {
    //     toast.success('Məlumatlar yadda saxlanıldı.');
    //     history.push('/finance/operations');
    // };
    // const onFailureCallback = () => {
    //     setLoader(false);
    //     toast.error('Xəta baş verdi.');
    // };
    const onFailureCallback = ({ error }) => {
        setLoader(false);
        const errData = error?.response?.data?.error?.errorData;
        const errKey = error?.response?.data?.error?.errors;

        if (errKey?.key && errKey?.key === 'wrong_advance_amount') {
            toast.error(
                `Avans balansında kifayət qədər vəsait yoxdur. Seçilmış tarixdə ödəniləcək məbləğ ${defaultNumberFormat(
                    errKey?.data?.number
                )} ${
                    currencies.find(
                        curr => curr.id === getFieldValue('currency')
                    ).code
                } çox ola bilməz.`
            );
        } else {
            const cashboxName =
                errData?.cashbox?.length > 15
                    ? `${errData?.cashbox.substring(0, 15)} ...`
                    : errData?.cashbox;
            if (editId && operationsList[0]?.operationDirectionId === 1) {
                if (
                    errData?.cashbox ===
                        allCashBoxNames.find(
                            acc => acc.id === getFieldValue('account')
                        )?.name ||
                    errData?.currencyCode ===
                        currencies.find(
                            curr => curr.id === getFieldValue('currency')
                        ).code
                ) {
                    if (
                        invoiceData.typeOfOperation === -1 &&
                        operationsList[0]?.currencyId ===
                            getFieldValue('currency') &&
                        operationsList[0]?.cashboxId ===
                            getFieldValue('account')
                    ) {
                        const amount = math.sub(
                            Number(math.mul(Number(errData.amount || 0), -1)),
                            Number(getFieldValue('paymentAmount'))
                        );
                        toast.error(
                            `Əməliyyat növü dəyişdirilə bilməz. ${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                                amount,
                            ]} ${
                                errData?.currencyCode
                            } az ola bilməz. Tarix:  ${errData?.date}`
                        );
                    } else if (accountBalances.length === 0) {
                        toast.error(
                            `Seçilmiş kassada ${errData?.currencyCode} valyutasında kifayət qədər məbləğ yoxdur.`
                        );
                    } else {
                        const amount = math.mul(
                            Number(errData.amount || 0),
                            -1
                        );
                        toast.error(
                            `${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                                amount,
                            ]} ${errData?.currencyCode} az ola bilməz. Tarix: ${
                                errData?.date
                            }`
                        );
                    }
                } else if (invoiceData.typeOfOperation === 1) {
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
                    toast.error(
                        `Əməliyyat növü dəyişdirilə bilməz. ${cashboxName} hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${[
                            amount,
                        ]} ${errData?.currencyCode} az ola bilməz. Tarix:  ${
                            errData?.date
                        }`
                    );
                }
                // const amount =
                //     errData?.cashbox ===
                //         allCashBoxNames.find(
                //             acc => acc.id === getFieldValue('account')
                //         )?.name &&
                //     errData?.currencyCode ===
                //         currencies.find(
                //             curr => curr.id === getFieldValue('currency')
                //         ).code
                //         ? math.sub(
                //               Number(getFieldValue('paymentAmount')),
                //               Number(errData.amount)
                //           )
                //         : math.mul(Number(errData.amount || 0), -1);
            } else {
                const amount =
                    operationsList[0]?.paymentTypeId ===
                    invoiceData.typeOfOperation
                        ? math.add(
                              Number(getFieldValue('paymentAmount')),
                              Number(errData.amount)
                          )
                        : math.sub(
                              math.mul(Number(errData.amount || 0), -1),
                              Number(getFieldValue('paymentAmount'))
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

    const handleSelectedInvoicePayment = () => {
        fetchSalesInvoiceInfo({
            id,
            onSuccess: data => {
                const {
                    supplierId,
                    invoiceType,
                    currencyId,
                    clientId,
                    counterpartyId,
                    currencyCode,
                    creditId,
                    counterparty: name,
                    counterpartyName: taxCounterparty,
                    clientName,
                    supplierName,
                } = data.data;
                const counterparty = isQueryVat
                    ? counterpartyId || supplierId || clientId
                    : supplierId || counterpartyId || clientId;
                const counterpartyName = isQueryVat
                    ? taxCounterparty || name
                    : name || clientName || supplierName;
                const selectedCounterparty = filteredContacts.filter(
                    contact => contact.id === counterparty
                )[0];

                fetchInvoiceListByContactId(counterparty, data => {
                    const invoices = data.data;
                    const invoiceList = getInvoiceList(
                        invoices,
                        invoiceType === 2 ||
                            invoiceType === 4 ||
                            invoiceType === 13
                            ? 1
                            : -1
                    );
                    const selectedInvoice = invoiceList.filter(
                        invoice =>
                            invoice.id ===
                            (isQueryVat ? `${id}-vat` : Number(id))
                    )[0];

                    setSelectedInvoices([selectedInvoice]);
                    setInvoices(invoices); // All inv
                    updateReceivablesPayables(invoices);

                    setFieldsValue({
                        invoice:
                            invoices?.filter(
                                invoice => invoice.id === Number(id)
                            )?.length > 0
                                ? isQueryVat
                                    ? `${id}-vat`
                                    : Number(id)
                                : undefined,
                        counterparty,
                        currency: currencyId,
                        // dateOfTransaction: moment(),
                    });
                    setInvoiceData(prevData => ({
                        ...prevData,
                        invoice: { creditId, ...selectedInvoice },
                        currency: {
                            id: currencyId,
                            code: currencyCode,
                        },
                        counterparty: selectedCounterparty,
                        counterpartyId: counterparty,
                        counterpartyName,
                        typeOfOperation:
                            invoiceType === 2 ||
                            invoiceType === 4 ||
                            invoiceType === 13
                                ? 1
                                : -1,
                    }));

                    setInvoiceLoading(false);
                });

                fetchAdvancePaymentByContactId(
                    counterparty,
                    {
                        businessUnitIds: cookies.get('_TKN_UNIT_')
                            ? [cookies.get('_TKN_UNIT_')]
                            : undefined,
                        dateTime: getFieldValue('dateOfTransaction')?.format(
                            fullDateTimeWithSecond
                        ),
                    },
                    ({ data }) => setAdvancePayment(data)
                );
            },
        });
    };

    const Voices = getInvoiceList(
        invoices,
        invoiceData.typeOfOperation,
        editId,
        operationsList
    ).filter(invoice => Number(invoice.debtAmount) || invoice.fromEdit);

    const Account = allCashBoxNames.filter(
        cashbox => cashbox.type === invoiceData.typeOfPayment
    );

    useEffect(() => {
        if (!id && !editId) {
            if (filteredContacts.length === 1) {
                setFieldsValue({
                    counterparty: filteredContacts[0].id,
                });
                handleChangeCounterparty(filteredContacts[0].id);
            }
        }
    }, [filteredContacts]);
    useEffect(() => {
        if (!id) {
            setFieldsValue({
                counterparty: undefined,
            });
        }
        return () => {
            setFieldsValue({
                counterparty: undefined,
            });
        };
    }, []);

    useEffect(() => {
        if (invoiceData.typeOfPayment === 1 && !editId) {
            const account = allCashBoxNames.filter(
                cashbox => cashbox.type === invoiceData.typeOfPayment
            );
            if (account.length === 1) {
                setFieldsValue({
                    account: account[0].id,
                });

                handleAccountBalance(account[0].id);
            }
        }
    }, [allCashBoxNames, invoiceData.typeOfPayment]);

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
            handleAccountBalance(
                Account?.filter(person => person.name == addedAccount)[0]?.id
            );
            SetAddedAccount(null);
        }
    }, [allCashBoxNames.length, addedAccount]);

    const catalogs = expenseCatalogs?.root?.filter(({ type }) => type !== 6);

    const subcatalogs = expenseCatalogs.children
        ? expenseCatalogs.children[getFieldValue(`catalog`)]
        : [];

    useEffect(() => {
        if (workers.length === 1) {
            setFieldsValue({
                employee: workers[0].id,
            });
        }
        if (catalogs && catalogs.length === 1) {
            setFieldsValue({ catalog: catalogs[0]?.id });
        }

        if (subcatalogs && subcatalogs.length === 1) {
            setFieldsValue({ subCatalog: subcatalogs[0].id });
        }
    }, [checked, getFieldValue(`catalog`)]);

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
    }, [checked, productionArr.length]);

    useEffect(() => {
        if (checked) {
            setFieldsValue({
                amount: getFieldValue('paymentAmount'),
            });
        }
    }, [checked, getFieldValue('paymentAmount')]);

    useEffect(() => {
        if (
            (invoiceData.invoice?.id ||
                (!id && !editId && selectedInvoices.length > 0)) &&
            invoiceData.currency?.id
        ) {
            setSelectedInvoicePurchase(getFieldValue('invoice'));
            const {
                debtAmount,
                currencyId,
                creditId,
                remainingInvoiceDebtWithCredit,
            } = invoiceData.invoice || {};
            if (useAdvance) {
                const fieldName = paymentDirection[invoiceData.typeOfOperation];
                const selectedAdvance = advancePayment[fieldName].filter(
                    advance => advance.currencyId === invoiceData.currency.id
                )[0];
                convertCurrency(
                    Number(selectedAdvance?.amount || 0),
                    invoiceData.currency.id,
                    currencyId,
                    ({ data }) => {
                        const covertingAmount =
                            creditId !== null
                                ? Number(remainingInvoiceDebtWithCredit) >
                                  Number(data.amount)
                                    ? Number(data.amount)
                                    : Number(remainingInvoiceDebtWithCredit)
                                : Number(debtAmount) > Number(data.amount)
                                ? Number(data.amount)
                                : Number(debtAmount);
                        convertCurrency(
                            covertingAmount,
                            currencyId,
                            invoiceData.currency.id,
                            ({ data }) => {
                                if (!invoiceData.edit) {
                                    setInvoiceData(prevData => ({
                                        ...prevData,
                                        rate: 1 / data.rate,
                                    }));
                                    setFieldsValue({
                                        paymentAmount: customRound(
                                            data.amount,
                                            1,
                                            2
                                        ),
                                    });
                                }
                            }
                        );
                    }
                );
            } else {
                convertCurrency(
                    creditId !== null
                        ? remainingInvoiceDebtWithCredit || 1
                        : debtAmount || 1,
                    currencyId || selectedInvoices?.[0]?.currencyId,
                    invoiceData.currency.id,
                    ({ data }) => {
                        if (!invoiceData.edit) {
                            setInvoiceData(prevData => ({
                                ...prevData,
                                rate: 1 / data.rate,
                            }));
                            setFieldsValue({
                                paymentAmount: customRound(
                                    selectedInvoices
                                        .map(({ id }) => id)
                                        .includes(invoiceData.invoice?.id)
                                        ? Number(
                                              selectedInvoices.reduce(
                                                  (total, { mustPay }) =>
                                                      math.add(
                                                          total,
                                                          Number(
                                                              mustPay ||
                                                                  Number(
                                                                      creditId !==
                                                                          null
                                                                          ? remainingInvoiceDebtWithCredit ||
                                                                                0
                                                                          : debtAmount ||
                                                                                0
                                                                  )
                                                          ) || 0
                                                      ),
                                                  0
                                              ) || 0
                                          )
                                        : math.add(
                                              Number(
                                                  creditId !== null
                                                      ? remainingInvoiceDebtWithCredit ||
                                                            0
                                                      : debtAmount || 0
                                              ) || 0,
                                              Number(
                                                  selectedInvoices.reduce(
                                                      (total, { mustPay }) =>
                                                          math.add(
                                                              total,
                                                              Number(mustPay) ||
                                                                  0
                                                          ),
                                                      0
                                                  ) || 0
                                              )
                                          ),
                                    data.rate,
                                    2
                                ),
                            });
                        }
                    }
                );
            }
        }
    }, [
        invoiceData.invoice,
        invoiceData.currency,
        useAdvance,
        selectedInvoices,
    ]);

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
                dateOfTransaction:
                    editId && operationsList
                        ? moment(
                              operationsList[0]?.dateOfTransaction,
                              fullDateTimeWithSecond
                          )
                        : moment(),
            });
        }
    }, [editId, operationsList, productionInvoices]);

    useEffect(() => {
        if (id && currencies.length > 0 && dataFetched) {
            setInvoiceLoading(true);
            handleSelectedInvoicePayment(id);
        }
    }, [id, dataFetched, currencies]);

    useEffect(() => {
        if (currencies?.length > 0) {
            setInvoiceData({
                ...invoiceData,
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
                // dateOfTransaction:
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
        }
    }, [currencies]);

    useEffect(() => {
        if (editId && operationsList?.length > 0) {
            if (operationsList[0]?.isAdvance) {
                fetchLastDateOfAdvanceByContactId(
                    operationsList[0]?.contactId,
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
                counterparty: operationsList[0]?.contactId,
                operationDate: moment(
                    operationsList[0].dateOfTransaction,
                    fullDateTimeWithSecond
                ),
                invoice: isQueryVat
                    ? `${operationsList[0]?.invoiceId}-vat`
                    : Number(operationsList[0]?.invoiceId),
                currency: operationsList[0].currencyId,
                description: operationsList[0]?.description,
                account: operationsList[0]?.cashboxId || undefined,
            });
            if (operationsList[0]?.employeeId) {
                setFieldsValue({
                    catalog: operationsList[0]?.transactionCatalogId,
                    subCatalog: operationsList[0]?.transactionItemId,
                });
                setChecked(true);
            }
            setUseAdvance(operationsList[0]?.isAdvance);
        } else {
            setFieldsValue({
                dateOfTransaction: moment(),
            });
        }
    }, [editId, operationsList]);

    useEffect(() => {
        if (!editId && !invoiceModal && checkList.checkedListAll?.length > 0) {
            setFieldsValue({ invoice: checkList.checkedListAll });
        }
    }, [invoiceModal]);

    useEffect(() => {
        if (editId && operationsList && allCashBoxNames?.length > 0) {
            changeTypeOfPayment(operationsList[0]?.paymentTypeId, true);
        }
    }, [editId, operationsList, allCashBoxNames]);

    useEffect(() => {
        if (
            editId &&
            operationsList &&
            currencies.length > 0 &&
            operationsList[0]?.contactId === getFieldValue('counterparty') &&
            filteredContacts.length < 21 &&
            filteredContacts.length >= 0
        ) {
            handleChangeCounterparty(operationsList[0].contactId, true);
        }
    }, [editId, operationsList, filteredContacts, currencies]);

    // Initial data fetch
    useEffect(() => {
        // fetchFilteredContacts({ filters: { isInDebted: 1 } });
        fetchMainCurrency();
        fetchCurrencies({ withRatesOnly: 1, limit: 1000 });
        fetchCreditPayments({ filters: { limit: 1000 } });
        fetchExpenseCatalogs();
        return () => {
            handleResetInvoiceFields();
        };
    }, []);
    useEffect(() => {
        if (id && !invoiceInfoLoading && getFieldValue('invoice')) {
            if (cookies.get('_TKN_UNIT_')) {
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
            }
        }
    }, [id, operationsList, getFieldValue('invoice')]);

    useEffect(() => {
        if (!id) {
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
        }
    }, [cookies.get('_TKN_UNIT_'), editId, operationsList]);

    useEffect(() => {
        if (
            !getFieldValue('invoice') ||
            getFieldValue('invoice')?.length === 0
        ) {
            setSelectedInvoices([]);
        }
    }, [getFieldValue('invoice')]);

    const handleCheckbox = checked => {
        if (checked) {
            setChecked(true);
        } else {
            setChecked(false);
        }
    };
    // -------
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

    const contractsArr = contracts.map(contract => ({
        ...contract,
        name: `${contract.counterparty_name} - ${contract.contract_no}`,
    }));

    const toggleUpdateModal = () => {
        setUpdateModalIsVisible(
            prevUpdateModalIsVisible => !prevUpdateModalIsVisible
        );
    };
    const handleAddModal = id => {
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
        toggleUpdateModal();
    };

    const onSuccessItemUpdate = data => {
        toggleUpdateModal();
        fetchExpenseCatalogs();
        setFieldsValue({ subCatalog: data.data.id });
    };

    const ajaxContactsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, isInDebted: 1 };
        fetchFilteredContacts({ filters }, data => {
            if (!dataFetched) {
                setDataFetched(data.data.length > 0);
            }
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({ id: element.id, name: element.name });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setFilteredContacts(appendList);
            } else {
                setFilteredContacts(filteredContacts.concat(appendList));
            }
        });
    };

    return (
        <>
            <AddAccount
                accountVisible={accountVisible}
                SetaccountVisible={SetaccountVisible}
                Account={Account}
                SetAddedAccount={SetAddedAccount}
                activeTab={invoiceData.typeOfPayment}
            />
            <AddInvoice
                isVisible={invoiceModal}
                setIsVisible={setInvoiceModal}
                counterparty={getFieldValue('counterparty')}
                selectedInvoices={selectedInvoices}
                setSelectedInvoices={setSelectedInvoices}
                editId={editId}
                type={invoiceData.typeOfOperation}
                checkList={checkList}
                setCheckList={setCheckList}
                invoices={invoices}
                operationsList={operationsList}
                mainCurrency={mainCurrency}
                paymentAmount={getFieldValue('paymentAmount')}
                Voices={Voices}
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                setFieldsValue={setFieldsValue}
                currencies={currencies}
                invoiceLoading={invoiceLoading}
                setUseAdvance={setUseAdvance}
            />
            <ProModal
                maskClosable
                padding
                isVisible={visible}
                handleModal={handlePaymenInfo}
                width={1200}
            >
                <OperationsDetails
                    fromInvoice
                    fromTable
                    row={creditPayments.find(
                        creditPayment =>
                            creditPayment.creditId ===
                            invoiceData.invoice?.creditId
                    )}
                    mainCurrencyCode={mainCurrency}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handlePaymenInfo}
                    visible={visible}
                />
            </ProModal>
            <UpdateExpenseModal
                defaultUpdateData={defaultUpdateData}
                onSuccessItemUpdate={onSuccessItemUpdate}
                handleModal={toggleUpdateModal}
                isVisible={updateModalIsVisible}
            />
            <Spin spinning={invoiceLoading}>
                <Form onSubmit={completeOperation}>
                    <div className={styles.parentBox}>
                        <div className={styles.paper}>
                            <Row style={{ margin: '10px 0' }}>
                                <Col span={24}>
                                    <ProFormItem
                                        label="Qarşı tərəf"
                                        help={
                                            getFieldError('counterparty')?.[0]
                                        }
                                    >
                                        {getFieldDecorator('counterparty', {
                                            getValueFromEvent: counterpartyId => {
                                                setFieldsValue({
                                                    invoice: undefined,
                                                    paymentAmount: undefined,
                                                    typeOfPayment: 1,
                                                });

                                                setAdvancePayment([]);
                                                setUseAdvance(false);
                                                handleChangeCounterparty(
                                                    counterpartyId
                                                );
                                                return counterpartyId;
                                            },
                                            rules: [requiredRule],
                                        })(
                                            // <ProSelect
                                            //     data={filteredContacts}
                                            //     allowClear={false}
                                            // />
                                            <ProAsyncSelect
                                                allowClear={false}
                                                selectRequest={
                                                    ajaxContactsSelectRequest
                                                }
                                                disabled={isDisabled}
                                                data={
                                                    id &&
                                                    dataFetched &&
                                                    invoiceData.counterpartyId
                                                        ? [
                                                              {
                                                                  id:
                                                                      invoiceData?.counterpartyId,
                                                                  name:
                                                                      invoiceData?.counterpartyName,
                                                              },
                                                              ...filteredContacts.filter(
                                                                  client =>
                                                                      client.id !==
                                                                      invoiceData?.counterpartyId
                                                              ),
                                                          ]
                                                        : editId &&
                                                          operationsList
                                                        ? [
                                                              {
                                                                  id:
                                                                      operationsList[0]
                                                                          ?.contactId,
                                                                  name:
                                                                      operationsList[0]
                                                                          ?.contactOrEmployee,
                                                              },
                                                              ...filteredContacts.filter(
                                                                  client =>
                                                                      client.id !==
                                                                      operationsList[0]
                                                                          ?.contactId
                                                              ),
                                                          ]
                                                        : filteredContacts
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                            </Row>
                            {getFieldValue('counterparty') && (
                                <ReceivablesPayables
                                    loadingCalc={invoicesLoading}
                                    receivables={receivables}
                                    payables={payables}
                                    editId={editId}
                                    operationsList={
                                        operationsList[0]?.isAdvance
                                            ? operationsList.map(item => ({
                                                  ...item,
                                                  operationDirectionId:
                                                      item.cashInOrCashOut === 1
                                                          ? -1
                                                          : 1,
                                              }))
                                            : operationsList
                                    }
                                    counterparty={getFieldValue('counterparty')}
                                />
                            )}

                            <Row style={{ margin: '15px 0' }}>
                                <Col span={24}>
                                    <AdvancePayment
                                        editId={editId}
                                        isInvoice
                                        selectedCounterparty={getFieldValue(
                                            'counterparty'
                                        )}
                                        operationsList={operationsList}
                                        advancePayment={advancePayment}
                                        checked={useAdvance}
                                        onChange={handleAdvanceChange}
                                        disabled={
                                            !getFieldValue('invoice') ||
                                            !getFieldValue('counterparty') ||
                                            advancePayment[
                                                paymentDirection[
                                                    invoiceData.typeOfOperation
                                                ]
                                            ]?.length === 0 ||
                                            isDisabled ||
                                            selectedInvoices?.length > 1
                                        }
                                        loading={advanceLoading}
                                    />
                                </Col>
                            </Row>

                            <OperationType
                                value={invoiceData.typeOfOperation}
                                onClickType={handleOperationTypeChange}
                                disablePayables={
                                    editId &&
                                    operationsList.length > 0 &&
                                    ((operationsList[0]?.isAdvance &&
                                        operationsList[0]?.cashInOrCashOut ===
                                            1) ||
                                        (!operationsList[0]?.isAdvance &&
                                            operationsList[0]
                                                ?.cashInOrCashOut === -1))
                                        ? false
                                        : invoices.filter(
                                              invoice =>
                                                  invoice.invoiceType === 1 ||
                                                  invoice.invoiceType === 3 ||
                                                  invoice.invoiceType === 10 ||
                                                  invoice.invoiceType === 12
                                          ).length === 0
                                }
                                invoices={invoices}
                                disableReceivables={
                                    editId &&
                                    operationsList?.length > 0 &&
                                    ((operationsList[0]?.isAdvance &&
                                        operationsList[0]?.cashInOrCashOut ===
                                            -1) ||
                                        (!operationsList[0]?.isAdvance &&
                                            operationsList[0]
                                                ?.cashInOrCashOut === 1))
                                        ? false
                                        : invoices.filter(
                                              invoice =>
                                                  invoice.invoiceType === 2 ||
                                                  invoice.invoiceType === 4 ||
                                                  invoice.invoiceType === 13
                                          ).length === 0
                                }
                            />
                        </div>

                        <div className={styles.paper}>
                            <Row style={{ margin: '10px 0' }}>
                                <Col span={editId ? 24 : 23}>
                                    <ProFormItem
                                        label="Qaimə"
                                        help={getFieldError('invoice')?.[0]}
                                        customStyle={styles.formItem}
                                    >
                                        {getFieldDecorator('invoice', {
                                            getValueFromEvent: invoiceId => {
                                                handleSelectInvoice(
                                                    invoiceId,
                                                    invoices,
                                                    invoiceData.typeOfOperation
                                                );
                                                return invoiceId;
                                            },
                                            rules: [requiredRule],
                                        })(
                                            <ProSelect
                                                disabled={
                                                    !getFieldValue(
                                                        'counterparty'
                                                    ) ||
                                                    invoicesLoading ||
                                                    isDisabled ||
                                                    selectedInvoices?.length > 1
                                                }
                                                allowClear={false}
                                                keys={['invoiceNumber']}
                                                data={Voices}
                                                mode={
                                                    selectedInvoices?.length > 1
                                                        ? 'multiple'
                                                        : undefined
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>

                                {!editId && (
                                    <Col span={1}>
                                        <Button
                                            className={styles.checkButton}
                                            style={{
                                                padding: '0 5px',
                                                height: '100%',
                                                marginTop: '29px',
                                            }}
                                            disabled={
                                                !getFieldValue('counterparty')
                                            }
                                            onClick={() =>
                                                setInvoiceModal(true)
                                            }
                                        >
                                            <BsListCheck
                                                size={25}
                                                style={{ marginTop: '7px' }}
                                            />
                                        </Button>
                                    </Col>
                                )}
                            </Row>
                            {(invoiceData.invoice?.id ||
                                selectedInvoices.length > 0) && (
                                <Dept
                                    currency={
                                        invoiceData.invoice?.currencyCode ||
                                        selectedInvoices?.[0]?.currencyCode
                                    }
                                    value={
                                        invoiceData.invoice?.creditId &&
                                        invoiceData.invoice?.creditId !== null
                                            ? editId &&
                                              operationsList?.length > 0 &&
                                              ((operationsList[0]
                                                  .transactionType !== 10 &&
                                                  operationsList[0]
                                                      .invoiceId ===
                                                      getFieldValue(
                                                          'invoice'
                                                      )) ||
                                                  (invoiceData.invoice?.isTax &&
                                                      `${operationsList[0]?.invoiceId}-vat` ===
                                                          getFieldValue(
                                                              'invoice'
                                                          )))
                                                ? math.add(
                                                      Number(
                                                          invoiceData.invoice
                                                              ?.remainingInvoiceDebtWithCredit ||
                                                              0
                                                      ),
                                                      Number(
                                                          operationsList[0]
                                                              ?.invoicePaymentAmountConvertedToInvoiceCurrency ||
                                                              0
                                                      )
                                                  )
                                                : math.add(
                                                      Number(
                                                          invoiceData.invoice
                                                              ?.remainingInvoiceDebtWithCredit ||
                                                              0
                                                      ),
                                                      selectedInvoices
                                                          .filter(
                                                              ({ id }) =>
                                                                  id !==
                                                                  invoiceData
                                                                      .invoice
                                                                      ?.id
                                                          )
                                                          .reduce(
                                                              (
                                                                  total_amount,
                                                                  {
                                                                      remainingInvoiceDebtWithCredit,
                                                                  }
                                                              ) =>
                                                                  math.add(
                                                                      total_amount,
                                                                      Number(
                                                                          remainingInvoiceDebtWithCredit
                                                                      ) || 0
                                                                  ),
                                                              0
                                                          )
                                                  )
                                            : editId &&
                                              operationsList?.length > 0 &&
                                              ((operationsList[0]
                                                  .transactionType !== 10 &&
                                                  operationsList[0]
                                                      .invoiceId ===
                                                      getFieldValue(
                                                          'invoice'
                                                      )) ||
                                                  (invoiceData.invoice?.isTax &&
                                                      `${operationsList[0]?.invoiceId}-vat` ===
                                                          getFieldValue(
                                                              'invoice'
                                                          )))
                                            ? math.add(
                                                  Number(
                                                      invoiceData.invoice
                                                          ?.debtAmount || 0
                                                  ),
                                                  Number(
                                                      operationsList[0]
                                                          ?.invoicePaymentAmountConvertedToInvoiceCurrency ||
                                                          0
                                                  )
                                              )
                                            : math.add(
                                                  Number(
                                                      invoiceData.invoice
                                                          ?.debtAmount || 0
                                                  ),
                                                  selectedInvoices
                                                      .filter(
                                                          ({ id }) =>
                                                              id !==
                                                              invoiceData
                                                                  .invoice?.id
                                                      )
                                                      .reduce(
                                                          (
                                                              total_amount,
                                                              {
                                                                  remainingInvoiceDebtWithCredit,
                                                              }
                                                          ) =>
                                                              math.add(
                                                                  total_amount,
                                                                  Number(
                                                                      remainingInvoiceDebtWithCredit
                                                                  ) || 0
                                                              ),
                                                          0
                                                      )
                                              )
                                    }
                                />
                            )}

                            <Row style={{ margin: '10px 0' }}>
                                <Col span={24}>
                                    <ProFormItem
                                        label="Əməliyyat tarixi"
                                        help={
                                            getFieldError(
                                                'dateOfTransaction'
                                            )?.[0]
                                        }
                                        customStyle={styles.formItem}
                                    >
                                        {getFieldDecorator(
                                            'dateOfTransaction',
                                            {
                                                getValueFromEvent: date => {
                                                    fetchCurrencies({
                                                        dateTime: date?.format(
                                                            fullDateTimeWithSecond
                                                        ),
                                                        withRatesOnly: 1,
                                                        limit: 1000,
                                                    });
                                                    setUseAdvance(false);
                                                    return date;
                                                },
                                                rules: [requiredRule],
                                            }
                                        )(
                                            <ProDatePicker
                                                format={fullDateTimeWithSecond}
                                                disabledDate={disabledDate}
                                                disabled={isDisabled}
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                            </Row>

                            <Row style={{ margin: '10px 0' }}>
                                <Col
                                    span={
                                        invoiceData.invoice?.creditId &&
                                        invoiceData.invoice?.creditId !== null
                                            ? 16
                                            : 18
                                    }
                                >
                                    <ProFormItem
                                        label="Ödəniləcək məbləğ"
                                        help={
                                            getFieldError('paymentAmount')?.[0]
                                        }
                                        customStyle={styles.formItem}
                                    >
                                        {getFieldDecorator('paymentAmount', {
                                            getValueFromEvent: event =>
                                                handlePaymentAmount(
                                                    event,
                                                    'paymentAmount'
                                                ),
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
                                                disabled={
                                                    convertLoading ||
                                                    isDisabled ||
                                                    selectedInvoices?.length > 1
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                                {invoiceData.invoice?.creditId &&
                                invoiceData.invoice?.creditId !== null ? (
                                    <Col span={2}>
                                        <Button
                                            className={styles.customInvoiceInfo}
                                            loading={creditsLoading}
                                            disabled={creditsLoading}
                                        >
                                            <Tooltip
                                                placement="top"
                                                title="Ödəniş cədvəlinə bax"
                                            >
                                                <BsInfo
                                                    onClick={handlePaymenInfo}
                                                />
                                            </Tooltip>
                                        </Button>
                                        {/* <div
                                            className={styles.customInvoiceInfo}
                                        >
                                            <Tooltip
                                                placement="top"
                                                title="Ödəniş cədvəlinə bax"
                                            >
                                                <BsInfo
                                                    disabled={creditsLoading}
                                                    onClick={handlePaymenInfo}
                                                />
                                            </Tooltip>
                                        </div> */}
                                    </Col>
                                ) : null}
                                <Col span={6}>
                                    <ProFormItem
                                        label="Valyuta"
                                        help={getFieldError('currency')?.[0]}
                                        customStyle={styles.formItem}
                                    >
                                        {getFieldDecorator('currency', {
                                            getValueFromEvent: value => {
                                                handleCurrencyChange(value);
                                                return value;
                                            },
                                            rules: [requiredRule],
                                        })(
                                            <ProSelect
                                                keys={['code']}
                                                data={
                                                    useAdvance
                                                        ? getFilteredCurrencies(
                                                              currencies,
                                                              invoiceData.typeOfOperation
                                                          )
                                                        : currencies
                                                }
                                                allowClear={false}
                                                loading={currenciesLoading}
                                                disabled={
                                                    isDisabled ||
                                                    selectedInvoices?.length > 1
                                                }
                                            />
                                        )}
                                    </ProFormItem>
                                </Col>
                            </Row>
                            <AmountOfTransaction
                                amount={getFieldValue('paymentAmount')}
                                convertLoading={convertLoading}
                                invoiceData={invoiceData}
                                setInvoiceData={setInvoiceData}
                                selectedInvoices={selectedInvoices}
                            />
                            <TypeOfPayment
                                typeOfPayment={invoiceData.typeOfPayment}
                                changeTypeOfPayment={changeTypeOfPayment}
                                disabled={useAdvance}
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
                                            customStyle={styles.formItem}
                                        >
                                            {getFieldDecorator('account', {
                                                getValueFromEvent: value => {
                                                    handleAccountBalance(value);
                                                    return value;
                                                },
                                                rules: useAdvance
                                                    ? []
                                                    : [requiredRule],
                                            })(
                                                <ProSelect
                                                    data={Account}
                                                    disabled={useAdvance}
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
                                    editId={editId}
                                    operationsList={operationsList}
                                    typeOfPayment={invoiceData?.typeOfPayment}
                                    selectedAccount={getFieldValue('account')}
                                />
                            )}
                            <Row style={{ margin: '10px 0' }}>
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
                                            <TextArea
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
                            <Row style={{ marginBottom: '25px' }}>
                                {selectedInvoices?.[0]?.invoiceType === 1 &&
                                !selectedInvoices?.[0]?.isTax &&
                                selectedInvoices?.length < 2 ? (
                                    <Checkbox
                                        onChange={event =>
                                            handleCheckbox(event.target.checked)
                                        }
                                        checked={checked}
                                        style={{
                                            fontSize: '15px',
                                            color: '#00000091',
                                        }}
                                    >
                                        Xərcə bağla
                                    </Checkbox>
                                ) : null}
                            </Row>
                            {checked ? (
                                <>
                                    <ProFormItem
                                        label="Əməkdaş"
                                        help={getFieldError('employee')?.[0]}
                                    >
                                        {getFieldDecorator('employee', {
                                            getValueFromEvent: account =>
                                                account,
                                            rules: [requiredRule],
                                        })(
                                            <ProSelect
                                                data={
                                                    editId &&
                                                    operationsList &&
                                                    operationsList[0]
                                                        ?.employeeId
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
                                                keys={[
                                                    'name',
                                                    'surname',
                                                    'patronymic',
                                                ]}
                                            />
                                        )}
                                    </ProFormItem>

                                    <Row gutter={8}>
                                        {productionInvoices.length > 0 ? (
                                            <Col span={10}>
                                                <ProFormItem
                                                    label="Xərc mərkəzi növü"
                                                    help={
                                                        getFieldError(
                                                            'expenseType'
                                                        )?.[0]
                                                    }
                                                    keys={['name']}
                                                >
                                                    {getFieldDecorator(
                                                        'expenseType',
                                                        {
                                                            getValueFromEvent: expenseType => {
                                                                ContractFn(
                                                                    expenseType
                                                                );
                                                                return expenseType;
                                                            },
                                                            rules: [
                                                                requiredRule,
                                                            ],
                                                        }
                                                    )(
                                                        <ProSelect
                                                            data={[
                                                                {
                                                                    id: 2,
                                                                    name:
                                                                        'Baş ofis',
                                                                },
                                                                {
                                                                    id: 0,
                                                                    name:
                                                                        'Müqavilə',
                                                                },
                                                                {
                                                                    id: 1,
                                                                    name:
                                                                        'İstehsalat',
                                                                },
                                                            ]}
                                                            keys={['name']}
                                                        />
                                                    )}
                                                </ProFormItem>
                                            </Col>
                                        ) : null}
                                        <Col
                                            span={
                                                productionInvoices?.length > 0
                                                    ? 14
                                                    : 24
                                            }
                                        >
                                            <ProFormItem
                                                label="Xərc mərkəzi"
                                                help={
                                                    getFieldError(
                                                        'contract'
                                                    )?.[0]
                                                }
                                                keys={['name']}
                                            >
                                                {getFieldDecorator('contract', {
                                                    getValueFromEvent: category =>
                                                        category,
                                                    rules: [requiredRule],
                                                })(
                                                    <ProSelect
                                                        disabled={
                                                            (productionInvoices?.length >
                                                                0 &&
                                                                getFieldValue(
                                                                    'expenseType'
                                                                ) ===
                                                                    undefined) ||
                                                            getFieldValue(
                                                                'expenseType'
                                                            ) === 2
                                                        }
                                                        data={
                                                            getFieldValue(
                                                                'expenseType'
                                                            ) === 2
                                                                ? [
                                                                      {
                                                                          ...tenant,
                                                                          id: 0,
                                                                      },
                                                                  ]
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
                                                                : [
                                                                      ...contractsArr,
                                                                  ]
                                                        }
                                                        keys={['name']}
                                                    />
                                                )}
                                            </ProFormItem>
                                        </Col>
                                    </Row>
                                    <Divider />

                                    <Row gutter={8}>
                                        <Col span={8}>
                                            <ProFormItem
                                                label="Əməliyyatın kateqoriyası"
                                                help={
                                                    getFieldError(
                                                        `catalog`
                                                    )?.[0]
                                                }
                                            >
                                                {getFieldDecorator(`catalog`, {
                                                    getValueFromEvent: category => {
                                                        setFieldsValue({
                                                            subCatalog: undefined,
                                                        });
                                                        return category;
                                                    },
                                                    rules: [requiredRule],
                                                })(
                                                    <ProSelect
                                                        data={expenseCatalogs?.root?.filter(
                                                            ({ type }) =>
                                                                type !== 6
                                                        )}
                                                        allowClear={false}
                                                    />
                                                )}
                                            </ProFormItem>
                                        </Col>
                                        <Col span={10}>
                                            <ProFormItem
                                                customStyle={styles.expenseItem}
                                                label={
                                                    <>
                                                        <>
                                                            Əməliyyatın alt
                                                            kateqoriyası
                                                        </>
                                                        <Tooltip title="Xərc adı əlavə et">
                                                            <PlusIcon
                                                                color="#FF716A"
                                                                style={
                                                                    !getFieldValue(
                                                                        `catalog`
                                                                    )
                                                                        ? {
                                                                              marginLeft:
                                                                                  '115px',
                                                                              cursor:
                                                                                  'pointer',
                                                                              width:
                                                                                  '14px',
                                                                              height:
                                                                                  '14px',
                                                                              pointerEvents:
                                                                                  'none',
                                                                              fill:
                                                                                  '#868686',
                                                                          }
                                                                        : {
                                                                              marginLeft:
                                                                                  '115px',
                                                                              cursor:
                                                                                  'pointer',
                                                                              height:
                                                                                  '14px',
                                                                              width:
                                                                                  '14px',
                                                                          }
                                                                }
                                                                onClick={() =>
                                                                    handleAddModal(
                                                                        getFieldValue(
                                                                            `catalog`
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </>
                                                }
                                                help={
                                                    getFieldError(
                                                        `subCatalog`
                                                    )?.[0]
                                                }
                                                keys={['name']}
                                            >
                                                {getFieldDecorator(
                                                    `subCatalog`,
                                                    {
                                                        getValueFromEvent: category =>
                                                            category,
                                                        rules: [requiredRule],
                                                    }
                                                )(
                                                    <ProSelect
                                                        data={
                                                            expenseCatalogs.children
                                                                ? expenseCatalogs
                                                                      .children[
                                                                      getFieldValue(
                                                                          `catalog`
                                                                      )
                                                                  ]
                                                                : []
                                                        }
                                                        allowClear={false}
                                                        disabled={
                                                            !getFieldValue(
                                                                `catalog`
                                                            )
                                                        }
                                                    />
                                                )}
                                            </ProFormItem>
                                        </Col>
                                        <Col span={6}>
                                            <ProFormItem
                                                label="Məbləğ"
                                                help={
                                                    getFieldError('amount')?.[0]
                                                }
                                                customStyle={styles.formItem}
                                            >
                                                {getFieldDecorator('amount', {
                                                    getValueFromEvent: event =>
                                                        handlePaymentAmount(
                                                            event,
                                                            'amount'
                                                        ),
                                                    rules: [
                                                        requiredRule,
                                                        {
                                                            type: 'number',
                                                            min: 0,
                                                            message:
                                                                'Ödəniş məbləği 0 ola bilməz.',
                                                            transform: value =>
                                                                Number(value),
                                                        },
                                                    ],
                                                })(
                                                    <ProInput
                                                        disabled
                                                        suffix={currencyCode}
                                                    />
                                                )}
                                            </ProFormItem>
                                        </Col>
                                    </Row>
                                    <Divider />
                                </>
                            ) : null}

                            <div className={styles.formAction}>
                                <Button
                                    loading={paymentLoading || loader}
                                    disabled={paymentLoading || loader}
                                    type="primary"
                                    htmlType="submit"
                                    className={styles.submit}
                                >
                                    Təsdiq et
                                </Button>
                                {editId ? null : (
                                    <Button
                                        loading={paymentLoading || loader}
                                        disabled={paymentLoading || loader}
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
                                <a onClick={history.goBack}>
                                    <Button>İmtina et</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </Form>
            </Spin>
        </>
    );
}

const mapStateToProps = state => ({
    mainCurrency: state.kassaReducer.mainCurrency,
    filteredContacts: state.newContactsReducer.filteredContacts,
    currencies: state.kassaReducer.currencies,
    isLoading: state.kassaReducer.isLoading,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    cashBoxBalance: state.cashBoxBalanceReducer.cashBoxBalance,
    convertedAmount: state.convertCurrency.convertedAmount,
    creditPayments: state.paymentTableReducer.creditPayments,

    productionInvoices: state.salesAndBuysReducer.invoices,
    selectedProductionExpense: state.salesOperation.selectedProductionExpense,
    selectedProductionEmployeeExpense:
        state.salesOperation.selectedProductionEmployeeExpense,
    selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
    materialInvoices: state.salesOperation.materialList,
    productionExpensesList: state.salesOperation.productionExpensesList,

    // loadings
    invoicesLoading: state.loadings.invoiceListByContactId,
    advanceLoading: state.loadings.advancePaymentByContactId,
    convertLoading: state.loadings.convertCurrencies,
    balanceLoading: state.loadings.accountBalance,
    paymentLoading: state.loadings.createInvoicePayment,

    materialsLoading: state.loadings.fetchMaterialList,
    productionExpensesListLoading: state.loadings.fetchProductionExpensesList,
    selectedMaterialLoading: state.loadings.fetchProductionMaterialExpense,
    selectedEmployeeExpenseLoading:
        state.loadings.fetchProductionEmployeeExpense,
    selectedExpenseLoading: state.loadings.fetchProductionExpense,

    workers: state.workersReducer.workers,
    workersLoading: state.loadings.fetchWorkers,
    contracts: state.contractsReducer.contracts,
    tenant: state.tenantReducer.tenant,
    expenseCatalogs: state.expenseItems.expenseCatalogs,
    operationsList: state.financeOperationsReducer.operationsList,
    invoiceInfoLoading: state.loadings.invoicesInfo,
    creditsLoading: state.loadings.fetchCreditPayments,
    currenciesLoading: state.loadings.fetchCurrencies,
});
export default connect(
    mapStateToProps,
    {
        convertCurrency,
        fetchFilteredContacts,
        fetchCurrencies,
        fetchAllCashboxNames,
        fetchAdvancePaymentByContactId,
        fetchInvoiceListByContactId,
        fetchAccountBalance,
        fetchSalesInvoiceInfo,
        createOperationInvoice,
        fetchCreditPayments,
        fetchMainCurrency,
        fetchLastDateOfAdvanceByContactId,

        fetchTenantBalance,
        fetchWorkers,
        fetchExpenseCatalogs,
        fetchContracts,
        fetchSalesInvoiceList,
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
        editOperationInvoice,
        handleResetInvoiceFields,
    }
)(Form.create({ name: 'InvoiceForm' })(Invoice));
