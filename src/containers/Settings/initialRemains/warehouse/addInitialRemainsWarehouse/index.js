/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import onScan from 'onscan.js';
import { toast } from 'react-toastify';
import { BsInfo } from 'react-icons/all';
import { requiredRule } from 'utils/rules';
import moment from 'moment';
import {
    ProWrapper,
    ProSelect,
    ProFormItem,
    ProDatePicker,
    Table,
    ProPageSelect,
    ProPagination,
    TableFooter,
    ProAsyncSelect,
} from 'components/Lib';
import {
    roundToDown,
    messages,
    defaultNumberFormat,
    formatNumberToLocale,
    fullDateTimeWithSecond,
} from 'utils';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { fetchStocks } from 'store/actions/stock';
import { fetchUsers } from 'store/actions/users';
import {
    fetchCurrencies,
    fetchMainCurrency,
} from 'store/actions/settings/kassa';
import { Row, Col, Form, Tooltip, Checkbox, Button, Input } from 'antd';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { FaTrash } from 'react-icons/fa';
import {
    fetchSalesInvoiceInfo,
    fetchSalesInvoiceList,
} from 'store/actions/salesAndBuys';
import {
    editInvoice,
    createInvoice,
    fetchPurchaseProductsByName,
    fetchPurchaseBarcodesByName,
    fetchPurchaseCatalogs,
    fetchPurchaseProductsFromCatalog,
    clearProductsByName,
    handleQuantityChange,
    handlePriceChange,
    handleResetInvoiceFields,
    handleEditInvoice,
    setSelectedProducts,
    fetchSalesProductsFromCatalog,
    updateInvoiceCurrencyCode,
    setTotalPrice,
    setProductsByName,
} from 'store/actions/sales-operation';
import { useHistory, useParams, Link } from 'react-router-dom';
import swal from 'sweetalert';
import styles from './styles.module.scss';
import { AddProducts } from './components/AddProducts';
import { Quantity } from './components/Quantity';
import { SelectFromInvoice } from './components/SelectFromInvoice';
import { SerialNumbers } from './components/SerialNumbers';
import { AddFromCatalog } from './components/AddFromCatalog';
import { AddSerialNumbers } from './components/AddSerialNumbers';
import { Price } from './components/Price';
import { ActionButtons } from './components/ActionButtons';

import { Trash } from './components/Trash';
import StockAdd from './stockAdd';

const math = require('exact-math');
const roundTo = require('round-to');

const returnUrl = `/settings/initial-remains/initial-remains-warehouse`;

