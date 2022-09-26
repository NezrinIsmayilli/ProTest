/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
// import { onScan } from 'onscan.js';
import { useHistory } from 'react-router-dom';
import { cookies } from 'utils/cookies';
import { Form, Icon } from 'antd';
import { ProWarningModal } from 'components/Lib';
import {
    fetchMultipleAccountBalance,
    fetchOperationsList as fetchFinanceOperations,
} from 'store/actions/finance/operations';
import { fetchContacts, fetchSuppliers } from 'store/actions/contacts-new';
import {
    createMultipleExpensePayment,
    createImportExpensePayment,
    getImportExpensePayment,
    deleteExpensesByInvoiceId,
} from 'store/actions/finance/initialBalance';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import { fetchContracts } from 'store/actions/contracts';
import { fetchStocks } from 'store/actions/stock';
import {
    convertCurrency,
    fetchCurrencies,
    fetchMainCurrency,
    convertMultipleCurrency,
} from 'store/actions/settings/kassa';
import axios from 'axios';
import swal from '@sweetalert/with-react';
import {
    roundToDown,
    messages,
    defaultNumberFormat,
    formatNumberToLocale,
    fullDateTimeWithSecond,
    re_amount,
} from 'utils';
import {
    deleteInvoice,
    editInvoice,
    createInvoice,
    setExpenses,
    fetchPurchaseProductsByName,
    fetchPurchaseBarcodesByName,
    fetchPurchaseCatalogs,
    fetchPurchaseProductsFromCatalog,
    clearProductsByName,
    handleResetInvoiceFields,
    handleEditInvoice,
    setSelectedProducts,
    fetchSalesProductsFromCatalog,
    setInvoiceExpenseRate,
    updateInvoiceCurrencyCode,
} from 'store/actions/sales-operation';
import moment from 'moment';
import { toast } from 'react-toastify';

import { fields } from './fields';
import GeneralInformation from '../../general-fields';
import {
    Invoice,
    Quantity,
    Price,
    Trash,
    SelectFromInvoice,
    AddSerialNumbers,
    AddFromCatalog,
    SerialNumbers,
} from '../../invoice';
import { Payment } from '../../payment';
import Expenses from '../../expenses';
import Cost from '../../cost';

const math = require('exact-math');
const roundTo = require('round-to');

