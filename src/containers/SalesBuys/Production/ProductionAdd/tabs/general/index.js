/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Spin } from 'antd';
import { fetchContracts } from 'store/actions/contracts';
import {
    fetchCurrencies,
    fetchMainCurrency,
} from 'store/actions/settings/kassa';
import {
    roundToDown,
    defaultNumberFormat,
    formatNumberToLocale,
    fullDateTimeWithSecond,
} from 'utils';
import {
    fetchPurchaseProductsByName,
    fetchPurchaseBarcodesByName,
    fetchPurchaseCatalogs,
    fetchPurchaseProductsFromCatalog,
    clearProductsByName,
    handlePlannedCostChange,
    handlePlannedPriceChange,
    handleResetInvoiceFields,
    handleEditInvoice,
    setSelectedProducts,
    fetchSalesProductsFromCatalog,
    updateInvoiceCurrencyCode,
    setTotalPrice,
    setTotalCost,
} from 'store/actions/sales-operation';
import { deleteInvoice } from 'store/actions/operations';
import moment from 'moment';
import styles from '../../styles.module.scss';
import {
    Invoice,
    Quantity,
    PlannedPrice,
    Trash,
    AddFromCatalog,
    AddSerialNumbersTable,
    SelectFromInvoiceTable,
} from '../../invoice';
import { Cost } from './cost';

import GeneralInformation from './generalFields';

const math = require('exact-math');
const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

