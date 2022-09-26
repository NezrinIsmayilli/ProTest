/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import onScan from 'onscan.js';
import { useParams, Link, useHistory } from 'react-router-dom';
import { ProWrapper } from 'components/Lib';
import { fetchUsers } from 'store/actions/users';
import { fetchClients } from 'store/actions/contacts-new';
import { fetchContracts } from 'store/actions/contracts';
import { fetchStocks } from 'store/actions/stock';
import { fetchOrders } from 'store/actions/orders';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    messages,
    roundToDown,
    fullDateTimeWithSecond,
} from 'utils';
import {
    handleQuantityChange,
    handleResetInvoiceFields,
    fetchSalesPrices,
    handleEditInvoice,
    setSelectedProducts,
} from 'store/actions/sales-operation';

import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import {
    fetchBronProductsFromCatalog,
    fetchBronCatalogs,
    fetchBronProductsByName,
    fetchBronProductsByBarcode,
    clearProductsByName,
    fetchBronInvoicesByProduct,
    createInvoice,
    editInvoice,
} from 'store/actions/bron';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { Row, Col, Form } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import {
    Invoice,
    Quantity,
    Trash,
    SelectFromInvoice,
    AddFromCatalog,
    SerialNumbers,
    InvoiceModalWithSN,
    InvoiceModalWithoutSN,
} from './invoice';
import GeneralFields from './general-fields';
import styles from './styles.module.scss';

const returnUrl = `/warehouse/bron`;
const math = require('exact-math');