const ImportPurchaseOperation = props => {
    const {
        // States
        onScan,
        id,
        type = 'import-purchase',
        vat,
        form,
        invoiceType,
        profile,
        description,
        discount,
        fetchFinanceOperations,
        invoiceInfo,
        fetchMultipleAccountBalance,
        createMultipleExpensePayment,
        createImportExpensePayment,
        editInvoice,
        activePayments,
        selectedProducts,
        contractDetails,
        invoiceCurrencyCode,
        selectedExpenses,
        expenseCurrency,
        deleteExpensesByInvoiceId,
        setExpenses,

        // Actions
        handleResetInvoiceFields,
        createInvoice,
        handleEditInvoice,
        setSelectedProducts,
        setInvoiceExpenseRate,

        // Loadings
        productsListByNameLoading,

        /* DATA */
        suppliers,
        contracts,
        users,
        expenseCashboxBalance,
        invoice_expense_rate,
        stocks,
        mainCurrency,
        currencies,
        selectedImportProducts,

        // API
        fetchMainCurrency,
        updateInvoiceCurrencyCode,
        fetchStocks,
        convertCurrency,
        fetchContacts,
        fetchContracts,
        fetchCurrencies,
        fetchSuppliers,
        clearProductsByName,
        fetchPurchaseCatalogs,
        fetchPurchaseProductsByName,
        fetchPurchaseProductsFromCatalog,
        fetchSalesProductsFromCatalog,
        fetchPurchaseBarcodesByName,
        convertMultipleCurrency,
        getImportExpensePayment,
        scrolled,
        setScrolled,
        contractsLoading,
        allCashBoxNames,
        balanceLoading,
    } = props;
    const dispatch = useDispatch();
    const history = useHistory();
    const newProductNameRef = useRef(null);
    const [isDraft, setIsDraft] = useState(false);
    const { setFieldsValue, validateFields, getFieldValue } = form;
    const [loading, setLoading] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState(null);
    const [serialModalIsVisible, setSerialModalIsVisible] = useState(false);
    const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });
    const [selectedCatalog, setSelectedCatalog] = useState(undefined);
    const [productWithCatalog, setProductsWithCatalog] = useState([]);
    const [rates, setRates] = useState([]);
    const [expenseRates, setExpenseRates] = useState([]);
    const [cashbox, setCashbox] = useState([]);
    const [financeInfo, setFinanceInfo] = useState([]);
    const [mergedExpense, setMergedExpense] = useState({});
    const [isOpenWarningModal, setIsOpenWarningModal] = useState(false);
    const [errorData, setErrorData] = useState([]);
    const [invError, setInvError] = useState([]);
    const [invoiceId, setInvoiceId] = useState();

    const {
        isContractSelected,
        contractAmount,
        contractBalance,
    } = contractDetails;

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 80,
            render: (_value, _row, index) => index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            align: 'left',
            width: 120,
            ellipsis: true,
            render: value => value,
        },
        {
            title: 'Qiymət',
            dataIndex: 'invoicePrice',
            align: 'center',
            width: 150,
            render: (value, row) => (
                <Price
                    row={row}
                    value={value}
                    handlePriceChange={handlePriceChange}
                />
            ),
        },
        {
            title: 'Say',
            dataIndex: 'invoiceQuantity',
            align: 'center',
            width: 150,
            render: (value, row) => (
                <Quantity
                    setScrolled={setScrolled}
                    scrolled={scrolled}
                    row={row}
                    value={value}
                    limit={100000000}
                    handleQuantityChange={handleQuantityChange}
                    serialModalIsVisible={serialModalIsVisible}
                />
            ),
        },
        {
            title: 'Anbardakı miqdar',
            dataIndex: 'quantity',
            width: 120,
            align: 'center',
            render: (value, { unitOfMeasurementName }) =>
                Number(value || 0) > 0
                    ? `${formatNumberToLocale(
                          defaultNumberFormat(value || 0)
                      )} ${
                          unitOfMeasurementName
                              ? unitOfMeasurementName.toLowerCase()
                              : ''
                      }`
                    : `-`,
        },
        {
            title: 'SN əlavə et',
            key: 'addFromInvoice',
            width: 80,
            align: 'center',
            render: (_, row) => (
                <SelectFromInvoice
                    handleClick={() => handleModalClick(row)}
                    disabled={row.catalog.isWithoutSerialNumber}
                />
            ),
        },
        {
            title: 'Seriya nömrələri',
            dataIndex: 'serialNumbers',
            width: 80,
            align: 'center',
            render: value => <SerialNumbers serialNumbers={value || []} />,
        },
        {
            title: 'Toplam',
            dataIndex: 'total',
            width: 150,
            align: 'right',
            render: (_, row) =>
                `${handleProductPrice(row)} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Sil',
            dataIndex: 'id',
            key: 'trashIcon',
            align: 'center',
            width: 80,
            render: (value, row) =>
                Number(row.usedQuantity) === 0 ||
                row.usedQuantity === undefined ? (
                    <Trash
                        value={value}
                        selectedProducts={selectedProducts}
                        handleProductRemove={handleProductRemove}
                    />
                ) : null,
        },
    ];
    useEffect(() => {
        onScan.attachTo(document, {
            onScan(sCode, iQty) {
                if (document.activeElement) {
                    document.activeElement.blur();
                }
                fetchPurchaseBarcodesByName({
                    filters: {
                        q: sCode,
                    },
                    onSuccessCallback: ({ data }) => {
                        if (data && data.length !== 0) {
                            const hasProduct = selectedProducts?.find(
                                product => product.id === data.id
                            );
                            if (hasProduct) {
                                if (data?.catalog?.isWithoutSerialNumber) {
                                    handleQuantityChange(
                                        data.id,
                                        Number(hasProduct.invoiceQuantity) + 1
                                    );
                                }
                            } else if (data?.catalog?.isWithoutSerialNumber) {
                                dispatch(
                                    setSelectedProducts({
                                        newSelectedProducts: [
                                            ...selectedProducts,
                                            { ...data, invoiceQuantity: 1 },
                                        ],
                                    })
                                );
                            } else {
                                dispatch(
                                    setSelectedProducts({
                                        newSelectedProducts: [
                                            ...selectedProducts,
                                            { ...data },
                                        ],
                                    })
                                );
                            }
                        }
                        setBarcodeInput(null);
                    },
                });
            },
        });
        return () => {
            onScan.detachFrom(document);
        };
    }, [selectedProducts]);

    // Toggle Add Catalog Modal
    const toggleCatalogModal = () => {
        setCatalogModalIsVisible(
            prevCatalogModalIsVisible => !prevCatalogModalIsVisible
        );
    };

    // Toggle Add Serial Numbers Modal
    const toggleSerialModal = () => {
        setSerialModalIsVisible(
            prevSerialModalIsVisible => !prevSerialModalIsVisible
        );
    };

    // Add serials Modal open
    const handleModalClick = row => {
        setSelectedRow(row);
        toggleSerialModal();
    };

    // Handle product's total price
    const handleProductPrice = product => {
        const { invoiceQuantity, invoicePrice } = product;
        return formatNumberToLocale(
            defaultNumberFormat(
                math.mul(
                    Number(invoiceQuantity) || 0,
                    Number(invoicePrice) || 0
                )
            )
        );
    };

    // Fetch products by product name
    const handleProductNameChange = productName => {
        clearTimeout(newProductNameRef.current);
        if (productName.length > 2) {
            newProductNameRef.current = setTimeout(
                () =>
                    fetchPurchaseProductsByName({
                        label: 'fetchProductsListByName',
                        filters: {
                            q: productName,
                            businessUnitIds: id
                                ? invoiceInfo?.businessUnitId === null
                                    ? [0]
                                    : [invoiceInfo?.businessUnitId]
                                : cookies.get('_TKN_UNIT_')
                                ? [cookies.get('_TKN_UNIT_')]
                                : undefined,
                        },
                    }),
                600
            );
        } else {
            dispatch(clearProductsByName());
        }
    };
    // Fetch products by product barcode
    const handleChangeSearch = productBarcode => {
        setBarcodeInput(productBarcode);
    };
    const handleProductBarcodeChange = productBarcode => {
        setBarcodeInput(productBarcode);
        fetchPurchaseBarcodesByName({
            filters: {
                q: productBarcode,
            },
            onSuccessCallback: ({ data }) => {
                if (data && data.length !== 0) {
                    const hasProduct = selectedProducts?.find(
                        product => product.id === data.id
                    );
                    if (hasProduct) {
                        if (data?.catalog?.isWithoutSerialNumber) {
                            handleQuantityChange(
                                data.id,
                                Number(hasProduct.invoiceQuantity) + 1
                            );
                        }
                    } else if (data?.catalog?.isWithoutSerialNumber) {
                        dispatch(
                            setSelectedProducts({
                                newSelectedProducts: [
                                    ...selectedProducts,
                                    { ...data, invoiceQuantity: 1 },
                                ],
                            })
                        );
                    } else {
                        dispatch(
                            setSelectedProducts({
                                newSelectedProducts: [
                                    ...selectedProducts,
                                    { ...data },
                                ],
                            })
                        );
                    }
                }
                setBarcodeInput(null);
            },
        });
    };
    const handleQuantityChange = (
        productId,
        newQuantity,
        limit = 100000000
    ) => {
        if (
            (re_amount.test(Number(newQuantity)) && newQuantity <= limit) ||
            newQuantity === ''
        ) {
            const newSelectedProducts = selectedProducts.map(
                selectedProduct => {
                    if (selectedProduct.id === productId) {
                        return {
                            ...selectedProduct,
                            invoiceQuantity: newQuantity,
                        };
                    }
                    return selectedProduct;
                }
            );

            const invoice_amount = newSelectedProducts.reduce(
                (totalPrice, { invoiceQuantity, invoicePrice }) =>
                    math.add(
                        totalPrice,
                        math.mul(
                            Number(invoiceQuantity) || 0,
                            Number(invoicePrice) || 0
                        )
                    ),
                0
            );

            const total_expense_amount = selectedExpenses?.reduce(
                (total_amount, { expense_amount }) =>
                    math.add(
                        total_amount,
                        math.mul(
                            Number(expense_amount) || 0,
                            Number(invoice_expense_rate)
                        )
                    ),
                0
            );

            const total_expenses_amount = selectedImportProducts?.reduce(
                (total, { usedPrice, currencyId }) =>
                    math.add(
                        total,
                        Number(
                            math.mul(
                                Number(
                                    rates[
                                        [
                                            ...new Set(
                                                selectedImportProducts.map(
                                                    ({ currencyId }) =>
                                                        Number(currencyId)
                                                )
                                            ),
                                        ].indexOf(currencyId)
                                    ]?.rate || 1
                                ),
                                Number(usedPrice || 0)
                            )
                        ) || 0
                    ),
                0
            );

            const expense_amount_in_percentage = math.div(
                math.mul(
                    math.add(
                        Number(total_expense_amount),
                        Number(total_expenses_amount)
                    ),
                    100
                ),
                Number(invoice_amount) || 1
            );

            const selectedProductsWithCost = newSelectedProducts.map(
                selectedProduct => {
                    const expense_amount = math.div(
                        math.mul(
                            Number(selectedProduct.invoicePrice) || 0,
                            Number(expense_amount_in_percentage) || 0
                        ),
                        100
                    );

                    return {
                        ...selectedProduct,
                        expense_amount_in_percentage: roundToDown(
                            expense_amount_in_percentage
                        ),
                        expense_amount: roundToDown(expense_amount),
                        cost: roundToDown(
                            math.add(
                                Number(expense_amount) || 0,
                                Number(selectedProduct.invoicePrice) || 0
                            )
                        ),
                    };
                }
            );

            setSelectedProducts({
                newSelectedProducts: selectedProductsWithCost,
            });
        }
    };
    const handlePriceChange = (productId, newPrice, limit = 100000000) => {
        if (
            (re_amount.test(Number(newPrice)) && newPrice <= limit) ||
            newPrice === ''
        ) {
            const newSelectedProducts = selectedProducts.map(
                selectedProduct => {
                    if (selectedProduct.id === productId) {
                        return {
                            ...selectedProduct,
                            invoicePrice: newPrice,
                        };
                    }
                    return selectedProduct;
                }
            );

            const invoice_amount = newSelectedProducts.reduce(
                (totalPrice, { invoiceQuantity, invoicePrice }) =>
                    math.add(
                        totalPrice,
                        math.mul(
                            Number(invoiceQuantity) || 0,
                            Number(invoicePrice) || 0
                        )
                    ),
                0
            );

            const total_expense_amount = selectedExpenses?.reduce(
                (total_amount, { expense_amount }) =>
                    math.add(
                        total_amount,
                        math.mul(
                            Number(expense_amount) || 0,
                            Number(invoice_expense_rate)
                        )
                    ),
                0
            );

            const total_expenses_amount = selectedImportProducts?.reduce(
                (total, { usedPrice, currencyId }) =>
                    math.add(
                        total,
                        Number(
                            math.mul(
                                Number(
                                    rates[
                                        [
                                            ...new Set(
                                                selectedImportProducts.map(
                                                    ({ currencyId }) =>
                                                        Number(currencyId)
                                                )
                                            ),
                                        ].indexOf(currencyId)
                                    ]?.rate || 1
                                ),
                                Number(usedPrice || 0)
                            )
                        ) || 0
                    ),
                0
            );

            const expense_amount_in_percentage = math.div(
                math.mul(
                    math.add(
                        Number(total_expense_amount),
                        Number(total_expenses_amount)
                    ),
                    100
                ),
                Number(invoice_amount) || 1
            );

            const selectedProductsWithCost = newSelectedProducts.map(
                selectedProduct => {
                    const expense_amount = math.div(
                        math.mul(
                            Number(selectedProduct.invoicePrice) || 0,
                            Number(expense_amount_in_percentage) || 0
                        ),
                        100
                    );

                    return {
                        ...selectedProduct,
                        expense_amount_in_percentage: roundToDown(
                            expense_amount_in_percentage
                        ),
                        expense_amount: roundToDown(expense_amount),
                        cost: roundToDown(
                            math.add(
                                Number(expense_amount) || 0,
                                Number(selectedProduct.invoicePrice) || 0
                            )
                        ),
                    };
                }
            );

            setSelectedProducts({
                newSelectedProducts: selectedProductsWithCost,
            });
        }
    };

    // Fetch product catalogs by invoice type
    const fetchCatalogs = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const type = 'purchase';
        const defaultFilters = { limit, page, name: search };
        fetchPurchaseCatalogs({
            filters: defaultFilters,
            type,
            label: 'fetchCatalogsByInvoiceType',
            onSuccessCallback: data => {
                let appendList = {};
                if (data.data) {
                    appendList = data.data;
                }
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!Object.keys(appendList).length);
                }
                if (stateReset) {
                    setCatalogs(appendList);
                } else {
                    setCatalogs({
                        ...appendList,
                        root: catalogs.root.concat(appendList.root),
                    });
                }
            },
        });
    };

    const fetchProductFromCatalogs = (
        catalogId,
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchPurchaseProductsFromCatalog({
            label: 'fetchProductsFromCatalog',
            catalogId: catalogId || selectedCatalog,
            filters: {
                businessUnitIds: id
                    ? invoiceInfo?.businessUnitId === null
                        ? [0]
                        : [invoiceInfo?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
                ...defaultFilters,
            },
            onSuccessCallback: data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            quantityLabel:
                                Number(element.quantity || 0) > 0
                                    ? ` (${formatNumberToLocale(
                                          defaultNumberFormat(element.quantity)
                                      )} ${
                                          element.unitOfMeasurementName
                                              ? element.unitOfMeasurementName.toLowerCase()
                                              : ''
                                      })`
                                    : '',
                            ...element,
                        });
                    });
                }
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!appendList.length);
                }
                if (stateReset) {
                    setProductsWithCatalog(appendList);
                } else {
                    setProductsWithCatalog(
                        productWithCatalog.concat(appendList)
                    );
                }
            },
        });
    };

    // Fetch purchase products by catalog id
    const fetchProductsFromCatalog = catalogId => {
        fetchPurchaseProductsFromCatalog({
            label: 'fetchProductsFromCatalog',
            catalogId,
            filters: {
                businessUnitIds: id
                    ? invoiceInfo?.businessUnitId === null
                        ? [0]
                        : [invoiceInfo?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
            },
        });
    };
    const handleProductRemove = productId => {
        const newSelectedProducts = selectedProducts.filter(
            selectedProduct => selectedProduct.id !== productId
        );
        const invoice_amount = newSelectedProducts.reduce(
            (totalPrice, { invoiceQuantity, invoicePrice }) =>
                math.add(
                    totalPrice,
                    math.mul(
                        Number(invoiceQuantity) || 0,
                        Number(invoicePrice) || 0
                    )
                ),
            0
        );
        const total_expense_amount = selectedExpenses?.reduce(
            (total_amount, { expense_amount }) =>
                math.add(
                    total_amount,
                    math.mul(
                        Number(expense_amount) || 0,
                        Number(invoice_expense_rate)
                    )
                ),
            0
        );

        const total_expenses_amount = selectedImportProducts?.reduce(
            (total, { usedPrice, currencyId }) =>
                math.add(
                    total,
                    Number(
                        math.mul(
                            Number(
                                rates[
                                    [
                                        ...new Set(
                                            selectedImportProducts.map(
                                                ({ currencyId }) =>
                                                    Number(currencyId)
                                            )
                                        ),
                                    ].indexOf(currencyId)
                                ]?.rate || 1
                            ),
                            Number(usedPrice || 0)
                        )
                    ) || 0
                ),
            0
        );

        const expense_amount_in_percentage = math.div(
            math.mul(
                math.add(
                    Number(total_expense_amount),
                    Number(total_expenses_amount)
                ),
                100
            ),
            Number(invoice_amount) || 1
        );

        const selectedProductsWithCost = newSelectedProducts.map(
            selectedProduct => {
                const expense_amount = math.div(
                    math.mul(
                        Number(selectedProduct.invoicePrice) || 0,
                        Number(expense_amount_in_percentage) || 0
                    ),
                    100
                );
                return {
                    ...selectedProduct,
                    expense_amount_in_percentage,
                    expense_amount: roundToDown(expense_amount),
                    cost: roundToDown(
                        math.add(
                            Number(expense_amount) || 0,
                            Number(selectedProduct.invoicePrice) || 0
                        )
                    ),
                };
            }
        );

        setSelectedProducts({ newSelectedProducts: selectedProductsWithCost });
    };

    const validateExpensePayments = () => {
        let expenseErr = true;
        Object.keys(mergedExpense).map(key =>
            Object.keys(mergedExpense[Number(key)])
                .filter(exKey => Number(exKey))
                .map(item => {
                    if (mergedExpense[Number(key)][item]) {
                        if (
                            !cashbox[Number(key)]
                                ?.map(
                                    ({ tenantCurrencyId }) => tenantCurrencyId
                                )
                                ?.includes(Number(item))
                        ) {
                            expenseErr = false;
                            toast.error(
                                `Qaimə yaradılmadı! ${
                                    allCashBoxNames.find(
                                        item => item.id === Number(key)
                                    )?.name
                                } hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${Number(
                                    mergedExpense[Number(key)][
                                        `default_${item}`
                                    ] || 0
                                )}  ${
                                    currencies.find(
                                        curr => Number(item) === curr.id
                                    )?.code
                                } çox ola bilməz.`,
                                { autoClose: 8000 }
                            );
                        } else {
                            cashbox[Number(key)].map(cashItem => {
                                if (
                                    cashItem.tenantCurrencyId ===
                                        Number(item) &&
                                    Number(mergedExpense[Number(key)][item]) >
                                        Number(cashItem.balance) +
                                            Number(
                                                mergedExpense[Number(key)][
                                                    `default_${item}`
                                                ] || 0
                                            )
                                ) {
                                    expenseErr = false;
                                    toast.error(
                                        `Qaimə yaradılmadı! ${
                                            allCashBoxNames.find(
                                                item => item.id === Number(key)
                                            )?.name
                                        } hesabında kifayət qədər vəsait yoxdur. Ödəniləcək məbləğ ${math.add(
                                            Number(cashItem.balance || 0),
                                            Number(
                                                mergedExpense[Number(key)][
                                                    `default_${item}`
                                                ] || 0
                                            )
                                        )} ${
                                            currencies.find(
                                                curr => Number(item) === curr.id
                                            )?.code
                                        } çox ola bilməz.`,
                                        { autoClose: 8000 }
                                    );
                                }
                            });
                        }
                    } else {
                        expenseErr = false;
                        toast.error(
                            'Məbləği qeyd olunmayan hesab üzrə ödəniş mövcuddur'
                        );
                    }
                })
        );
        if (expenseErr === false) {
            return false;
        }

        return true;
    };

    const onFailure = (error, invId) => {
        const errData = error?.error?.response?.data?.error;
        // toast.error(errData?.message);
        onCreateCallBackPayment(invId, [], errData);
    };

    const handleExpensePayment = (values, invoiceId) => {
        const { date, employee } = values;
        setLoading(true);
        if (selectedExpenses?.length > 0) {
            if (id) {
                const editData = selectedExpenses
                    ?.filter(({ editId }, index) => editId)
                    .map((item, indexArr) => ({
                        employee: employee || null,
                        dateOfTransaction: date?.format(fullDateTimeWithSecond),
                        description: description || null,
                        useEmployeeBalance: false,
                        type: -1,
                        typeOfPayment: item.expense_cashbox_type || null,
                        cashbox: item.expense_cashbox || null,
                        expenses_ul: selectedExpenses
                            .filter(
                                ({ editId }, index) =>
                                    editId && index === indexArr
                            )
                            .map(
                                ({
                                    parentId,
                                    id,
                                    expense_amount,
                                    expense_currency,
                                    expense_cashbox,
                                    expense_cashbox_type,
                                }) => ({
                                    transactionCatalog: parentId,
                                    transactionItem: id || null,
                                    amount: Number(expense_amount),
                                    currency: expense_currency,
                                })
                            ),
                        invoice: invoiceId,
                    }));
                const data = {
                    employee: employee || null,
                    dateOfTransaction: date?.format(fullDateTimeWithSecond),
                    description: description || null,
                    expenses_ul: selectedExpenses
                        .filter(({ editId }) => !editId)
                        .map(
                            ({
                                parentId,
                                id,
                                expense_amount,
                                expense_currency,
                                expense_cashbox,
                                expense_cashbox_type,
                            }) => ({
                                transactionCatalog: parentId,
                                transactionItem: id || null,
                                amount: Number(expense_amount),
                                currency: expense_currency,
                                cashbox: expense_cashbox || null,
                                type: -1,
                                typeOfPayment: expense_cashbox_type || null,
                            })
                        ),
                    invoice: invoiceId,
                };

                if (
                    Object.values(data).length > 0 &&
                    selectedExpenses?.filter(({ editId }) => !editId).length > 0
                ) {
                    createMultipleExpensePayment(
                        data,
                        () => {
                            onCreateCallBackPayment(invoiceId, editData);
                        },
                        error => onFailure(error, invoiceId)
                    );
                } else if (editData.length > 0) {
                    editExpense(editData);
                    deleteExpensesByInvoiceId({
                        id: invoiceId,
                        onSuccessCallback: () => {
                            const data = {
                                expenses_ul: selectedImportProducts.map(
                                    ({
                                        name,
                                        dateForSend,
                                        endPrice,
                                        currencyId,
                                        expenseInvoiceId,
                                        operationDate,
                                        usedPrice,
                                    }) => ({
                                        date: dateForSend || operationDate,
                                        name: name || 'test',
                                        price: expenseInvoiceId
                                            ? Number(usedPrice)
                                            : Number(endPrice),
                                        tenantCurrency: currencyId,
                                        expenseInvoice: expenseInvoiceId,
                                    })
                                ),
                                invoice: invoiceId,
                            };
                            createImportExpensePayment(
                                data,
                                ({ data }) => {
                                    if (
                                        data?.expenseInvoicesWhichAreNotFound
                                            .length > 0
                                    ) {
                                        setInvError(
                                            data?.expenseInvoicesWhichAreNotFound
                                        );
                                        setIsOpenWarningModal(true);
                                    } else if (editData.length === 0) {
                                        onCreateCallBack();
                                    }
                                },
                                ({ error }) => {
                                    console.log(error, 'errEdit');
                                }
                            );
                        },
                    });
                }
            } else {
                const data = {
                    employee: employee || null,
                    dateOfTransaction: date?.format(fullDateTimeWithSecond),
                    description: description || null,
                    expenses_ul: selectedExpenses
                        .filter(({ editId }) => !editId)
                        .map(
                            ({
                                parentId,
                                id,
                                expense_amount,
                                expense_currency,
                                expense_cashbox,
                                expense_cashbox_type,
                            }) => ({
                                transactionCatalog: parentId,
                                transactionItem: id || null,
                                amount: Number(expense_amount),
                                currency: expense_currency,
                                cashbox: expense_cashbox || null,
                                typeOfPayment: expense_cashbox_type || null,
                                type: -1,
                            })
                        ),
                    invoice: invoiceId,
                };
                createMultipleExpensePayment(
                    data,
                    () => {
                        onCreateCallBackPayment(invoiceId);
                    },
                    error => onFailure(error, invoiceId)
                );
            }
        } else if (
            selectedExpenses?.filter(({ editId }) => !editId).length === 0
        ) {
            deleteExpensesByInvoiceId({
                id: invoiceId,
                onSuccessCallback: () => {
                    const data = {
                        expenses_ul: selectedImportProducts.map(
                            ({
                                name,
                                dateForSend,
                                endPrice,
                                currencyId,
                                expenseInvoiceId,
                                operationDate,
                                usedPrice,
                            }) => ({
                                date: dateForSend || operationDate,
                                name: name || 'test',
                                price: expenseInvoiceId
                                    ? Number(usedPrice)
                                    : Number(endPrice),
                                tenantCurrency: currencyId,
                                expenseInvoice: expenseInvoiceId,
                            })
                        ),
                        invoice: invoiceId,
                    };
                    createImportExpensePayment(
                        data,
                        ({ data }) => {
                            if (
                                data?.expenseInvoicesWhichAreNotFound?.length >
                                0
                            ) {
                                setInvError(
                                    data?.expenseInvoicesWhichAreNotFound
                                );
                                setIsOpenWarningModal(true);
                            } else {
                                onCreateCallBack();
                            }
                        },
                        ({ error }) => {
                            console.log(error, 'error');
                        }
                    );
                },
            });
        }
    };

    const onCreateCallBackPayment = (invoiceId, editData = [], errData) => {
        deleteExpensesByInvoiceId({
            id: invoiceId,
            onSuccessCallback: () => {
                const data = {
                    expenses_ul: selectedImportProducts.map(
                        ({
                            name,
                            dateForSend,
                            endPrice,
                            currencyId,
                            expenseInvoiceId,
                            operationDate,
                            usedPrice,
                        }) => ({
                            date: dateForSend || operationDate,
                            name: name || 'test',
                            price: expenseInvoiceId
                                ? Number(usedPrice)
                                : Number(endPrice),
                            tenantCurrency: currencyId,
                            expenseInvoice: expenseInvoiceId,
                        })
                    ),
                    invoice: invoiceId,
                };
                createImportExpensePayment(
                    data,
                    ({ data }) => {
                        if (editData.length === 0) {
                            if (
                                Object.keys(errData || {}).length === 0 &&
                                data?.expenseInvoicesWhichAreNotFound.length ===
                                    0
                            ) {
                                onCreateCallBack();
                            } else {
                                setErrorData(errData?.errorData);
                                setInvError(
                                    data?.expenseInvoicesWhichAreNotFound
                                );
                                setIsOpenWarningModal(true);
                            }
                        }
                    },
                    ({ error }) => {
                        if (editData.length === 0) {
                            setErrorData(errData?.errorData);
                            setIsOpenWarningModal(true);
                        }
                    }
                );
            },
        });
        if (editData.length > 0) {
            editExpense(editData);
        }
    };

    async function editExpense(data) {
        const errors = [];
        const newExpenses = [];
        for (let i = 0; i < data.length; i++) {
            const arr = await callImport(
                data[i],
                selectedExpenses?.filter(({ editId }) => editId)[i]?.editId
            );
            if (arr.row) {
                newExpenses.push(arr.row);
            }
            if (arr.err) {
                errors.push(arr.err);
            }
        }

        setExpenses({ newExpenses });
        if (errors.length > 0) {
            setErrorData(errors);
            setIsOpenWarningModal(true);
        } else {
            onCreateCallBack();
        }
    }

    async function callImport(value, editId) {
        try {
            const { data } = await axios.put(
                `/transactions/multiple-payment/${editId}`,
                value
            );
            const row = {
                ...selectedExpenses.find(
                    selectedExpenseItem => selectedExpenseItem.editId === editId
                ),
                editId: data?.data?.id,
            };
            const err = false;
            return { err, row };
        } catch (error) {
            const err = error?.response?.data?.error?.errorData;
            const row = selectedExpenses.find(
                selectedExpenseItem => selectedExpenseItem.editId === editId
            );
            return { err, row };
        }
    }

    useEffect(() => {
        if (
            selectedImportProducts?.length > 0 &&
            getFieldValue('date') &&
            getFieldValue('currency')
        ) {
            convertMultipleCurrency({
                filters: {
                    fromCurrencyId: [
                        ...new Set(
                            selectedImportProducts.map(({ currencyId }) =>
                                Number(currencyId)
                            )
                        ),
                    ],
                    toCurrencyId: getFieldValue('currency'),
                    amount: 1,
                    dateTime: getFieldValue('date')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                onSuccessCallback: ({ data }) => {
                    setRates(data);
                },
            });
        }
    }, [
        selectedImportProducts,
        getFieldValue('date'),
        getFieldValue('currency'),
    ]);

    useEffect(() => {
        if (
            selectedExpenses?.filter(
                ({ expense_currency }) => expense_currency !== undefined
            )?.length > 0 &&
            getFieldValue('date') &&
            getFieldValue('currency')
        ) {
            convertMultipleCurrency({
                filters: {
                    fromCurrencyId: [
                        ...new Set(
                            selectedExpenses
                                ?.filter(
                                    ({ expense_currency }) =>
                                        expense_currency !== undefined
                                )
                                .map(({ expense_currency }) => expense_currency)
                        ),
                    ],
                    toCurrencyId: getFieldValue('currency'),
                    amount: 1,
                    dateTime: getFieldValue('date')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                onSuccessCallback: ({ data }) => {
                    setExpenseRates(data);
                },
            });
        }
    }, [selectedExpenses, getFieldValue('date'), getFieldValue('currency')]);

    useEffect(() => {
        if (
            selectedExpenses?.filter(
                ({ expense_cashbox }) => expense_cashbox !== undefined
            )?.length > 0
        ) {
            fetchMultipleAccountBalance({
                filters: {
                    cashboxIds: [
                        ...new Set(
                            selectedExpenses
                                .filter(
                                    ({ expense_cashbox }) =>
                                        expense_cashbox !== undefined
                                )
                                .map(({ expense_cashbox }) => expense_cashbox)
                        ),
                    ],
                    dateTime: getFieldValue('date')?.format(
                        fullDateTimeWithSecond
                    ),
                    limit: 1000,
                },
                onSuccessCallback: ({ data }) => {
                    Object.keys(data).map(key => {
                        if (
                            !data[key]
                                ?.map(dat => dat.tenantCurrencyId)
                                ?.includes(
                                    selectedExpenses?.find(
                                        item =>
                                            item.default_expense_cashbox ===
                                            Number(key)
                                    )?.default_expense_currency
                                )
                        ) {
                            data[key].push({
                                balance: 0,
                                currencyCode: selectedExpenses?.find(
                                    item =>
                                        item.default_expense_cashbox ===
                                        Number(key)
                                )?.default_expense_currency_code,
                                tenantCurrencyId: selectedExpenses?.find(
                                    item =>
                                        item.default_expense_cashbox ===
                                        Number(key)
                                )?.default_expense_currency,
                            });
                        }
                    });
                    setCashbox(data);
                },
            });
        }
    }, [selectedExpenses, getFieldValue('date'), getFieldValue('currency')]);

    useEffect(() => {
        if (
            selectedExpenses?.filter(
                ({ expense_cashbox }) => expense_cashbox !== undefined
            )?.length > 0
        ) {
            let tmp = {};
            selectedExpenses.forEach(value => {
                if (value.expense_cashbox && tmp[value.expense_cashbox]) {
                    tmp = {
                        ...tmp,
                        [value.expense_cashbox]: {
                            ...tmp[value.expense_cashbox],
                            [value.expense_currency]: tmp[
                                value.expense_cashbox
                            ][value.expense_currency]
                                ? tmp[value.expense_cashbox][
                                      value.expense_currency
                                  ] + Number(value.expense_amount || 0)
                                : Number(value.expense_amount || 0),

                            [`default_${value.expense_currency}`]: tmp[
                                value.expense_cashbox
                            ][value.default_expense_currency]
                                ? tmp[value.expense_cashbox][
                                      value.expense_currency
                                  ] +
                                  Number(value.default_expense_currency || 0)
                                : Number(value.default_expense_amount || 0),
                        },
                    };
                } else if (value.expense_cashbox) {
                    tmp[value.expense_cashbox] = {
                        ...value.expense_cashbox,
                        expense_amount: value.expense_amount,
                        expense_currency: value.expense_currency,
                        [`default_${value.expense_currency}`]: value.default_expense_amount,
                        [value.expense_currency]: value.expense_amount,
                    };
                }
            });
            setMergedExpense(tmp);
        }
    }, [selectedExpenses]);

    const onCreateCallBack = () => {
        toast.success('Əməliyyat uğurla tamamlandı.', {
            className: 'success-toast',
        });
        history.push('/sales/operations');
    };

    // Create purchase invoice
    const handleCreateInvoice = values => {
        const {
            date,
            currency,
            supplier,
            salesman,
            contract,
            agent,
            stockTo,
            expense_counterparty,
            taxCurrency,
        } = values;

        const newPurchaseInvoice = {
            salesman,
            currency,
            supplier,
            stock: stockTo,
            taxCurrency: taxCurrency || null,
            counterparty: expense_counterparty || null,
            agent: agent || null,
            description: description || null,
            operationDate: date?.format(fullDateTimeWithSecond),
            operator: profile.id,
            supplierInvoiceNumber: '',
            contract: contract || null,
            discount: Number(discount.percentage) || null,
            tax: Number(vat.amount) || null,
            invoiceProducts_ul: handleSelectedProducts(selectedProducts, false),
        };

        if (id) {
            editInvoice({
                data: newPurchaseInvoice,
                type: 'purchase',
                id: Number(id),
                onSuccessCallback: () => {
                    handleExpensePayment(values, Number(id || invoiceId));
                },
                onFailureCallback: ({ error }) => {
                    const errorData = error?.response?.data?.error;

                    if (errorData?.errors?.key === 'wrong_end_price') {
                        return toast.error(
                            `Son qiymət ${roundToDown(
                                errorData?.errors?.paidAmount
                            )} ${invoiceCurrencyCode} məbləğindən az ola bilməz.`,
                            { autoClose: 8000 }
                        );
                    }
                    if (errorData?.message === 'Wrong tax amount') {
                        return toast.error(
                            `ƏDV ${Number(
                                invoiceInfo.paidTaxAmount || 0
                            )} ${invoiceCurrencyCode} məbləğindən az ola bilməz.`,
                            { autoClose: 8000 }
                        );
                    }
                    if (errorData?.errors?.key === 'out_of_stock') {
                        let errorArr = {};
                        errorData.errors.data.forEach(
                        ({
                            productId,
                            productName,
                            serialNumber,
                        }) => {
                            if (errorArr[productId]) {
                            errorArr[productId] = {
                                ...errorArr[productId],
                                serialNumbers: serialNumber
                                ? [
                                    ...errorArr[productId].serialNumbers,
                                    serialNumber,
                                    ]
                                : undefined,
                            };
                            } else {
                            errorArr[productId] = {
                                productId,
                                productName,
                                serialNumbers: serialNumber ? [serialNumber] : undefined,
                            };
                            }
                        }
                        );
                        return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockTo)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                        )}</div></div>,
                        { autoClose: 8000 }
                        );
                    }
                },
            });
        } else {
            createInvoice({
                data: newPurchaseInvoice,
                type: 'purchase',
                onSuccessCallback: ({ data }) => {
                    setInvoiceId(data.id);
                    handleExpensePayment(values, data.id);
                },
                onFailureCallback: ({ error }) => {
                    const errorData = error?.response?.data?.error;

                    if (errorData?.errors?.key === 'out_of_stock') {
                        let errorArr = {};
                    errorData.errors.data.forEach(
                      ({
                        productId,
                        productName,
                        serialNumber,
                      }) => {
                        if (errorArr[productId]) {
                          errorArr[productId] = {
                            ...errorArr[productId],
                            serialNumbers: serialNumber
                              ? [
                                  ...errorArr[productId].serialNumbers,
                                  serialNumber,
                                ]
                              : undefined,
                          };
                        } else {
                          errorArr[productId] = {
                            productId,
                            productName,
                            serialNumbers: serialNumber ? [serialNumber] : undefined,
                          };
                        }
                      }
                    );
                    return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockTo)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                    )}</div></div>,
                    { autoClose: 8000 }
                    );
                    }

                    return toast.error(errorData?.message);
                },
                showError: false,
            });
        }
    };

    // Handle draft invoice
    const createDraftInvoice = values => {
        const {
            date,
            agent,
            currency,
            supplier,
            taxCurrency,
            salesman,
            contract,
            stockTo,
        } = values;

        const newDraftPurchaseInvoice = {
            agent,
            salesman,
            currency,
            supplier,
            draftType: 1,
            stock: stockTo,
            description: description || null,
            taxCurrency: taxCurrency || null,
            operationDate: date?.format(fullDateTimeWithSecond),
            operator: profile.id,
            supplierInvoiceNumber: '',
            contract: contract || null,
            discount: Number(discount.percentage) || null,
            tax: Number(vat.amount) || null,
            invoiceProducts_ul: handleSelectedProducts(selectedProducts, true),
        };

        if (id) {
            editInvoice({
                data: newDraftPurchaseInvoice,
                type: 'draft',
                id: Number(id),
                onSuccessCallback: () => {
                    toast.success(messages.successText);
                    history.goBack();
                },
            });
        } else {
            createInvoice({
                data: newDraftPurchaseInvoice,
                type: 'draft',
                onSuccessCallback: ({ data }) => {
                    toast.success(messages.successText);
                    history.push(`/sales/operations`);
                },
            });
        }
    };
    // Manipulate selected products to api required form.
    const handleSelectedProducts = (selectedProducts, isDraft) => {
        if (isDraft) {
            return selectedProducts.map(
                ({
                    invoicePrice,
                    id,
                    invoiceQuantity,
                    cost,
                    serialNumbers,
                }) => ({
                    product: id,
                    price: Number(invoicePrice),
                    quantity: Number(invoiceQuantity),
                    cost: Number(cost),
                    serialNumber_ul: serialNumbers || [],
                    invoiceProductsExtended_ul: [],
                    discountAmount: null,
                })
            );
        }
        return selectedProducts.map(
            ({ invoicePrice, id, invoiceQuantity, cost, serialNumbers }) => ({
                product: id,
                price: Number(invoicePrice),
                cost: Number(cost),
                quantity: Number(invoiceQuantity),
                serialNumber_ul: serialNumbers || [],
                discountAmount: null,
            })
        );
    };

    // Form Submit (Finally trying to create invoice)
    const handlePurchaseInvoice = () => {
        validateFields((errors, values) => {
            if (!errors) {
                const { isValid, errorMessage } = validateSelectedProducts(
                    selectedProducts
                );
                const paymentsAreValid = validateExpensePayments();

                if (!isValid || !paymentsAreValid) {
                    if (errorMessage) {
                        return toast.error(errorMessage);
                    }
                } else {
                    handleCreateInvoice(values);
                }
            }
        });
        if (id) {
            cookies.set(
                '_TKN_UNIT_',
                invoiceInfo?.businessUnitId === null
                    ? 0
                    : invoiceInfo?.businessUnitId
            );
        }
    };

    const handlePurchaseDraftInvoice = () => {
        validateFields((errors, values) => {
            if (!errors) {
                const { isValid, errorMessage } = validateSelectedProducts(
                    selectedProducts
                );

                if (!isValid) {
                    return toast.error(errorMessage);
                }
                createDraftInvoice(values);
            }
        });
    };

    const validateSelectedProducts = selectedProducts => {
        let errorMessage = '';
        let isValid = true;

        const endPrice = selectedProducts.reduce(
            (totalPrice, { invoiceQuantity, invoicePrice }) =>
                math.add(
                    totalPrice,
                    math.mul(
                        Number(invoiceQuantity) || 0,
                        Number(invoicePrice) || 0
                    )
                ),
            0
        );

        // Is product is exists in invoice
        if (selectedProducts.length === 0) {
            errorMessage = 'Qaimədə məhsul mövcud deyil';
            isValid = false;
        }
        // Has price or quantity missed product
        else if (
            selectedProducts.some(
                ({ invoicePrice, invoiceQuantity }) =>
                    Number(invoicePrice || 0) === 0 ||
                    Number(invoiceQuantity || 0) === 0
            )
        ) {
            errorMessage =
                'Qaimədə say və ya qiyməti qeyd edilməyən məhsul mövcuddur.';
            isValid = false;
        } else if (
            isContractSelected &&
            contractAmount !== 0 &&
            math.sub(Number(endPrice), Number(contractBalance)) > 0
        ) {
            errorMessage = 'Müqavilə limiti aşıla bilməz.';
            isValid = false;
        }
        return {
            isValid,
            errorMessage,
        };
    };

    const updateEditInvoice = (
        selectedContract,
        _,
        financeOperations,
        otherExpenses
    ) => {
        const {
            supplierId,
            salesmanId,
            operationDate,
            currencyId,
            description,
            contractId,
            agentId,
            stockToId,
            stockFromId,
            invoiceProducts,
            currencyCode,
            discount,
            discountAmount,
            taxAmount,
            taxCurrencyCode,
            taxCurrencyId,
            counterpartyId,
            counterpartyName,
            counterpartySurname,
        } = invoiceInfo;
        const { content } = invoiceProducts;
        const selectedProducts = {};
        const selectedProductIds = content.map(({ productId }) => productId);

        const selectedExpenses = financeOperations?.map(
            ({
                transactionItemName,
                transactionItemId,
                transactionCatalogId,
                amount,
                currencyId,
                paymentTypeId,
                cashboxId,
                cashboxTransactionId,
                currencyCode,
            }) => ({
                expense_name: transactionItemName,
                id: transactionItemId,
                expense_amount: roundToDown(amount),
                default_expense_amount: roundToDown(amount),
                default_expense_currency: currencyId,
                default_expense_cashbox: cashboxId,
                expense_currency: currencyId,
                default_expense_currency_code: currencyCode,
                expense_cashbox_type: paymentTypeId,
                expense_cashbox: cashboxId,
                parentId: transactionCatalogId,
                editId: cashboxTransactionId,
            })
        );

        const otherExpense = otherExpenses.map(
            ({
                id,
                price,
                currencyId,
                date,
                currencyCode,
                expenseInvoiceId,
                expenseInvoiceContact,
                expenseInvoiceAmount,
                name,
                expenseInvoicePaymentStatus,
                expenseInvoiceNumber,
            }) => ({
                operationDate: date,
                counterparty: expenseInvoiceContact,
                currencyCode,
                currencyId,
                expenseInvoiceId,
                usedPrice: defaultNumberFormat(price),
                statusOfOperation: expenseInvoicePaymentStatus,
                invoiceNumber: expenseInvoiceNumber,
                id,
                name,
                endPrice: expenseInvoiceNumber
                    ? roundToDown(expenseInvoiceAmount)
                    : roundToDown(price),
                editId: true,
            })
        );

        fetchSalesProductsFromCatalog({
            label: 'fetchEditProductsFromCatalog',
            setState: false,
            stockId: stockToId || stockFromId,
            datetime: operationDate,
            filters: {
                invoiceId: id,
                product: selectedProductIds,
                datetime: operationDate,
                businessUnitIds: id
                    ? invoiceInfo?.businessUnitId === null
                        ? [0]
                        : [invoiceInfo?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
            },
            onSuccessCallback: ({ data: totalQuantities }) => {
                content.forEach(
                    ({
                        productId,
                        productName,
                        quantity,
                        pricePerUnit,
                        isServiceType,
                        cost,
                        unitOfMeasurementName,
                        catalogId,
                        catalogName,
                        serialNumber,
                        usedQuantity,
                    }) => {
                        if (selectedProducts[productId]) {
                            selectedProducts[productId] = {
                                ...selectedProducts[productId],
                                serialNumbers: serialNumber
                                    ? [
                                          ...selectedProducts[productId]
                                              .serialNumbers,
                                          serialNumber,
                                      ]
                                    : undefined,
                                invoiceQuantity: math.add(
                                    roundToDown(quantity),
                                    selectedProducts[productId].invoiceQuantity
                                ),
                                usedQuantity: roundToDown(
                                    math.add(
                                        Number(usedQuantity || 0),
                                        Number(
                                            selectedProducts[productId]
                                                .usedQuantity
                                        )
                                    )
                                ),
                                usedSerialNumber:
                                    usedQuantity > 0 && serialNumber
                                        ? [
                                              ...selectedProducts[productId]
                                                  .usedSerialNumber,
                                              serialNumber,
                                          ]
                                        : selectedProducts[productId]
                                              .usedSerialNumber,
                            };
                        } else {
                            const productDetails = totalQuantities.find(
                                product => product.id === productId
                            );
                            selectedProducts[productId] = {
                                id: productId,
                                name: productName,
                                barcode: undefined,
                                unitOfMeasurementName,
                                quantity: Number(productDetails?.quantity || 0),
                                serialNumbers: serialNumber
                                    ? [serialNumber]
                                    : undefined,
                                invoiceQuantity: roundToDown(quantity),
                                invoicePrice: roundToDown(pricePerUnit),
                                usedQuantity: roundToDown(usedQuantity),
                                usedSerialNumber:
                                    Number(usedQuantity) > 0
                                        ? serialNumber
                                            ? [serialNumber]
                                            : []
                                        : [],
                                fromEdit: true,
                                cost: roundToDown(cost),
                                catalog: {
                                    id: catalogId,
                                    name: catalogName,
                                    isWithoutSerialNumber: !serialNumber,
                                    isServiceType,
                                },
                            };
                        }
                    }
                );

                const totalAmount = Object.values(selectedProducts).reduce(
                    (totalPrice, { invoiceQuantity, cost }) =>
                        math.add(
                            Number(totalPrice),
                            math.mul(
                                Number(cost || 0),
                                Number(invoiceQuantity || 0)
                            )
                        ),
                    0
                );

                handleEditInvoice({
                    selectedProducts: Object.values(selectedProducts),
                    expenseCashboxType: {
                        id: financeOperations[0]?.paymentTypeId,
                        name: financeOperations[0]?.paymentTypeName,
                    },
                    expenseCashbox: {
                        name: financeOperations[0]?.cashboxName,
                        id: financeOperations[0]?.cashboxId,
                    },
                    counterparty: {
                        name: `${counterpartyName} ${counterpartySurname}`,
                        id: counterpartyId,
                    },
                    expenseCurrency: {
                        code: financeOperations[0]?.currencyCode,
                        id: financeOperations[0]?.currencyId,
                    },
                    description: description || undefined,
                    discount: {
                        percentage: Number(discount) || undefined,
                    },
                    vat: {
                        amount: Number(taxAmount) || undefined,
                        percentage: roundTo(
                            math.div(
                                math.mul(Number(taxAmount), 100),
                                totalAmount
                            ),
                            4
                        ),
                    },
                    vatCurrencyCode: taxCurrencyCode,

                    contractDetails: selectedContract
                        ? {
                              isContractSelected: true,
                              contractAmount: Number(selectedContract.amount),
                              contractBalance: Number(selectedContract.rest),
                              currencyCode,
                          }
                        : {
                              isContractSelected: false,
                              contractAmount: undefined,
                              contractBalance: undefined,
                          },
                    invoiceCurrencyCode: currencyCode,
                    activePayments: [],
                    selectedExpenses,
                    selectedImportProducts: otherExpense,
                    invoicePaymentDetails: {
                        accountBalance: [],
                    },
                    vatPaymentDetails: {
                        accountBalance: [],
                    },
                });
            },
        });
        setFieldsValue({
            date: moment(operationDate, fullDateTimeWithSecond),
            supplier: supplierId,
            salesman: salesmanId,
            contract: contractId || undefined,
            currency: currencyId,
            agent: agentId || undefined,
            expense_counterparty: counterpartyId || undefined,
            taxCurrency: taxCurrencyId,
            employee: financeOperations[0]?.employeeId || undefined,
            expenseCurrency: financeOperations[0]?.currencyId || undefined,
            expense_direction: financeOperations[0]?.contractId || 0,
            expenseCashbox: financeOperations[0]?.cashboxId,
            expenseCashboxType: financeOperations[0]?.paymentTypeId,
            stockTo: stockToId || stockFromId,
        });
    };
    useEffect(() => {
        if (invoiceInfo && !contractsLoading) {
            const { operationDate, contractId, invoiceType } = invoiceInfo;
            if (invoiceType === 8) {
                setIsDraft(true);
            }

            fetchFinanceOperations({
                filters: {
                    importPurchaseInvoices: [id],
                },
                onSuccessCallback: ({ data }) => {
                    setFinanceInfo(data);

                    getImportExpensePayment(id, ({ data: otherExpenses }) => {
                        if (contractId && contracts.length > 0) {
                            const selectedContract = contracts.find(
                                ({ id }) => id === contractId
                            );

                            updateEditInvoice(
                                selectedContract,
                                invoiceType === 8,
                                data,
                                otherExpenses
                            );
                        } else if (!contractId) {
                            updateEditInvoice(
                                undefined,
                                invoiceType === 8,
                                data,
                                otherExpenses
                            );
                        }
                    });
                },
            });
        }
    }, [invoiceInfo, contracts]);

    useEffect(() => {
        // fetchContacts();

        // fetchSuppliers();
        setFieldsValue({ date: moment() });
        fetchMainCurrency();
        return () => {
            handleResetInvoiceFields();
        };
    }, []);
    useEffect(() => {
        if (id) {
            if (invoiceInfo) {
                fetchStocks({
                    limit: 1000,
                    businessUnitIds:
                        invoiceInfo?.businessUnitId === null
                            ? [0]
                            : [invoiceInfo?.businessUnitId],
                });
                fetchContracts({
                    limit: 1000,
                    status: 1,
                    invoiceId: id,
                    businessUnitIds:
                        invoiceInfo?.businessUnitId === null
                            ? [0]
                            : [invoiceInfo?.businessUnitId],
                });
            }
        } else if (cookies.get('_TKN_UNIT_')) {
            fetchStocks({
                limit: 1000,
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
            });
            fetchContracts({
                limit: 1000,
                status: 1,
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
            });
        } else {
            fetchStocks({ limit: 1000 });
            fetchContracts({ limit: 1000, status: 1 });
        }
    }, [cookies.get('_TKN_UNIT_'), id, invoiceInfo]);

    useEffect(() => {
        if (
            invoiceCurrencyCode &&
            expenseCurrency?.code &&
            getFieldValue('date')
        ) {
            convertCurrency({
                params: {
                    fromCurrencyId: expenseCurrency.id,
                    toCurrencyId: getFieldValue('currency'),
                    amount: 1,
                    dateTime: getFieldValue('date')?.format(
                        fullDateTimeWithSecond
                    ),
                },
                onSuccessCallback: ({ data }) => {
                    const { rate } = data;
                    setInvoiceExpenseRate({
                        newRate: roundToDown(Number(rate)) || 1,
                    });
                },
            });
        }
    }, [invoiceCurrencyCode, expenseCurrency, getFieldValue('date')]);

    useEffect(() => {
        fetchCurrencies({
            dateTime: getFieldValue('date')?.format(fullDateTimeWithSecond),
            withRatesOnly: 1,
        });
    }, [getFieldValue('date')]);
    useEffect(() => {
        if (
            currencies?.some(
                currency => currency.id === getFieldValue('currency')
            )
        ) {
            setFieldsValue({ currency: getFieldValue('currency') });
        } else {
            setFieldsValue({ currency: undefined });
            updateInvoiceCurrencyCode(undefined);
        }
    }, [currencies]);
    useEffect(() => {
        setFieldsValue({ currency: mainCurrency?.id });
        updateInvoiceCurrencyCode(mainCurrency?.code);
    }, [mainCurrency]);

    return (
        <>
            <ProWarningModal
                width={600}
                maskClosable={false}
                open={isOpenWarningModal}
                closable={false}
                titleIcon={<Icon type="warning" />}
                bodyTitle="İdxal alış qaiməsi yaradıldı, amma aşağıdakılar əlavə edilmədi:"
                bodyContent={
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: '15px',
                        }}
                    >
                        {errorData?.map((item, index) => (
                            <span>
                                {index + 1}. <b>{item.cashbox}</b> hesabından
                                ödənilən xərc kifayət qədər vəsait olmadığına
                                görə
                            </span>
                        ))}
                        {invError?.map((item, index) => (
                            <span>
                                {index + 1}. <b>{item.serialNumber}</b>{' '}
                                qaiməsindən ödənilən xərc, qaimə silindiyinə
                                görə
                            </span>
                        ))}
                    </div>
                }
                cancelText={null}
                okFunc={() => {
                    setLoading(false);
                    if (!id) {
                        history.push(
                            `/sales/operations/edit/10/${invoiceId}?goback=1`
                        );
                        setIsOpenWarningModal(false);
                    } else {
                        setIsOpenWarningModal(false);
                    }
                }}
            />
            <AddFromCatalog
                isVisible={catalogModalIsVisible}
                toggleModal={toggleCatalogModal}
                fetchProducts={fetchProductsFromCatalog}
                fetchCatalogs={fetchCatalogs}
                catalogs={catalogs}
                setSelectedCatalog={setSelectedCatalog}
                filteredProducts={productWithCatalog}
                fetchProductFromCatalogs={fetchProductFromCatalogs}
            />
            <AddSerialNumbers
                selectedRow={selectedRow}
                isVisible={serialModalIsVisible}
                toggleModal={toggleSerialModal}
            />
            <Form>
                <GeneralInformation
                    invoiceInfo={invoiceInfo}
                    form={form}
                    fields={Object.values(fields)}
                />
                <Invoice
                    type={type}
                    form={form}
                    isDraft={isDraft}
                    columns={columns}
                    invoiceType={invoiceType}
                    toggleCatalogModal={toggleCatalogModal}
                    productSelectLoading={productsListByNameLoading}
                    handleProductNameChange={handleProductNameChange}
                    handleChangeSearch={handleChangeSearch}
                    handleProductBarcodeChange={handleProductBarcodeChange}
                    setBarcodeInput={setBarcodeInput}
                    barcodeInput={barcodeInput}
                    handleNewInvoice={handlePurchaseInvoice}
                    handleDraftInvoice={handlePurchaseDraftInvoice}
                    catalogModalIsDisabled={false}
                />
                {activePayments.length > 0 ? (
                    <Payment
                        form={form}
                        isDraft={isDraft}
                        handleNewInvoice={handlePurchaseInvoice}
                        handleDraftInvoice={handlePurchaseDraftInvoice}
                        id={id}
                        invoiceInfo={invoiceInfo}
                    />
                ) : null}

                <Expenses
                    form={form}
                    id={id}
                    invoiceInfo={invoiceInfo}
                    expenseRates={expenseRates}
                    rates={rates}
                    cashbox={cashbox}
                    financeInfo={financeInfo}
                />
                <Cost
                    id={id}
                    invoiceInfo={invoiceInfo}
                    form={form}
                    invoiceType={invoiceType}
                    type={type}
                    isDraft={isDraft}
                    handleNewInvoice={handlePurchaseInvoice}
                    handleDraftInvoice={handlePurchaseDraftInvoice}
                    expenseRates={expenseRates}
                    rates={rates}
                    loading={loading}
                />
            </Form>
        </>
    );
};

const mapStateToProps = state => ({
    users: state.usersReducer.users,
    stocks: state.stockReducer.stocks,
    suppliers: state.contactsReducer.suppliers,
    clients: state.contactsReducer.clients,
    contracts: state.contractsReducer.contracts,
    currencies: state.kassaReducer.currencies,
    description: state.salesOperation.description,
    counterparty: state.salesOperation.counterparty,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    expenseCurrency: state.salesOperation.expenseCurrency,
    selectedExpenses: state.salesOperation.selectedExpenses,
    activePayments: state.salesOperation.activePayments,
    expenseCashboxBalance: state.salesOperation.expenseCashboxBalance,
    discount: state.salesOperation.discount,
    vat: state.salesOperation.vat,
    contractDetails: state.salesOperation.contractDetails,
    selectedProducts: state.salesOperation.selectedProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    products: state.salesOperation.productsByName,
    profile: state.profileReducer.profile, // used for operator id
    mainCurrency: state.kassaReducer.mainCurrency,
    selectedImportProducts: state.salesOperation.selectedImportProducts,
    contractsLoading: state.loadings.fetchContracts,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    balanceLoading: state.loadings.accountBalance,
});

export const ImportPurchase = Form.create({
    name: 'PurchaseForm',
})(
    connect(
        mapStateToProps,
        {
            clearProductsByName,
            fetchSalesInvoiceInfo,
            handleResetInvoiceFields,
            createInvoice,
            setExpenses,
            deleteInvoice,
            handleEditInvoice,
            editInvoice,
            deleteExpensesByInvoiceId,
            // API
            fetchMultipleAccountBalance,
            createMultipleExpensePayment,
            createImportExpensePayment,
            fetchFinanceOperations,
            setSelectedProducts,
            fetchContracts,
            fetchStocks,
            fetchContacts,
            fetchCurrencies,
            fetchSuppliers,
            fetchPurchaseProductsByName,
            fetchPurchaseCatalogs,
            fetchPurchaseProductsFromCatalog,
            fetchSalesProductsFromCatalog,
            setInvoiceExpenseRate,
            convertCurrency,
            updateInvoiceCurrencyCode,
            fetchMainCurrency,
            fetchPurchaseBarcodesByName,
            convertMultipleCurrency,
            getImportExpensePayment,
        }
    )(ImportPurchaseOperation)
);