const AddInitialRemainsWarehouse = props => {
    const {
        form,
        fetchSalesInvoiceInfo,
        fetchSalesInvoiceList,
        permissionsByKeyValue,
        stocksLoading,
        currenciesLoading,
        stocks,
        mainCurrency,
        selectedProducts,
        invoiceCurrencyCode,
        totalPrice,

        fetchUsers,
        fetchStocks,
        fetchMainCurrency,
        fetchCurrencies,
        editInvoice,
        createInvoice,
        fetchPurchaseProductsByName,
        fetchPurchaseBarcodesByName,
        fetchPurchaseCatalogs,
        fetchPurchaseProductsFromCatalog,
        clearProductsByName,
        handleQuantityChange,
        handlePriceChange,
        handleResetInvoiceFields,
        handleEditInvoice,
        setSelectedProducts,
        fetchSalesProductsFromCatalog,
        updateInvoiceCurrencyCode,
        setTotalPrice,
        setProductsByName,
    } = props;

    const {
        getFieldValue,
        getFieldError,
        getFieldDecorator,
        setFieldsValue,
        validateFields,
    } = form;

    const { id } = useParams();
    const [invoiceInfo, setInvoiceInfo] = useState(undefined);
    const dispatch = useDispatch();
    const newTotalPriceRef = useRef(null);
    const newProductNameRef = useRef(null);
    const [barcodeInput, setBarcodeInput] = useState(null);
    const [pageSize, setPageSize] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
    const [serialModalIsVisible, setSerialModalIsVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [operatinDate, setOperatinDate] = useState(undefined);
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });
    const [selectedCatalog, setSelectedCatalog] = useState(undefined);
    const [productWithCatalog, setProductsWithCatalog] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [filters, setFilters] = useState({
        productNames: [],
        serialNumbers: [],
    });
    const [stockItem, setStockItem] = useState(false);
    const [checkList, setCheckList] = useState({
        checkedListAll: [],
        ItemsChecked: false,
    });
    const [data, setData] = useState(undefined);
    const [filterSelectedCurrencies, setFilterSelectedCurrencies] = useState(
        []
    );
    const history = useHistory();
    const { location } = history;

    const handlePaginationChange = value => (() => setCurrentPage(value))();
    const handlePageSizeChange = (_, size) => {
        setCurrentPage(1);
        setPageSize(size);
    };
    const handleTotalPriceChange = selectedProducts => {
        let newTotalPrice = 0;
        if (
            selectedProducts?.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
            )?.length > 0
        ) {
            newTotalPrice = selectedProducts
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .reduce(
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
        }
        setTotalPrice({ newTotalPrice: roundToDown(newTotalPrice) });
    };
    const handleCheckbox = checked => {
        let collection = [];

        if (checked) {
            collection = getAllItems();
        }
        setCheckList({
            checkedListAll: collection,
            ItemsChecked: checked,
        });
    };
    const getAllItems = () => {
        const collection = [];
        for (const item of selectedProducts) {
            if (!item.usedQuantity > 0) {
                collection.push(item.id);
            }
        }

        return collection;
    };

    const handleCheckboxes = (row, e) => {
        const { checked } = e.target;

        if (checked) {
            const collection = selectedProducts;

            setCheckList(prevState => ({
                checkedListAll: [...prevState.checkedListAll, row.id * 1],
                ItemsChecked:
                    collection.length === prevState.checkedListAll.length + 1 ||
                    prevState.checkedListAll.length + 1 ===
                        collection?.filter(
                            ({ usedQuantity }) =>
                                usedQuantity === 0 || !usedQuantity
                        ).length,
            }));
        } else {
            setCheckList(prevState => ({
                checkedListAll: prevState.checkedListAll.filter(
                    item => item !== row.id
                ),
                ItemsChecked: false,
            }));
        }
    };

    const filterDuplicates = (tableDatas, field) => {
        const data = [];
        return tableDatas.reduce((total, current) => {
            if (data.includes(current[field])) {
                return total;
            }
            data.push(current[field]);
            return [...total, { name: current[field] }];
        }, []);
    };
    const filterSerialNumber = (tableDatas, field) =>
        tableDatas.reduce((total, current) => {
            if (current[field] === undefined) {
                return total;
            }

            return [...total, ...current[field].map(item => ({ name: item }))];
        }, []);

    const handleFilter = (type, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [type]: value,
        }));
        setCurrentPage(1);
    };

    function replaceStr(str) {
        return str.replace('I', 'ı').replace('İ', 'i');
    }

    const getFilteredInvoices = (
        tableData,
        { productNames, serialNumbers }
    ) => {
        if (productNames.length > 0 || serialNumbers.length > 0) {
            const newtableDatas = tableData.filter(
                ({ name, serialNumbers: serialNumber }) => {
                    if (
                        (productNames.length > 0
                            ? name
                                  .toLocaleLowerCase('tr-TR')
                                  .indexOf(
                                      productNames.toLocaleLowerCase('tr-TR')
                                  ) >= 0
                            : true) &&
                        (serialNumbers.length > 0
                            ? serialNumber?.some(
                                  serialNum =>
                                      serialNum
                                          .toLocaleLowerCase('tr-TR')
                                          .indexOf(
                                              serialNumbers.toLocaleLowerCase(
                                                  'tr-TR'
                                              )
                                          ) >= 0
                              )
                            : true)
                    ) {
                        return true;
                    }
                    return false;
                }
            );
            return newtableDatas;
        }
        return tableData;
    };
    useEffect(() => {
        if (!id) {
            if (data) {
                setFieldsValue({
                    stockTo: stocks[0]?.id,
                });
            } else {
                setFieldsValue({
                    stockTo: stocks.length === 1 ? stocks[0]?.id : undefined,
                });
            }
        } else if (data) {
            setFieldsValue({
                stockTo: stocks[0]?.id,
            });
        }
    }, [stocks]);

    useEffect(() => {
        let newTotalPrice = 0;
        if (
            getFilteredInvoices(selectedProducts, filters)?.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
            )?.length > 0
        ) {
            newTotalPrice = getFilteredInvoices(selectedProducts, filters)
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .reduce(
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
            setTotalPrice({ newTotalPrice: roundToDown(newTotalPrice) });
        }
    }, [selectedProducts, pageSize, currentPage, filters]);

    useEffect(() => {
        clearTimeout(newTotalPriceRef.current);
        newTotalPriceRef.current = setTimeout(
            () =>
                handleTotalPriceChange(
                    getFilteredInvoices(selectedProducts, filters)
                ),
            600
        );
    }, [selectedProducts, filters]);
    useEffect(() => {
        onScan.attachTo(document, {
            onScan(sCode, iQty) {
                if (document.activeElement) {
                    document.activeElement.blur();
                }
                fetchPurchaseBarcodesByName({
                    label: 'fetchProductsListByBarcode',
                    filters: {
                        q: sCode,
                        serviceType: 1,
                        stock: getFieldValue('stockTo'),
                    },
                    onSuccessCallback: ({ data }) => {
                        if (data && data.length !== 0) {
                            const hasProduct = selectedProducts?.find(
                                product => product.id === data.id
                            );
                            const productsWithPrices = {
                                ...data,
                                invoiceQuantity: data?.catalog
                                    ?.isWithoutSerialNumber
                                    ? 1
                                    : null,
                            };
                            if (hasProduct) {
                                if (data?.catalog?.isWithoutSerialNumber) {
                                    handleQuantityChange(
                                        data.id,
                                        Number(hasProduct.invoiceQuantity) + 1,
                                        -1
                                    );
                                }
                            } else {
                                dispatch(
                                    setSelectedProducts({
                                        newSelectedProducts: [
                                            ...selectedProducts,
                                            productsWithPrices,
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

    const columns = [
        {
            title: '',
            width: 46,
            dataIndex: 'id',
            render(val, row) {
                return (
                    <Checkbox
                        checked={checkList.checkedListAll.includes(val)}
                        onChange={event => handleCheckboxes(row, event)}
                        disabled={row.usedQuantity > 0}
                    />
                );
            },
        },
        {
            title: '№',
            dataIndex: 'id',
            width: 80,
            render: (_value, _row, index) =>
                (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            ellipsis: true,
            width: 150,
            align: 'left',
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
            width: 200,
            render: (value, row) => (
                <div style={{ display: 'flex' }}>
                    <Quantity
                        row={row}
                        value={value}
                        limit={-1}
                        handleQuantityChange={handleQuantityChange}
                        serialModalIsVisible={serialModalIsVisible}
                    />
                    <Tooltip
                        placement="right"
                        title={
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {Number(row.quantity || 0) > 0
                                    ? `Anbardakı miqdar: ${formatNumberToLocale(
                                          defaultNumberFormat(row.quantity || 0)
                                      )} ${
                                          row.unitOfMeasurementName
                                              ? row.unitOfMeasurementName.toLowerCase()
                                              : ''
                                      }`
                                    : `-`}
                            </div>
                        }
                    >
                        <span style={{ fontSize: '20px', marginTop: '4px' }}>
                            <BsInfo />
                        </span>
                    </Tooltip>
                </div>
            ),
        },
        {
            title: 'SN əlavə et',
            key: 'addFromInvoice',
            width: 120,
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
            width: 150,
            align: 'center',
            render: value => <SerialNumbers serialNumbers={value || []} />,
        },
        {
            title: 'Toplam',
            dataIndex: 'total',
            width: 100,
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
            render: (value, row) => (
                <Trash
                    value={value}
                    selectedProducts={selectedProducts}
                    handleProductRemove={handleProductRemove}
                    disabled={row.usedQuantity > 0}
                />
            ),
        },
    ];

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

    const handleProductRemove = (productId, array) => {
        if (array) {
            swal({
                title: 'Diqqət!',
                text: 'Silmək istədiyinizə əminsiniz?',
                buttons: ['Ləğv et', 'Sil'],
                dangerMode: true,
            }).then(willDelete => {
                if (willDelete) {
                    const newSelectedProducts = selectedProducts.filter(
                        selectedProduct =>
                            !productId.includes(selectedProduct.id)
                    );
                    dispatch(setSelectedProducts({ newSelectedProducts }));
                    if (
                        newSelectedProducts.slice(
                            (currentPage - 1) * pageSize,
                            currentPage * pageSize
                        ).length === 0
                    ) {
                        setCurrentPage(1);
                    }
                }
            });
        } else {
            const newSelectedProducts = selectedProducts.filter(
                selectedProduct => selectedProduct.id !== productId
            );
            dispatch(setSelectedProducts({ newSelectedProducts }));
            if (
                newSelectedProducts.slice(
                    (currentPage - 1) * pageSize,
                    currentPage * pageSize
                ).length === 0
            ) {
                setCurrentPage(1);
            }
        }
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

    const handleStockItem = () => {
        setStockItem(true);
    };

    const handleChangeSearch = productBarcode => {
        setBarcodeInput(productBarcode);
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
                stock: getFieldValue('stockTo'),
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
                stock: getFieldValue('stockTo'),
            },
        });
    };

    const toggleCatalogModal = () => {
        setCatalogModalIsVisible(
            prevCatalogModalIsVisible => !prevCatalogModalIsVisible
        );
    };
    // Manipulate selected products to api required form.
    const handleSelectedProducts = selectedProducts =>
        selectedProducts.map(
            ({ invoicePrice, id, invoiceQuantity, serialNumbers }) => ({
                product: id,
                price: Number(invoicePrice),
                quantity: Number(invoiceQuantity),
                serialNumber_ul: serialNumbers || [],
            })
        );
    const fetchCatalogs = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchPurchaseCatalogs({
            filters: {
                stock: getFieldValue('stockTo'),
                serviceType: 1,
                ...defaultFilters,
            },
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

    // // Fetch product catalogs by invoice type
    // const fetchCatalogs = () => {
    //     fetchPurchaseCatalogs({
    //         filters: {
    //             limit: 1000,
    //             serviceType: 1,
    //             stock: getFieldValue('stockTo'),
    //         },
    //         label: 'fetchCatalogsByInvoiceType',
    //     });
    // };
    // Create purchase invoice
    const handleCreateInvoice = values => {
        const { date, currency, stockTo } = values;

        let newInitInvoice = {};

        newInitInvoice = {
            currency,
            description: '',
            stock: stockTo,
            operationDate: date.format(fullDateTimeWithSecond),
            invoiceProducts_ul: handleSelectedProducts(selectedProducts),
        };
        if (id) {
            editInvoice({
                data: newInitInvoice,
                type: 'init',
                id: Number(id),
                onSuccessCallback: () => {
                    toast.success(messages.successText);
                    history.push(
                        `/settings/initial-remains/initial-remains-warehouse`
                    );
                },
            });
        } else {
            createInvoice({
                data: newInitInvoice,
                type: 'init',
                onSuccessCallback: ({ data }) => {
                    toast.success(messages.successText);
                    history.push(
                        `/settings/initial-remains/initial-remains-warehouse`
                    );
                },
            });
        }
    };

    // Form Submit (Finally trying to create invoice)
    const handleInitInvoice = () => {
        validateFields((errors, values) => {
            if (!errors) {
                const { isValid, errorMessage } = validateSelectedProducts(
                    selectedProducts
                );
                if (!isValid) {
                    if (errorMessage) {
                        return toast.error(errorMessage);
                    }
                } else {
                    handleCreateInvoice(values);
                }
            }
        });
    };

    const validateSelectedProducts = selectedProducts => {
        let errorMessage = '';
        let isValid = true;

        // Has price or quantity missed product
        if (
            selectedProducts.some(
                ({ invoicePrice, invoiceQuantity, usedQuantity }) =>
                    Number(invoicePrice || 0) === 0 ||
                    Number(invoiceQuantity || 0) === 0 ||
                    Number(invoiceQuantity || 0) < usedQuantity
            )
        ) {
            errorMessage =
                'Qaimədə say və ya qiyməti qeyd edilməyən məhsul mövcuddur.';
            isValid = false;
        }
        return {
            isValid,
            errorMessage,
        };
    };

    // Fetch products by product name
    const handleProductNameChange = productName => {
        clearTimeout(newProductNameRef.current);
        if (productName.length > 2) {
            newProductNameRef.current = setTimeout(
                () =>
                    fetchPurchaseProductsByName({
                        label: 'fetchProductsListByName',
                        onSuccessCallback: ({ data }) => {
                            if (data.length > 0) {
                                dispatch(
                                    setProductsByName({
                                        data,
                                    })
                                );
                            }
                        },
                        filters: {
                            q: productName,
                            serviceType: 1,
                            stock: getFieldValue('stockTo'),
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

    const handleProductBarcodeChange = productBarcode => {
        fetchPurchaseBarcodesByName({
            label: 'fetchProductsListByBarcode',
            filters: {
                q: productBarcode,
                serviceType: 1,
                stock: getFieldValue('stockTo'),
            },
            onSuccessCallback: ({ data }) => {
                if (data && data.length !== 0) {
                    const hasProduct = selectedProducts?.find(
                        product => product.id === data.id
                    );
                    const productsWithPrices = {
                        ...data,
                        invoiceQuantity: data?.catalog?.isWithoutSerialNumber
                            ? 1
                            : null,
                    };
                    if (hasProduct) {
                        if (data?.catalog?.isWithoutSerialNumber) {
                            handleQuantityChange(
                                data.id,
                                Number(hasProduct.invoiceQuantity) + 1,
                                -1
                            );
                        }
                    } else {
                        dispatch(
                            setSelectedProducts({
                                newSelectedProducts: [
                                    ...selectedProducts,
                                    productsWithPrices,
                                ],
                            })
                        );
                    }
                }
                setBarcodeInput(null);
            },
        });
    };

    useEffect(() => {
        if (location?.state?.data) {
            const { businessUnitId } = location?.state?.data;
            if (businessUnitId === null) {
                cookies.set('_TKN_UNIT_', 0);
            } else {
                cookies.set('_TKN_UNIT_', businessUnitId);
            }
        }
    }, [location?.state?.data]);

    useEffect(() => {
        if (id) {
            if (invoiceInfo) {
                fetchUsers({
                    filters: {
                        businessUnitIds:
                            invoiceInfo?.businessUnitId === null
                                ? [0]
                                : [invoiceInfo?.businessUnitId],
                    },
                });
                fetchStocks({
                    limit: 1000,
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
            fetchUsers({
                filters: { businessUnitIds: [cookies.get('_TKN_UNIT_')] },
            });
        } else {
            fetchStocks({ limit: 1000 });
            fetchUsers({});
        }
    }, [cookies.get('_TKN_UNIT_'), id, invoiceInfo]);

    useEffect(() => {
        if (getFieldValue('date')) {
            ajaxCurrenciesSelectRequest(1, 20, '', 1);
        }
    }, [getFieldValue('date')]);

    useEffect(() => {
        if (invoiceInfo) {
            fetchCurrencies(
                {
                    ids: [Number(invoiceInfo.currencyId)],
                    dateTime:
                        invoiceInfo &&
                        getFieldValue('date')?.format(
                            fullDateTimeWithSecond
                        ) === invoiceInfo.operationDate
                            ? invoiceInfo.operationDate
                            : getFieldValue('date')?.format(
                                  fullDateTimeWithSecond
                              ),
                    withRatesOnly: 1,
                },
                data => {
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
                    if (appendList.length === 0) {
                        setFieldsValue({
                            currency:
                                getFieldValue('currency') ===
                                invoiceInfo.currencyId
                                    ? undefined
                                    : getFieldValue('currency'),
                        });
                    } else {
                        setFieldsValue({
                            currency: getFieldValue('currency')
                                ? getFieldValue('currency')
                                : invoiceInfo.currencyId,
                        });
                    }
                    setFilterSelectedCurrencies(appendList);
                }
            );
        }
    }, [invoiceInfo, getFieldValue('date')]);

    const ajaxCurrenciesSelectRequest = (
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
            dateTime:
                invoiceInfo &&
                getFieldValue('date')?.format(fullDateTimeWithSecond) ===
                    invoiceInfo.operationDate
                    ? invoiceInfo.operationDate
                    : getFieldValue('date')?.format(fullDateTimeWithSecond),
            withRatesOnly: 1,
        };
        fetchCurrencies(defaultFilters, data => {
            if (data.data?.length === 0) {
                setFieldsValue({
                    currency: undefined,
                });
            } else {
                setFieldsValue({
                    currency: data.data
                        ?.map(({ id }) => id)
                        .includes(getFieldValue('currency'))
                        ? getFieldValue('currency')
                        : undefined,
                });
            }
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
                setCurrencies(appendList);
            } else {
                setCurrencies(currencies.concat(appendList));
            }
        });
    };

    // useEffect(() => {
    //     if (id) {
    //         if (
    //             [
    //                 {
    //                     id: invoiceInfo?.currencyId,
    //                     code: invoiceInfo?.currencyCode,
    //                 },
    //                 ...currencies,
    //             ]?.some(currency => currency.id === getFieldValue('currency'))
    //         ) {
    //             setFieldsValue({ currency: getFieldValue('currency') });
    //         } else {
    //             setFieldsValue({ currency: undefined });
    //             updateInvoiceCurrencyCode(undefined);
    //         }
    //     } else if (
    //         currencies?.some(
    //             currency => currency.id === getFieldValue('currency')
    //         )
    //     ) {
    //         setFieldsValue({ currency: getFieldValue('currency') });
    //         updateInvoiceCurrencyCode(
    //             currencies.find(
    //                 currency => currency.id === getFieldValue('currency')
    //             )?.code
    //         );
    //     } else {
    //         setFieldsValue({ currency: undefined });
    //         updateInvoiceCurrencyCode(undefined);
    //     }
    // }, [currencies]);

    useEffect(() => {
        setCheckList({
            checkedListAll: [],
            ItemsChecked: false,
        });
        if (id) {
            setFieldsValue({ currency: invoiceInfo?.currencyId });
            updateInvoiceCurrencyCode(invoiceInfo?.currencyCode);
        }
    }, [selectedProducts]);

    useEffect(() => {
        if (!id && mainCurrency?.id) {
            setFieldsValue({ currency: mainCurrency?.id });
            updateInvoiceCurrencyCode(mainCurrency?.code);
        }
    }, [mainCurrency]);

    useEffect(() => {
        if (!id) {
            setFieldsValue({
                date: moment(),
            });
        }
    }, []);

    useEffect(() => {
        fetchMainCurrency();
        fetchSalesInvoiceList({
            filters: {
                invoiceTypes: [11],
                allProduction: 1,
                isDeleted: 0,
                limit: 10000,
            },
        });
        return () => {
            handleResetInvoiceFields();
        };
    }, []);

    useEffect(() => {
        if (id) {
            fetchSalesInvoiceInfo({
                id,
                onSuccess: ({ data }) => {
                    setInvoiceInfo(data);
                },
            });
        }
    }, [id]);

    const updateEditInvoice = () => {
        const {
            operationDate,
            currencyId,
            description,
            stockToId,
            endPrice,
            invoiceProducts,
            currencyCode,
            amount,
            businessUnitId,
        } = invoiceInfo;
        const { content } = invoiceProducts;
        const selectedProducts = {};
        const selectedProductIds = content.map(({ productId }) => productId);
        fetchSalesProductsFromCatalog({
            label: 'fetchEditProductsFromCatalog',
            setState: false,
            stockId: stockToId,
            filters: {
                saleInvoiceId: id,
                // product: selectedProductIds,
                datetime: operationDate,
                businessUnitIds: id
                    ? businessUnitId === null
                        ? [0]
                        : [businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
            },
            onSuccessCallback: ({ data: totalQuantities }) => {
                if (selectedProductIds.length > 0) {
                    content.forEach(
                        ({
                            productId,
                            productName,
                            quantity,
                            pricePerUnit,
                            isServiceType,
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
                                        selectedProducts[productId]
                                            .invoiceQuantity
                                    ),
                                    usedQuantity: math.add(
                                        roundToDown(usedQuantity),
                                        selectedProducts[productId].usedQuantity
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
                                    quantity: Number(
                                        productDetails?.quantity || 0
                                    ),
                                    serialNumbers: serialNumber
                                        ? [serialNumber]
                                        : undefined,
                                    invoiceQuantity: roundToDown(quantity),
                                    invoicePrice: roundToDown(pricePerUnit),
                                    catalog: {
                                        id: catalogId,
                                        name: catalogName,
                                        isWithoutSerialNumber: !serialNumber,
                                        isServiceType,
                                    },
                                    currencyCode,
                                    currencyId,
                                    usedQuantity: Number(usedQuantity),
                                    usedSerialNumber:
                                        Number(usedQuantity) > 0
                                            ? serialNumber
                                                ? [serialNumber]
                                                : []
                                            : [],
                                };
                            }
                        }
                    );

                    handleEditInvoice({
                        selectedProducts: Object.values(selectedProducts),
                        description: description || undefined,
                        invoiceCurrencyCode: currencyCode,
                    });
                }
            },
        });
        setOperatinDate(operationDate);
        setFieldsValue({
            date: moment(operationDate, fullDateTimeWithSecond),
            // currency: currencyId,
            stockTo: stockToId,
        });
    };

    useEffect(() => {
        if (invoiceInfo) {
            updateEditInvoice();
        }
    }, [invoiceInfo]);

    const disabledDate = current => current && current > moment().endOf('day');
    const disabledDateEdit = current =>
        current && current > moment(operatinDate, fullDateTimeWithSecond);

    const { Search } = Input;

    return (
        <ProWrapper>
            <div className={styles.newOperationContainer}>
                <AddFromCatalog
                    form={form}
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
                <Row>
                    <Col span={16} offset={4}>
                        <Link
                            to={returnUrl}
                            className={styles.returnBackButton}
                        >
                            <MdKeyboardArrowLeft
                                size={24}
                                style={{ marginRight: 4 }}
                            />
                            Əməliyyatlar Siyahısı
                        </Link>
                        <h3 className={styles.title}>
                            {id ? 'Düzəliş et' : 'Yeni əməliyyat'}
                        </h3>

                        <Form>
                            <div className={styles.parentBox}>
                                <div className={styles.paper}>
                                    <span className={styles.newOperationTitle}>
                                        Ümumi məlumat
                                    </span>
                                    <div className={styles.fieldsContainer}>
                                        <div className={styles.field}>
                                            <ProFormItem
                                                label="İlkin qalıq tarixi"
                                                help={
                                                    getFieldError('date')?.[0]
                                                }
                                            >
                                                {getFieldDecorator('date', {
                                                    getValueFromEvent: date =>
                                                        date,
                                                    rules: [requiredRule],
                                                })(
                                                    <ProDatePicker
                                                        size="large"
                                                        format={
                                                            fullDateTimeWithSecond
                                                        }
                                                        allowClear={false}
                                                        disabledDate={
                                                            id &&
                                                            selectedProducts?.filter(
                                                                item =>
                                                                    item.usedQuantity >
                                                                    0
                                                            )?.length > 0
                                                                ? disabledDateEdit
                                                                : disabledDate
                                                        }
                                                        placeholder="Seçin"
                                                    />
                                                )}
                                            </ProFormItem>
                                        </div>
                                        <StockAdd
                                            visible={stockItem}
                                            toggleVisible={setStockItem}
                                            setData={setData}
                                        />
                                        <div
                                            className={styles.field}
                                            style={{ position: 'relative' }}
                                        >
                                            {
                                                <Tooltip title="Anbar əlavə et">
                                                    <PlusIcon
                                                        color="#FF716A"
                                                        className={
                                                            styles.plusBtn
                                                        }
                                                        onClick={
                                                            handleStockItem
                                                        }
                                                    />
                                                </Tooltip>
                                            }
                                            <ProFormItem
                                                label="Anbar(Haraya)"
                                                help={
                                                    getFieldError(
                                                        'stockTo'
                                                    )?.[0]
                                                }
                                            >
                                                {getFieldDecorator('stockTo', {
                                                    getValueFromEvent: category =>
                                                        category,
                                                    rules: [requiredRule],
                                                })(
                                                    <ProSelect
                                                        loading={stocksLoading}
                                                        disabled={
                                                            stocksLoading ||
                                                            selectedProducts?.filter(
                                                                item =>
                                                                    item.usedQuantity >
                                                                    0
                                                            )?.length > 0
                                                        }
                                                        placeholder="Seçin"
                                                        data={stocks}
                                                    />
                                                )}
                                            </ProFormItem>
                                        </div>
                                        <div className={styles.field}>
                                            <ProFormItem
                                                label="Valyuta"
                                                help={
                                                    getFieldError(
                                                        'currency'
                                                    )?.[0]
                                                }
                                            >
                                                {getFieldDecorator('currency', {
                                                    getValueFromEvent: currencyId => {
                                                        const selectedCurrency = id
                                                            ? [
                                                                  {
                                                                      id:
                                                                          invoiceInfo?.currencyId,
                                                                      code:
                                                                          invoiceInfo?.currencyCode,
                                                                  },
                                                                  ...currencies,
                                                              ].find(
                                                                  currency =>
                                                                      currency.id ===
                                                                      currencyId
                                                              )
                                                            : currencies.find(
                                                                  currency =>
                                                                      currency.id ===
                                                                      currencyId
                                                              );
                                                        const {
                                                            code,
                                                        } = selectedCurrency;
                                                        updateInvoiceCurrencyCode(
                                                            code
                                                        );
                                                        return currencyId;
                                                    },
                                                    rules: [requiredRule],
                                                })(
                                                    <ProAsyncSelect
                                                        selectRequest={
                                                            ajaxCurrenciesSelectRequest
                                                        }
                                                        data={
                                                            filterSelectedCurrencies.length >
                                                            0
                                                                ? [
                                                                      ...filterSelectedCurrencies,
                                                                      ...currencies.filter(
                                                                          item =>
                                                                              !filterSelectedCurrencies
                                                                                  .map(
                                                                                      ({
                                                                                          id,
                                                                                      }) =>
                                                                                          id
                                                                                  )
                                                                                  ?.includes(
                                                                                      item.id
                                                                                  )
                                                                      ),
                                                                  ]
                                                                : currencies
                                                        }
                                                        keys={['code']}
                                                        allowClear={false}
                                                    />
                                                )}
                                            </ProFormItem>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.parentBox}>
                                <div className={styles.paper}>
                                    {/* <Spin spinning={invoiceInfoLoading}> */}
                                    <div className={styles.Header}>
                                        <span
                                            className={styles.newOperationTitle}
                                        >
                                            Qaimə
                                        </span>
                                    </div>
                                    <AddProducts
                                        selectedStock={getFieldValue('stockTo')}
                                        handleChangeSearch={handleChangeSearch}
                                        handleProductBarcodeChange={
                                            handleProductBarcodeChange
                                        }
                                        barcodeInput={barcodeInput}
                                        handleProductNameChange={
                                            handleProductNameChange
                                        }
                                        catalogModalIsDisabled={false}
                                        toggleCatalogModal={toggleCatalogModal}
                                        fetchCatalogs={fetchCatalogs}
                                    />
                                    <Row
                                        style={{
                                            margin: '20px 0 10px',
                                            display: 'flex',
                                            alignItems: 'end',
                                        }}
                                    >
                                        <Col span={10} align="start">
                                            <div className={styles.flexDisplay}>
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        margin: '0 20px 0',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Checkbox
                                                        onChange={event =>
                                                            handleCheckbox(
                                                                event.target
                                                                    .checked
                                                            )
                                                        }
                                                        checked={
                                                            checkList.ItemsChecked
                                                        }
                                                        disabled={
                                                            selectedProducts?.filter(
                                                                ({
                                                                    usedQuantity,
                                                                }) =>
                                                                    !usedQuantity ||
                                                                    usedQuantity ===
                                                                        0
                                                            ).length === 0
                                                        }
                                                    />

                                                    <Button
                                                        onClick={() =>
                                                            handleProductRemove(
                                                                checkList.checkedListAll,
                                                                true
                                                            )
                                                        }
                                                        style={{
                                                            border: 'none',
                                                            background: 'none',
                                                        }}
                                                        disabled={
                                                            checkList
                                                                .checkedListAll
                                                                .length === 0
                                                        }
                                                    >
                                                        <Tooltip
                                                            placement="bottom"
                                                            title={`${'Silinmə'}${' '}(${
                                                                checkList
                                                                    .checkedListAll
                                                                    .length
                                                            })`}
                                                        >
                                                            <FaTrash
                                                                size="20px"
                                                                style={{
                                                                    marginTop:
                                                                        '5px',
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={14} align="end">
                                            <div
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Input.Group
                                                    className={
                                                        styles.productNameSelect
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.filterName
                                                        }
                                                    >
                                                        Siyahıdakı məhsulları
                                                        axtar:
                                                    </span>
                                                    <Search
                                                        placeholder="Məhsul adını daxil edin"
                                                        onSearch={value =>
                                                            handleFilter(
                                                                'productNames',
                                                                value
                                                            )
                                                        }
                                                        size="medium"
                                                        allowClear
                                                        onChange={e => {
                                                            if (
                                                                e.target
                                                                    .value ===
                                                                ''
                                                            ) {
                                                                handleFilter(
                                                                    'productNames',
                                                                    ''
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Input.Group>
                                                <Input.Group
                                                    style={{
                                                        marginLeft: '5px',
                                                    }}
                                                    className={
                                                        styles.productSeriaSelect
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.filterName
                                                        }
                                                    >
                                                        Seriya nömrəsini axtar:
                                                    </span>
                                                    <Search
                                                        placeholder="Seriya nömrəsini daxil edin"
                                                        onSearch={value =>
                                                            handleFilter(
                                                                'serialNumbers',
                                                                value
                                                            )
                                                        }
                                                        size="medium"
                                                        allowClear
                                                        onChange={e => {
                                                            if (
                                                                e.target
                                                                    .value ===
                                                                ''
                                                            ) {
                                                                handleFilter(
                                                                    'serialNumbers',
                                                                    ''
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Input.Group>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Table
                                        columns={columns}
                                        rowKey={row => row.id}
                                        // loading={
                                        //     productQuantitiesLoading ||
                                        //     priceTypesLoading
                                        // }
                                        dataSource={getFilteredInvoices(
                                            selectedProducts,
                                            filters
                                        ).slice(
                                            (currentPage - 1) * pageSize,
                                            currentPage * pageSize
                                        )}
                                        footer={
                                            <TableFooter
                                                title="Toplam"
                                                mebleg={`${formatNumberToLocale(
                                                    defaultNumberFormat(
                                                        totalPrice
                                                    )
                                                )} ${invoiceCurrencyCode ||
                                                    ''}`}
                                            />
                                        }
                                    />
                                    <Row
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginTop: '20px',
                                        }}
                                    >
                                        <Col span={16}>
                                            <ProPagination
                                                currentPage={currentPage}
                                                pageSize={pageSize}
                                                onChange={
                                                    handlePaginationChange
                                                }
                                                total={
                                                    getFilteredInvoices(
                                                        selectedProducts,
                                                        filters
                                                    )?.length
                                                }
                                            />
                                        </Col>
                                        <Col span={6} offset={2} align="end">
                                            <ProPageSelect
                                                currentPage={currentPage}
                                                pageSize={pageSize}
                                                total={
                                                    getFilteredInvoices(
                                                        selectedProducts,
                                                        filters
                                                    )?.length
                                                }
                                                onChange={e =>
                                                    handlePageSizeChange(
                                                        currentPage,
                                                        e
                                                    )
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                            <ActionButtons
                                form={form}
                                handleNewInvoice={handleInitInvoice}
                            />
                            {/* </Spin> */}
                        </Form>
                    </Col>
                </Row>
            </div>
        </ProWrapper>
    );
};

const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    stocksLoading: state.loadings.fetchStocks,
    stocks: state.stockReducer.stocks,
    currenciesLoading: state.loadings.fetchCurrencies,
    mainCurrency: state.kassaReducer.mainCurrency,
    selectedProducts: state.salesOperation.selectedProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    totalPrice: state.salesOperation.totalPrice,
});

export default connect(
    mapStateToProps,
    {
        fetchUsers,
        fetchSalesInvoiceInfo,
        fetchSalesInvoiceList,
        fetchStocks,
        fetchCurrencies,
        fetchMainCurrency,
        editInvoice,
        createInvoice,
        fetchPurchaseProductsByName,
        fetchPurchaseBarcodesByName,
        fetchPurchaseCatalogs,
        fetchPurchaseProductsFromCatalog,
        clearProductsByName,
        handleQuantityChange,
        handlePriceChange,
        handleResetInvoiceFields,
        handleEditInvoice,
        setSelectedProducts,
        fetchSalesProductsFromCatalog,
        updateInvoiceCurrencyCode,
        setTotalPrice,
        setProductsByName,
    }
)(Form.create({ name: 'RemainsWarehouseForm' })(AddInitialRemainsWarehouse));