const AddBron = props => {
    const {
        form,
        stocks,
        fetchUsers,
        fetchClients,
        fetchContracts,
        fetchStocks,
        fetchOrders,
        fetchBronProductsByName,
        fetchBronProductsByBarcode,
        fetchBronCatalogs,
        fetchBronProductsFromCatalog,
        fetchBronInvoicesByProduct,
        fetchSalesPrices,
        contractDetails,
        productsListByNameLoading,
        handleQuantityChange,
        handleResetInvoiceFields,
        selectedProducts,
        editInvoice,
        createInvoice,
        clients,
        users,
        orders,
        contracts,
        fetchSalesInvoiceInfo,
        invoiceCurrencyCode,
        handleEditInvoice,
        description,
    } = props;
    const { validateFields, setFieldsValue, getFieldValue, setFields } = form;
    const {
        isContractSelected,
        contractAmount,
        contractBalance,
    } = contractDetails;
    const { id } = useParams();

    const history = useHistory();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
    const newProductNameRef = useRef(null);
    const dispatch = useDispatch();
    const [barcodeInput, setBarcodeInput] = useState(null);
    const [invoiceInfo, setInvoiceInfo] = useState(undefined);
    const [selectedRow, setSelectedRow] = useState(undefined);
    const [invoiceModalWithSN, setInvoiceModalWithSN] = useState(false);
    const [invoiceModalWithoutSN, setInvoiceModalWithoutSN] = useState(false);
    const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
    const [endLess, setEndless] = useState(false);
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });
    const [products,setProducts]=useState([]);
    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 80,
            render: (_, row, index) => index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            align: 'left',
            width: 250,
            ellipsis: true,
            render: value => value,
        },
        {
            title: 'Say',
            dataIndex: 'invoiceQuantity',
            align: 'center',
            width: 150,
            render: (value, row) => (
                <Quantity
                    row={row}
                    value={value}
                    limit={row.catalog.isServiceType ? -1 : row.quantity}
                    handleQuantityChange={handleQuantityChange}
                />
            ),
        },
        {
            title: 'Anbardakı miqdar',
            dataIndex: 'quantity',
            width: 150,
            align: 'center',
            render: (
                value,
                { catalog: { isServiceType }, unitOfMeasurementName }
            ) =>
                isServiceType
                    ? `-`
                    : `${formatNumberToLocale(defaultNumberFormat(value))} ${
                          unitOfMeasurementName
                              ? unitOfMeasurementName.toLowerCase()
                              : ''
                      }`,
        },
        {
            title: 'Qaimədən seç',
            key: 'addFromInvoice',
            width: 130,
            align: 'center',
            render: (value, row) => (
                <SelectFromInvoice
                    disabled={row.catalog?.isServiceType}
                    handleClick={() => handleModalClick(row)}
                />
            ),
        },
        {
            title: 'Seriya nömrələri',
            dataIndex: 'serialNumbers',
            width: 150,
            align: 'center',
            render: value => <SerialNumbers serialNumbers={value || []} />,
        },
        {
            title: 'Sil',
            dataIndex: 'id',
            key: 'trashIcon',
            align: 'center',
            width: 80,
            render: value => (
                <Trash
                    value={value}
                    handleProductRemove={handleProductRemove}
                />
            ),
        },
    ];
    useEffect(() => {
        onScan.attachTo(document, {
            onScan(sCode, iQty) {
                if (document.activeElement) {
                    document.activeElement.blur();
                }
                if (getFieldValue('stockFrom')) {
                    fetchBronProductsByBarcode({
                        filters: {
                            q: sCode,
                            only_products: 1,
                            datetime: invoiceInfo
                                ? invoiceInfo.bronEndDate &&
                                  moment(invoiceInfo.bronEndDate) < moment()
                                    ? moment().format(fullDateTimeWithSecond)
                                    : invoiceInfo.createdAt
                                : moment().format(fullDateTimeWithSecond),
                        },
                        stockId: getFieldValue('stockFrom'),
                        onSuccessCallback: ({ data }) => {
                            if (data && data.length !== 0) {
                                const hasProduct = selectedProducts?.find(
                                    product => product.id === data.id
                                );
                                if (hasProduct) {
                                    if (data?.catalog?.isWithoutSerialNumber) {
                                        if (
                                            Number(hasProduct.invoiceQuantity) +
                                                1 <=
                                            Number(data.quantity)
                                        ) {
                                            handleQuantityChange(
                                                data.id,
                                                Number(
                                                    hasProduct.invoiceQuantity
                                                ) + 1,
                                                -1
                                            );
                                        }
                                    }
                                } else if (
                                    data?.catalog?.isWithoutSerialNumber
                                ) {
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
                } else {
                    setFields({
                        stockFrom: {
                            value: getFieldValue('stockFrom'),
                            errors: [
                                new Error(
                                    'Skan etməmişdən öncə Anbar dəyərini seçin!'
                                ),
                            ],
                        },
                    });
                }
            },
        });
        return () => {
            onScan.detachFrom(document);
        };
    }, [selectedProducts]);

    // Validate selected products (contract, quantity and price)
    const validateSelectedProducts = selectedProducts => {
        let errorMessage = '';
        let isValid = true;

        // Is product is exists in invoice
        if (selectedProducts.length === 0) {
            errorMessage = 'Qaimədə məhsul mövcud deyil';
            isValid = false;
        }
        // Has price or quantity missed product
        else if (
            selectedProducts.some(
                ({ invoiceQuantity }) => Number(invoiceQuantity || 0) === 0
            )
        ) {
            errorMessage = 'Qaimədə sayı qeyd edilməyən məhsul mövcuddur.';
            isValid = false;
        } else if (
            isContractSelected &&
            contractAmount !== 0 &&
            math.sub(Number(0), Number(contractBalance || 0)) > 0
        ) {
            errorMessage = 'Müqavilə limiti aşıla bilməz.';
            isValid = false;
        }
        return {
            isValid,
            errorMessage,
        };
    };

    // Toggle Product Invoices Modal with Serial Numbers
    const toggleInvoiceModalWithSN = () => {
        setInvoiceModalWithSN(wasVisible => !wasVisible);
    };

    // Toggle Product Invoices Modal without Serial Numbers
    const toggleInvoiceModalWithoutSN = () => {
        setInvoiceModalWithoutSN(wasVisible => !wasVisible);
    };

    // Toggle Add Catalog modal
    const toggleCatalogModal = () => {
        setCatalogModalIsVisible(
            prevCatalogModalIsVisible => !prevCatalogModalIsVisible
        );
    };
    // Invoice list modal click
    const handleModalClick = row => {
        setSelectedRow(row);
        if (row.catalog.isWithoutSerialNumber) {
            toggleInvoiceModalWithoutSN();
        } else {
            toggleInvoiceModalWithSN();
        }
    };

    // Remove product from invoice
    const handleProductRemove = productId => {
        const newSelectedProducts = selectedProducts.filter(
            selectedProduct => selectedProduct.id !== productId
        );
        dispatch(setSelectedProducts({ newSelectedProducts }));
    };

    // Fetch products searched by name
    const handleProductNameChange = productName => {
        clearTimeout(newProductNameRef.current);
        if (productName.length > 2) {
            newProductNameRef.current = setTimeout(
                () =>
                    fetchBronProductsByName({
                        label: 'fetchProductsListByName',
                        stockId: getFieldValue('stockFrom'),
                        filters: {
                            q: productName,
                            only_products: 1,
                            datetime: invoiceInfo
                                ? invoiceInfo.bronEndDate &&
                                  moment(invoiceInfo.bronEndDate) < moment()
                                    ? moment().format(fullDateTimeWithSecond)
                                    : invoiceInfo.createdAt
                                : moment().format(fullDateTimeWithSecond),
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
        if (productBarcode.length > 1) {
            fetchBronProductsByBarcode({
                filters: {
                    q: productBarcode,
                    only_products: 1,
                    datetime: invoiceInfo
                        ? invoiceInfo.bronEndDate &&
                          moment(invoiceInfo.bronEndDate) < moment()
                            ? moment().format(fullDateTimeWithSecond)
                            : invoiceInfo.createdAt
                        : moment().format(fullDateTimeWithSecond),
                },
                stockId: getFieldValue('stockFrom'),
                onSuccessCallback: ({ data }) => {
                    if (data && data.length !== 0) {
                        const hasProduct = selectedProducts?.find(
                            product => product.id === data.id
                        );
                        if (hasProduct) {
                            if (data?.catalog?.isWithoutSerialNumber) {
                                if (
                                    Number(hasProduct.invoiceQuantity) + 1 <=
                                    Number(data.quantity)
                                ) {
                                    handleQuantityChange(
                                        data.id,
                                        Number(hasProduct.invoiceQuantity) + 1,
                                        -1
                                    );
                                }
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
        } else {
            dispatch(clearProductsByName());
        }
    };
    // Fetch Product Invoices by product Id
    const fetchProductInvoices = (productId, onSuccessCallback) => {
        fetchBronInvoicesByProduct({
            filters: id
                ? {
                      invoiceId: id,
                      datetime: getFieldValue('startDate').format(
                          fullDateTimeWithSecond
                      ),
                  }
                : {
                      datetime: getFieldValue('startDate').format(
                          fullDateTimeWithSecond
                      ),
                  },
            stockId: getFieldValue('stockFrom'),
            onSuccessCallback,
            productId,
        });
    };

    // Fetch sales catalogs by stock Id
    const fetchCatalogs = () => {
        fetchBronCatalogs({
            stockId: getFieldValue('stockFrom'),
            filters: {
                only_products: 1,
                datetime: invoiceInfo
                    ? invoiceInfo.bronEndDate &&
                      moment(invoiceInfo.bronEndDate) < moment()
                        ? moment().format(fullDateTimeWithSecond)
                        : invoiceInfo.createdAt
                    : moment().format(fullDateTimeWithSecond),
            },
        });
    };

    // Fetch sales products by catalog id
    const fetchProductsFromCatalog = catalogId => {
        fetchBronProductsFromCatalog({
            stockId: getFieldValue('stockFrom'),
            filters: {
                catalog: catalogId,
                datetime: invoiceInfo
                    ? invoiceInfo.bronEndDate &&
                      moment(invoiceInfo.bronEndDate) < moment()
                        ? moment().format(fullDateTimeWithSecond)
                        : invoiceInfo.createdAt
                    : moment().format(fullDateTimeWithSecond),
            },
        });
    };

    // handle new sales invoice
    const handleSalesInvoice = () => {
        validateFields((errors, values) => {
            if (!errors) {
                const { isValid, errorMessage } = validateSelectedProducts(
                    selectedProducts
                );
                if (!isValid) {
                    return toast.error(errorMessage);
                }
                handleCreateInvoice(values);
            }
        });
    };
    // Manipulate selected products to api required form.
    const handleSelectedProducts = selectedProducts => {
        const tmp = {};
        selectedProducts.forEach(
            ({ invoicePrice, invoiceProducts, id, invoiceQuantity }) => {
                tmp[id] = {
                    product: id,
                    price: Number(invoicePrice),
                    quantity: Number(invoiceQuantity),
                    serialNumber_ul: [],
                    invoiceProductsExtended_ul: invoiceProducts
                        ? invoiceProducts.map(
                              ({ invoice_product_id, invoiceQuantity }) => ({
                                  invoice_product_id,
                                  quantity: Number(invoiceQuantity),
                              })
                          )
                        : [],
                };
            }
        );
        return tmp;
    };
    // create new sales invoice
    const handleCreateInvoice = values => {
        const {
            order,
            endDate,
            client,
            salesman,
            contract,
            stockFrom,
        } = values;

        const newSalesInvoice = {
            bronEndDate: endLess ? null : endDate.format('DD-MM-YYYY HH:mm:ss'),
            client,
            salesman,
            stock: stockFrom,
            order: order || null,
            description: description || null,
            contract: contract || null,
            invoiceProducts_ul: handleSelectedProducts(selectedProducts),
        };

        if (id) {
            editInvoice({
                data: newSalesInvoice,
                id: Number(id),
                onSuccessCallback: () => {
                    toast.success(messages.successText);
                    history.push(`/warehouse/bron`);
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
                        return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockFrom)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                        )}</div></div>,
                        { autoClose: 8000 }
                        );
                    } else {
                        return toast.error(errorData?.message);
                    }
                },
            });
        } else {
            createInvoice({
                data: newSalesInvoice,
                onSuccessCallback: () => {
                    toast.success(messages.successText);
                    history.push(`/warehouse/bron`);
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
                        return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockFrom)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                        )}</div></div>,
                        { autoClose: 8000 }
                        );
                    } else {
                        return toast.error(errorData?.message);
                    }
                },
                showError: false,
            });
        }
    };
    // Update invoice with invoice values
    const updateEditInvoice = selectedContract => {
        const {
            clientId,
            salesmanId,
            currencyId,
            contractId,
            stockFromId,
            invoiceProducts,
            currencyCode,
            discount,
            description,
            taxPercentage,
            bronEndDate,
            createdAt,
            orderId,
        } = invoiceInfo;
        const { content } = invoiceProducts;
        const selectedProductIds = content.map(({ productId }) => productId);
        const selectedProducts = {};
        fetchBronProductsFromCatalog({
            label: 'fetchEditProductsFromCatalog',
            setState: false,
            stockId: stockFromId,
            filters: {
                invoiceId: id,
                product: selectedProductIds,
                datetime: createdAt,
            },
            onSuccessCallback: ({ data: totalQuantities }) => {
                fetchSalesPrices({
                    filters: {
                        currency: currencyId,
                        products: selectedProductIds,
                    },
                    onSuccessCallback: ({ data: priceTypes }) => {
                        content.forEach(
                            ({
                                productId,
                                productName,
                                quantity,
                                pricePerUnit,
                                serialNumber,
                                unitOfMeasurementName,
                                attachedInvoiceProductId,
                                catalogId,
                                isServiceType,
                                catalogName,
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
                                            selectedProducts[productId]
                                                .invoiceQuantity
                                        ),
                                        invoiceProducts: [
                                            ...selectedProducts[productId]
                                                .invoiceProducts,
                                            {
                                                invoice_product_id: attachedInvoiceProductId,
                                                invoiceQuantity: Number(
                                                    quantity
                                                ),
                                            },
                                        ],
                                    };
                                } else {
                                    const productDetails = totalQuantities.find(
                                        product => product.id === productId
                                    );
                                    selectedProducts[productId] = {
                                        id: productId,
                                        name: productName,
                                        barcode: undefined,
                                        serialNumbers: serialNumber
                                            ? [serialNumber]
                                            : undefined,
                                        invoiceQuantity: roundToDown(quantity),
                                        unitOfMeasurementName,
                                        prices: priceTypes[productId],
                                        invoicePrice: roundToDown(pricePerUnit),
                                        quantity: Number(
                                            productDetails?.quantity || 0
                                        ),
                                        invoiceProducts: [
                                            {
                                                invoice_product_id: attachedInvoiceProductId,
                                                invoiceQuantity: Number(
                                                    quantity
                                                ),
                                            },
                                        ],
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

                        handleEditInvoice({
                            selectedProducts: Object.values(selectedProducts),
                            description: description || null,
                            discount: {
                                percentage: Number(discount) || undefined,
                                amount: undefined,
                            },
                            vat: {
                                percentage: Number(taxPercentage) || undefined,
                                amount: undefined,
                            },
                            contractDetails: selectedContract
                                ? {
                                      isContractSelected: true,
                                      contractAmount: Number(
                                          selectedContract.amount
                                      ),
                                      contractBalance: Number(
                                          selectedContract.rest
                                      ),
                                      currencyCode: invoiceCurrencyCode,
                                  }
                                : {
                                      isContractSelected: false,
                                      contractAmount: undefined,
                                      contractBalance: undefined,
                                  },
                            invoiceCurrencyCode: currencyCode,
                            activePayments: [],
                            invoicePaymentDetails: {
                                currencyCode,
                                accountBalance: [],
                            },
                            vatPaymentDetails: {
                                currencyCode,
                                accountBalance: [],
                            },
                        });
                    },
                });
            },
        });

        setFieldsValue({
            startDate:
                bronEndDate && moment(bronEndDate) < moment()
                    ? moment()
                    : moment(createdAt, fullDateTimeWithSecond),
            client: clientId || undefined,
            salesman: salesmanId || undefined,
            contract: contractId || undefined,
            stockFrom: stockFromId,
            endDate: bronEndDate
                ? moment(bronEndDate, fullDateTimeWithSecond)
                : setEndless(true),
            order: orderId,
        });
    };

    useEffect(() => {
        if (id) {
            fetchSalesInvoiceInfo({
                id,
                onSuccess: ({ data }) => {
                    if (data.canEdit) {
                        setInvoiceInfo(data);
                    } else {
                        toast.error('Bu qaimədə düzəliş oluna bilməz.');
                        history.push('warehouse/bron');
                    }
                },
            });
        }
    }, [id]);
    useEffect(() => {
        if (invoiceInfo) {
            const { contractId } = invoiceInfo;
            if (contractId && contracts.length > 0) {
                const selectedContract = contracts.find(
                    ({ id }) => id === contractId
                );
                updateEditInvoice(selectedContract);
            } else if (!contractId) {
                updateEditInvoice(undefined);
            }
        }
    }, [invoiceInfo, contracts]);
    useEffect(() => {
        fetchClients();
        if (orders.length === 0) {
            fetchOrders({ statusGroup: 1 });
        }
        setFieldsValue({
            startDate: moment(),
        });
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
                    directions: [2],
                    businessUnitIds:
                        invoiceInfo?.businessUnitId === null
                            ? [0]
                            : [invoiceInfo?.businessUnitId],
                });
            }
        } else if (BUSINESS_TKN_UNIT) {
            fetchStocks({
                limit: 1000,
                businessUnitIds: [BUSINESS_TKN_UNIT],
            });
            fetchContracts({
                limit: 1000,
                status: 1,
                directions: [2],
                businessUnitIds: [BUSINESS_TKN_UNIT],
            });
        } else {
            fetchStocks({ limit: 1000 });
            fetchContracts({ limit: 1000, status: 1, directions: [2] });
        }
    }, [BUSINESS_TKN_UNIT, id, invoiceInfo]);



    const ajaxSelectProducts= (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            q: search,
            catalog:  getFieldValue('catalog'),
                datetime: invoiceInfo
                    ? invoiceInfo.bronEndDate &&
                      moment(invoiceInfo.bronEndDate) < moment()
                        ? moment().format(fullDateTimeWithSecond)
                        : invoiceInfo.createdAt
                    : moment().format(fullDateTimeWithSecond),
        };
        fetchBronProductsFromCatalog({
            stockId: getFieldValue('stockFrom'),
            filters: defaultFilters,
            onSuccessCallback:data=>{
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
                    setProducts(appendList);
                } else {
                    setProducts(products.concat(appendList));
                }
            }
        });
    };

    const ajaxSelectCatalogs = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            name: search,
            only_products: 1,
            datetime: invoiceInfo
                ? invoiceInfo.bronEndDate &&
                  moment(invoiceInfo.bronEndDate) < moment()
                    ? moment().format(fullDateTimeWithSecond)
                    : invoiceInfo.createdAt
                : moment().format(fullDateTimeWithSecond),
        };
        fetchBronCatalogs({
            stockId: getFieldValue('stockFrom'),
            filters: defaultFilters,
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
    return (
        <>
            <InvoiceModalWithSN
                product={selectedRow}
                isVisible={invoiceModalWithSN}
                fetchProductInvoices={fetchProductInvoices}
                toggleModal={toggleInvoiceModalWithSN}
            />
            <InvoiceModalWithoutSN
                product={selectedRow}
                isVisible={invoiceModalWithoutSN}
                toggleModal={toggleInvoiceModalWithoutSN}
                fetchProductInvoices={fetchProductInvoices}
            />

            <AddFromCatalog
                form={form}
                catalogs={catalogs}
                products={products}
                isVisible={catalogModalIsVisible}
                toggleModal={toggleCatalogModal}
                fetchProducts={fetchProductsFromCatalog}
                fetchAsyncProducts={ajaxSelectProducts}
                fetchCatalogs={ajaxSelectCatalogs}
            />
            <ProWrapper>
                <div className={styles.newOperationContainer}>
                    <Row>
                        <Col
                            md={{ span: 16, offset: 4 }}
                            ms={{ span: 20, offset: 2 }}
                            xs={{ span: 20, offset: 2 }}
                        >
                            <Link
                                to={returnUrl}
                                className={styles.returnBackButton}
                            >
                                <MdKeyboardArrowLeft
                                    size={24}
                                    style={{ marginRight: 4 }}
                                />
                                Əməliyyatlar siyahısı
                            </Link>
                            <h3 className={styles.title}>
                                {id ? 'Düzəliş et' : 'Yeni bron'}
                            </h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col
                            md={{ span: 16, offset: 4 }}
                            ms={{ span: 20, offset: 2 }}
                            xs={{ span: 20, offset: 2 }}
                        >
                            <Form>
                                <GeneralFields
                                    form={form}
                                    endLess={endLess}
                                    setEndless={setEndless}
                                    invoiceInfo={invoiceInfo}
                                />
                                <Invoice
                                    form={form}
                                    columns={columns}
                                    catalogModalIsDisabled={
                                        !getFieldValue('stockFrom')
                                    }
                                    selectProductIsDisabled={
                                        !getFieldValue('stockFrom')
                                    }
                                    toggleCatalogModal={toggleCatalogModal}
                                    productSelectLoading={
                                        productsListByNameLoading
                                    }
                                    handleProductNameChange={
                                        handleProductNameChange
                                    }
                                    handleProductBarcodeChange={
                                        handleProductBarcodeChange
                                    }
                                    handleChangeSearch={handleChangeSearch}
                                    setBarcodeInput={setBarcodeInput}
                                    barcodeInput={barcodeInput}
                                    handleNewInvoice={handleSalesInvoice}
                                />
                            </Form>
                        </Col>
                    </Row>
                </div>
            </ProWrapper>
        </>
    );
};

const mapStateToProps = state => ({
    users: state.usersReducer.users,
    orders: state.ordersReducer.orders,
    contracts: state.contractsReducer.contracts,
    clients: state.contactsReducer.clients,
    description: state.salesOperation.description,
    profile: state.profileReducer.profile, // used for operator id
    activePayments: state.salesOperation.activePayments,
    contractDetails: state.salesOperation.contractDetails,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    productsListByNameLoading: state.loadings.fetchBronProductsByName,
    selectedProducts: state.salesOperation.selectedProducts,
    stocks: state.stockReducer.stocks,
});

export default connect(
    mapStateToProps,
    {
        createInvoice,
        fetchUsers,
        fetchClients,
        fetchContracts,
        fetchStocks,
        fetchOrders,
        setSelectedProducts,
        fetchSalesInvoiceInfo,
        fetchBronProductsByName,
        fetchBronProductsByBarcode,
        fetchBronCatalogs,
        fetchBronProductsFromCatalog,
        fetchBronInvoicesByProduct,
        handleResetInvoiceFields,
        fetchSalesPrices,
        clearProductsByName,
        handleQuantityChange,
        handleEditInvoice,
        editInvoice,
    }
)(Form.create({ name: 'AddBron' })(AddBron));