const GeneralOperation = props => {
    const {
        // States
        id,
        onScan,
        form,
        summaries,
        productionInfo,
        selectedProducts,
        invoiceCurrencyCode,
        setProductContents,
        productContents,
        selectedOrdersWithProduct,
        setSelectedOrdersWithProduct,

        // Actions
        handleResetInvoiceFields,
        handleEditInvoice,
        handlePlannedPriceChange,
        handlePlannedCostChange,
        setSelectedProducts,
        setTotalPrice,
        setTotalCost,

        // Loadings
        productsListByNameLoading,
        invoiceInfoLoading = false,

        // DATA
        contracts,
        users,
        mainCurrency,
        allProducts,
        totalPrice,
        totalCost,

        // API
        fetchMainCurrency,
        updateInvoiceCurrencyCode,
        fetchContracts,
        fetchCurrencies,
        clearProductsByName,
        fetchPurchaseCatalogs,
        fetchPurchaseProductsByName,
        fetchPurchaseProductsFromCatalog,
        fetchPurchaseBarcodesByName,
        scrolled,
        setScrolled,
    } = props;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
    const dispatch = useDispatch();
    const newProductNameRef = useRef(null);
    const newTotalPriceRef = useRef(null);
    const newTotalCostRef = useRef(null);
    const [barcodeInput, setBarcodeInput] = useState(null);
    const { setFieldsValue } = form;
    const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
    const [serialModalIsVisible, setSerialModalIsVisible] = useState(false);
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });
    const [selectedCatalog, setSelectedCatalog] = useState(undefined);
    const [productWithCatalog, setProductsWithCatalog] = useState([]);
    const [selectedRow, setSelectedRow] = useState({});
    const [order, setOrder] = useState(false);
    const handleOrderCheckbox = checked => {
        if (checked) {
            setOrder(true);
            setFieldsValue({ client: undefined, contract: undefined });
        } else {
            setOrder(false);
        }
    };
    const handleTotalCostChange = selectedProducts => {
        let newTotalCost = 0;
        if (selectedProducts?.length > 0) {
            newTotalCost = selectedProducts.reduce(
                (totalCost, { invoiceQuantity, plannedCost }) =>
                    math.add(
                        totalCost,
                        math.mul(
                            Number(invoiceQuantity) || 0,
                            Number(plannedCost) || 0
                        )
                    ),
                0
            );
        }
        setTotalCost({ newTotalCost: roundTo(newTotalCost, 2) });
    };
    const handleTotalPriceChange = selectedProducts => {
        let newTotalPrice = 0;
        if (selectedProducts?.length > 0) {
            newTotalPrice = selectedProducts.reduce(
                (totalPrice, { invoiceQuantity, plannedPrice }) =>
                    math.add(
                        totalPrice,
                        math.mul(
                            Number(invoiceQuantity) || 0,
                            Number(plannedPrice) || 0
                        )
                    ),
                0
            );
        }
        setTotalPrice({ newTotalPrice: roundTo(newTotalPrice, 2) });
    };
    useEffect(() => {
        clearTimeout(newTotalPriceRef.current);
        newTotalPriceRef.current = setTimeout(
            () => handleTotalPriceChange(selectedProducts),
            600
        );
        clearTimeout(newTotalCostRef.current);
        newTotalCostRef.current = setTimeout(
            () => handleTotalCostChange(selectedProducts),
            600
        );
    }, [selectedProducts]);

    // Toggle Add Serial Numbers Modal
    const toggleSerialModal = () => {
        setSerialModalIsVisible(
            prevSerialModalIsVisible => !prevSerialModalIsVisible
        );
    };

    const handleModalClick = row => {
        setSelectedRow(row);
        toggleSerialModal();
    };

    const defaultColumns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 90,
            render: (_value, row, index) =>
                row.isTotal ? 'Toplam' : index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            width: 150,
            align: 'left',
            ellipsis: true,
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Say',
            dataIndex: 'invoiceQuantity',
            align: 'center',
            width: 120,
            render: (value, row) =>
                row.isTotal ? null : (
                    <Quantity
                        row={row}
                        value={value}
                        handleQuantityChange={handleQuantityChange}
                        invoiceInfo={productionInfo}
                        scrolled={scrolled}
                        setScrolled={setScrolled}
                        limit={100000000}
                    />
                ),
        },
        {
            title: 'Planlaşdırılmış maya dəyəri',
            dataIndex: 'plannedCost',
            align: 'center',
            width: 130,
            render: (value, row) =>
                row.isTotal ? null : (
                    <PlannedPrice
                        row={row}
                        value={value}
                        handlePriceChange={handlePlannedCostChange}
                    />
                ),
        },
        {
            title: 'Planlaşdırılmış satış qiyməti',
            dataIndex: 'plannedPrice',
            align: 'center',
            width: 130,
            render: (value, row) =>
                row.isTotal ? null : (
                    <PlannedPrice
                        row={row}
                        value={value}
                        handlePriceChange={handlePlannedPriceChange}
                    />
                ),
        },
        {
            title: 'Cəmi maya dəyəri',
            dataIndex: 'total',
            width: 120,
            align: 'center',
            render: (_, row) =>
                row.isTotal
                    ? `${formatNumberToLocale(defaultNumberFormat(totalCost))}
          ${invoiceCurrencyCode}`
                    : `${handleProductCost(row)} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Cəmi satış qiyməti',
            dataIndex: 'total',
            width: 120,
            align: 'center',
            render: (_, row) =>
                row.isTotal
                    ? `${formatNumberToLocale(defaultNumberFormat(totalPrice))}
      ${invoiceCurrencyCode}`
                    : `${handleProductPrice(row)} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Sil',
            dataIndex: 'id',
            key: 'trashIcon',
            align: 'center',
            width: 70,
            render: (value, row) =>
                row.isTotal ? null : Number(row.usedQuantity) === 0 ||
                  row.usedQuantity === undefined ? (
                    <Trash
                        value={value}
                        selectedProducts={selectedProducts}
                        handleProductRemove={handleProductRemove}
                    />
                ) : null,
        },
    ];

    const stockColumns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 90,
            render: (_value, row, index) =>
                row.isTotal ? 'Toplam' : index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            width: 150,
            align: 'left',
            ellipsis: true,
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Say',
            dataIndex: 'invoiceQuantity',
            align: 'center',
            width: 120,
            render: (value, row) =>
                row.isTotal ? null : (
                    <Quantity
                        row={row}
                        value={value}
                        handleQuantityChange={handleQuantityChange}
                        invoiceInfo={productionInfo}
                        scrolled={scrolled}
                        setScrolled={setScrolled}
                        limit={100000000}
                    />
                ),
        },
        {
            title: 'SN əlavə et',
            key: 'addFromInvoice',
            width: 120,
            align: 'center',
            render: (_, row) =>
                !row.isTotal && (
                    <SelectFromInvoiceTable
                        handleClick={() => handleModalClick(row)}
                        disabled={row.catalog.isWithoutSerialNumber}
                    />
                ),
        },
        {
            title: 'Planlaşdırılmış maya dəyəri',
            dataIndex: 'plannedCost',
            align: 'center',
            width: 130,
            render: (value, row) =>
                row.isTotal ? null : (
                    <PlannedPrice
                        row={row}
                        value={value}
                        handlePriceChange={handlePlannedCostChange}
                    />
                ),
        },
        {
            title: 'Planlaşdırılmış satış qiyməti',
            dataIndex: 'plannedPrice',
            align: 'center',
            width: 130,
            render: (value, row) =>
                row.isTotal ? null : (
                    <PlannedPrice
                        row={row}
                        value={value}
                        handlePriceChange={handlePlannedPriceChange}
                    />
                ),
        },
        {
            title: 'Cəmi maya dəyəri',
            dataIndex: 'total',
            width: 120,
            align: 'center',
            render: (_, row) =>
                row.isTotal
                    ? `${formatNumberToLocale(defaultNumberFormat(totalCost))}
          ${invoiceCurrencyCode}`
                    : `${handleProductCost(row)} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Cəmi satış qiyməti',
            dataIndex: 'total',
            width: 120,
            align: 'center',
            render: (_, row) =>
                row.isTotal
                    ? `${formatNumberToLocale(defaultNumberFormat(totalPrice))}
      ${invoiceCurrencyCode}`
                    : `${handleProductPrice(row)} ${invoiceCurrencyCode}`,
        },
        {
            title: 'Sil',
            dataIndex: 'id',
            key: 'trashIcon',
            align: 'center',
            width: 70,
            render: (value, row) =>
                row.isTotal ? null : Number(row.usedQuantity) === 0 ||
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
                    label: 'fetchProductsListByBarcode',
                    filters: {
                        q: sCode,
                        serviceType: 1,
                    },
                    onSuccessCallback: ({ data }) => {
                        if (data && data.length !== 0) {
                            const hasProduct = selectedProducts?.find(
                                product => product.id === data.id
                            );
                            if (hasProduct) {
                                handleQuantityChange(
                                    data.id,
                                    Number(hasProduct.invoiceQuantity) + 1
                                );
                            } else {
                                const totalQuantity = selectedProducts.reduce(
                                    (total_amount, { invoiceQuantity }) =>
                                        math.add(
                                            total_amount,
                                            Number(invoiceQuantity) || 0
                                        ),
                                    0
                                );
                                const total = selectedProducts.reduce(
                                    (total_amount, { invoiceQuantity }) =>
                                        math.add(
                                            total_amount,
                                            math.mul(
                                                summaries.find(
                                                    item =>
                                                        item.label === 'Cəmi'
                                                ).value > 0
                                                    ? math.div(
                                                          Number(
                                                              summaries.find(
                                                                  item =>
                                                                      item.label ===
                                                                      'Cəmi'
                                                              ).value
                                                          ) || 0,
                                                          math.add(
                                                              Number(
                                                                  totalQuantity
                                                              ),
                                                              1
                                                          )
                                                      )
                                                    : 0,
                                                Number(invoiceQuantity || 1)
                                            ) || 0
                                        ),
                                    0
                                );
                                const cost =
                                    summaries.find(
                                        item => item.label === 'Cəmi'
                                    ).value > 0
                                        ? math.div(
                                              Number(
                                                  summaries.find(
                                                      item =>
                                                          item.label === 'Cəmi'
                                                  ).value
                                              ) || 0,
                                              totalQuantity + 1
                                          )
                                        : 0;
                                const notRoundedCost =
                                    summaries.find(
                                        item => item.label === 'Cəmi'
                                    ).value > 0
                                        ? new BigNumber(
                                              summaries.find(
                                                  item => item.label === 'Cəmi'
                                              ).value
                                          ).dividedBy(
                                              new BigNumber(totalQuantity).plus(
                                                  new BigNumber(1)
                                              ) || 1
                                          )
                                        : 0;
                                const cost_percentage =
                                    cost > 0
                                        ? math.div(
                                              math.mul(Number(cost), 100),
                                              Number(total) || 1
                                          )
                                        : 0;
                                dispatch(
                                    setSelectedProducts({
                                        newSelectedProducts: [
                                            ...selectedProducts,
                                            {
                                                ...data,
                                                cost_percentage: roundTo(
                                                    Number(cost_percentage),
                                                    2
                                                ),
                                                cost: roundTo(Number(cost), 4),
                                                total_price: Number(
                                                    notRoundedCost
                                                ),
                                                invoiceQuantity: 1,
                                                plannedCost: 0,
                                                plannedPrice: 0,
                                            },
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

    const handleQuantityChange = (productId, newQuantity) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (
            (re.test(Number(newQuantity)) && newQuantity <= 100000000) ||
            newQuantity === ''
        ) {
            const totalQuantity = selectedProducts.reduce(
                (total_amount, { invoiceQuantity }) =>
                    math.add(total_amount, Number(invoiceQuantity) || 0),
                0
            );
            const selectedQuantity = selectedProducts.find(
                item => item.id === productId
            ).invoiceQuantity;
            const cost =
                summaries.find(item => item.label === 'Cəmi').value > 0
                    ? newQuantity > 0
                        ? math.div(
                              Number(
                                  summaries.find(item => item.label === 'Cəmi')
                                      .value
                              ) || 0,
                              math.add(
                                  Number(totalQuantity),
                                  math.sub(
                                      Number(newQuantity),
                                      Number(selectedQuantity)
                                  )
                              ) || 1
                          )
                        : 0
                    : 0;

            const notRoundedCost =
                summaries.find(item => item.label === 'Cəmi').value > 0
                    ? newQuantity > 0
                        ? new BigNumber(
                              summaries.find(
                                  item => item.label === 'Cəmi'
                              ).value
                          ).dividedBy(
                              new BigNumber(totalQuantity).plus(
                                  new BigNumber(newQuantity).minus(
                                      new BigNumber(selectedQuantity)
                                  )
                              ) || 1
                          )
                        : 0
                    : 0;

            const total = selectedProducts.reduce(
                (total_amount, { invoiceQuantity }) =>
                    math.add(
                        total_amount,
                        math.mul(
                            Number(cost) || 0,
                            Number(invoiceQuantity || 0)
                        ) || 0
                    ),
                0
            );

            const cost_percentage =
                cost > 0
                    ? math.div(
                          math.mul(Number(cost), 100),
                          math.add(
                              Number(total || 0),
                              math.mul(Number(cost), Number(newQuantity))
                          )
                      )
                    : 0;
            const newSelectedProducts = selectedProducts.map(
                selectedProduct => {
                    if (selectedProduct.id === productId) {
                        return {
                            ...selectedProduct,
                            cost_percentage: roundTo(
                                Number(cost_percentage),
                                2
                            ),
                            cost: roundTo(Number(cost), 4),
                            invoiceQuantity: newQuantity,
                            total_price: Number(notRoundedCost),
                        };
                    }
                    return {
                        ...selectedProduct,
                        cost_percentage: roundTo(Number(cost_percentage), 2),
                        cost: roundTo(Number(cost), 4),
                        total_price: Number(notRoundedCost),
                    };
                }
            );
            setSelectedProducts({ newSelectedProducts });
        }
    };
    // Toggle Add Catalog Modal
    const toggleCatalogModal = () => {
        setCatalogModalIsVisible(
            prevCatalogModalIsVisible => !prevCatalogModalIsVisible
        );
    };

    // Handle product's total price
    const handleProductPrice = product => {
        const { invoiceQuantity, plannedPrice } = product;
        return formatNumberToLocale(
            defaultNumberFormat(
                math.mul(
                    Number(invoiceQuantity) || 0,
                    Number(plannedPrice) || 0
                )
            )
        );
    }; // Handle product's total cost
    const handleProductCost = product => {
        const { invoiceQuantity, plannedCost } = product;
        return formatNumberToLocale(
            defaultNumberFormat(
                math.mul(Number(invoiceQuantity) || 0, Number(plannedCost) || 0)
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
                            serviceType: 1,
                            businessUnitIds: id
                                ? productionInfo?.businessUnitId === null
                                    ? [0]
                                    : [productionInfo?.businessUnitId]
                                : BUSINESS_TKN_UNIT
                                ? [BUSINESS_TKN_UNIT]
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
        fetchPurchaseBarcodesByName({
            label: 'fetchProductsListByBarcode',
            filters: {
                q: productBarcode,
                serviceType: 1,
            },
            onSuccessCallback: ({ data }) => {
                if (data && data.length !== 0) {
                    const hasProduct = selectedProducts?.find(
                        product => product.id === data.id
                    );
                    if (hasProduct) {
                        handleQuantityChange(
                            data.id,
                            Number(hasProduct.invoiceQuantity) + 1
                        );
                    } else {
                        const totalQuantity = selectedProducts.reduce(
                            (total_amount, { invoiceQuantity }) =>
                                math.add(
                                    total_amount,
                                    Number(invoiceQuantity) || 0
                                ),
                            0
                        );
                        const total = selectedProducts.reduce(
                            (total_amount, { invoiceQuantity }) =>
                                math.add(
                                    total_amount,
                                    math.mul(
                                        summaries.find(
                                            item => item.label === 'Cəmi'
                                        ).value > 0
                                            ? math.div(
                                                  Number(
                                                      summaries.find(
                                                          item =>
                                                              item.label ===
                                                              'Cəmi'
                                                      ).value
                                                  ) || 0,
                                                  math.add(
                                                      Number(totalQuantity),
                                                      1
                                                  ) || 1
                                              )
                                            : 0,
                                        Number(invoiceQuantity || 1)
                                    ) || 0
                                ),
                            0
                        );
                        const cost =
                            summaries.find(item => item.label === 'Cəmi')
                                .value > 0
                                ? math.div(
                                      Number(
                                          summaries.find(
                                              item => item.label === 'Cəmi'
                                          ).value
                                      ) || 0,
                                      math.add(Number(totalQuantity), 1)
                                  )
                                : 0;

                        const notRoundedCost =
                            summaries.find(item => item.label === 'Cəmi')
                                .value > 0
                                ? new BigNumber(
                                      summaries.find(
                                          item => item.label === 'Cəmi'
                                      ).value
                                  ).dividedBy(
                                      new BigNumber(totalQuantity).plus(
                                          new BigNumber(1)
                                      )
                                  )
                                : 0;
                        const cost_percentage =
                            cost > 0
                                ? math.div(
                                      math.mul(Number(cost), 100),
                                      Number(total) || 1
                                  )
                                : 0;

                        dispatch(
                            setSelectedProducts({
                                newSelectedProducts: [
                                    ...selectedProducts,
                                    {
                                        ...data,
                                        cost_percentage: roundTo(
                                            Number(cost_percentage),
                                            2
                                        ),
                                        cost: roundTo(Number(cost), 4),
                                        total_price: Number(notRoundedCost),
                                        plannedCost: 0,
                                        plannedPrice: 0,
                                        invoiceQuantity: 1,
                                    },
                                ],
                            })
                        );
                    }
                }
                setBarcodeInput(null);
            },
        });
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
            filters: { serviceType: 1, ...defaultFilters },
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
                    ? productionInfo?.businessUnitId === null
                        ? [0]
                        : [productionInfo?.businessUnitId]
                    :  BUSINESS_TKN_UNIT
                    ? [BUSINESS_TKN_UNIT]
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
                    ? productionInfo?.businessUnitId === null
                        ? [0]
                        : [productionInfo?.businessUnitId]
                    :  BUSINESS_TKN_UNIT
                    ? [ BUSINESS_TKN_UNIT]
                    : undefined,
            },
        });
    };

    const handleProductRemove = productId => {
        const newSelectedProducts = selectedProducts.filter(
            selectedProduct => selectedProduct.id !== productId
        );
        setSelectedOrdersWithProduct(
            selectedOrdersWithProduct.filter(selectedProduct =>
                selectedProducts
                    .filter(
                        selectedProduct => selectedProduct.id == productId
                    )[0]
                    .materials.map(({ id }) => id)
                    .includes(selectedProduct.id)
            )
        );
        dispatch(setSelectedProducts({ newSelectedProducts }));
    };

    const updateEditInvoice = selectedContract => {
        const {
            clientId,
            salesmanId,
            startDate,
            currencyId,
            description,
            contractId,
            endDate,
            invoiceProducts,
            currencyCode,
            productionMaterialsStockId,
        } = productionInfo;
        const { content } = invoiceProducts;
        const selectedProducts = {};
        const total = content.reduce(
            (total_amount, { quantity, cost }) =>
                math.add(
                    total_amount,
                    math.mul(Number(cost), Number(quantity)) || 0
                ),
            0
        );
        content.forEach(
            ({
                invoiceProductId,
                productId,
                productName,
                quantity,
                pricePerUnit,
                isServiceType,
                isWithoutSerialNumber,
                unitOfMeasurementName,
                catalogId,
                catalogName,
                serialNumber,
                cost,
                planned_cost,
                planned_price,
                materials,
                usedQuantity,
                quantityInStock,
            }) => {
                if (selectedProducts[productId]) {
                    selectedProducts[productId] = {
                        ...selectedProducts[productId],
                        serialNumbers: serialNumber
                            ? [
                                  ...selectedProducts[productId]?.serialNumbers,
                                  serialNumber,
                              ]
                            : undefined,
                        invoiceQuantity: math.add(
                            roundTo(Number(quantity), 2),
                            selectedProducts[productId].invoiceQuantity
                        ),
                        usedSerialNumber:
                            usedQuantity > 0 && serialNumber
                                ? [
                                      ...selectedProducts[productId]
                                          .usedSerialNumber,
                                      serialNumber,
                                  ]
                                : selectedProducts[productId].usedSerialNumber,
                        usedQuantity: roundToDown(
                            math.add(
                                Number(usedQuantity || 0),
                                Number(selectedProducts[productId].usedQuantity)
                            )
                        ),
                    };
                } else {
                    const productDetails = allProducts.find(
                        product => product.id === productId
                    );
                    selectedProducts[productId] = {
                        id: productId,
                        invoiceProductId,
                        name: productName,
                        barcode: undefined,
                        unitOfMeasurementName,
                        serialNumbers: serialNumber ? [serialNumber] : [],
                        quantity: Number(quantityInStock || 0),
                        invoiceQuantity: roundTo(Number(quantity), 2),
                        invoicePrice: roundTo(Number(pricePerUnit), 2),
                        cost: roundTo(Number(cost), 4),
                        total_price: cost,
                        plannedCost: Number(planned_cost),
                        plannedPrice: Number(planned_price),
                        materials,
                        usedQuantity: roundToDown(usedQuantity),
                        usedSerialNumber:
                            Number(usedQuantity) > 0
                                ? serialNumber
                                    ? [serialNumber]
                                    : []
                                : [],
                        cost_percentage:
                            Number(cost) > 0
                                ? math.div(
                                      math.mul(Number(cost), 100),
                                      Number(total) || 1
                                  )
                                : 0,
                        catalog: {
                            id: catalogId,
                            name: catalogName,
                            isWithoutSerialNumber,
                            isServiceType,
                        },
                    };
                }
            }
        );

        handleEditInvoice({
            selectedProducts: Object.values(selectedProducts),
            description: description || undefined,
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
        });
        if (clientId === null) {
            handleOrderCheckbox(true);
        } else {
            handleOrderCheckbox(false);
        }
        setFieldsValue({
            dateFrom: moment(
                startDate?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1'),
                fullDateTimeWithSecond
            ),
            dateTo:
                endDate === null
                    ? undefined
                    : moment(
                          endDate?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1'),
                          fullDateTimeWithSecond
                      ),
            client: clientId || undefined,
            salesman: salesmanId,
            contract: contractId || undefined,
            currency: currencyId,
            productionMaterialsStock: productionMaterialsStockId || undefined,
        });
    };
    useEffect(() => {
        if (productionInfo) {
            const { contractId } = productionInfo;
            if (contractId && contracts.length > 0) {
                const selectedContract = contracts.find(
                    ({ id }) => id === contractId
                );
                updateEditInvoice(selectedContract);
            } else if (!contractId) {
                updateEditInvoice(undefined);
            }
        }
    }, [productionInfo, contracts]);

    useEffect(() => {
        fetchCurrencies();
        fetchMainCurrency();
        return () => {
            handleResetInvoiceFields();
        };
    }, []);
    useEffect(() => {
        if (id) {
            if (productionInfo) {
                fetchContracts({
                    limit: 1000,
                    status: 1,
                    invoiceId: id,
                    directions: [2],
                    businessUnitIds:
                        productionInfo?.businessUnitId === null
                            ? [0]
                            : [productionInfo?.businessUnitId],
                });
            }
        } else if ( BUSINESS_TKN_UNIT) {
            fetchContracts({
                limit: 1000,
                status: 1,
                directions: [2],
                businessUnitIds: [ BUSINESS_TKN_UNIT],
            });
        } else {
            fetchContracts({ limit: 1000, status: 1, directions: [2] });
        }
    }, [ BUSINESS_TKN_UNIT, id, productionInfo]);

    useEffect(() => {
        setFieldsValue({ currency: mainCurrency?.id });
        updateInvoiceCurrencyCode(mainCurrency?.code);
    }, [mainCurrency]);

    const columnData = useMemo(() => {
        let column = [];
        if (invoiceInfoLoading) {
            column = [];
        } else if (
            id &&
            (productionInfo && productionInfo.stockToId !== null)
        ) {
            column = stockColumns;
        } else if (
            !id ||
            (productionInfo && productionInfo.stockToId === null)
        ) {
            column = defaultColumns;
        }
        return column;
    }, [
        productionInfo,
        id,
        invoiceInfoLoading,
        selectedProducts,
        totalCost,
        totalPrice,
    ]);
    return (
        <>
            <AddFromCatalog
                productionInfo={productionInfo}
                summaries={summaries}
                isVisible={catalogModalIsVisible}
                toggleModal={toggleCatalogModal}
                fetchProducts={fetchProductsFromCatalog}
                fetchCatalogs={fetchCatalogs}
                catalogs={catalogs}
                setSelectedCatalog={setSelectedCatalog}
                filteredProducts={productWithCatalog}
                fetchProductFromCatalogs={fetchProductFromCatalogs}
            />
            <AddSerialNumbersTable
                selectedRow={selectedRow}
                isVisible={serialModalIsVisible}
                toggleModal={toggleSerialModal}
            />
            <div className={styles.parentBox}>
                <div className={styles.paper}>
                    <Spin spinning={invoiceInfoLoading}>
                        <GeneralInformation
                            productionInfo={productionInfo}
                            form={form}
                            order={order}
                            handleOrderCheckbox={handleOrderCheckbox}
                        />
                        <Invoice
                            productionInfo={productionInfo}
                            form={form}
                            columns={
                                columnData
                                // invoiceInfoLoading? [] : (!id || (productionInfo && productionInfo.stockToId === null)) ? defaultColumns : stockColumns
                            }
                            summaries={summaries}
                            toggleCatalogModal={toggleCatalogModal}
                            productSelectLoading={productsListByNameLoading}
                            handleProductNameChange={handleProductNameChange}
                            handleChangeSearch={handleChangeSearch}
                            handleProductBarcodeChange={
                                handleProductBarcodeChange
                            }
                            setBarcodeInput={setBarcodeInput}
                            barcodeInput={barcodeInput}
                            catalogModalIsDisabled={false}
                        />
                    </Spin>
                </div>
            </div>
            <Cost form={form} summaries={summaries} />
        </>
    );
};

const mapStateToProps = state => ({
    users: state.usersReducer.users,
    clients: state.contactsReducer.clients,
    contracts: state.contractsReducer.contracts,
    currencies: state.kassaReducer.currencies,
    endPrice: state.salesOperation.endPrice,
    contractDetails: state.salesOperation.contractDetails,
    selectedProducts: state.salesOperation.selectedProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    products: state.salesOperation.productsByName,
    profile: state.profileReducer.profile, // used for operator id
    mainCurrency: state.kassaReducer.mainCurrency,
    invoiceInfoLoading: state.loadings.invoicesInfo,
    allProducts: state.productReducer.products,
    totalPrice: state.salesOperation.totalPrice,
    totalCost: state.salesOperation.totalCost,
});

export const GeneralInfo = connect(
    mapStateToProps,
    {
        setTotalPrice,
        setTotalCost,
        clearProductsByName,
        handleResetInvoiceFields,
        handlePlannedPriceChange,
        handlePlannedCostChange,
        deleteInvoice,
        handleEditInvoice,
        // API
        fetchContracts,
        fetchCurrencies,
        fetchPurchaseProductsByName,
        fetchPurchaseCatalogs,
        fetchPurchaseProductsFromCatalog,
        fetchSalesProductsFromCatalog,
        updateInvoiceCurrencyCode,
        fetchMainCurrency,
        fetchPurchaseBarcodesByName,
        setSelectedProducts,
    }
)(GeneralOperation);
