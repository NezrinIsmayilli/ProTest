/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    Sidebar,
    ProSelect,
    ProSidebarItem,
    ProTypeFilterButton,
    ProSearch,
    ProTimeInterval,
    ProAsyncSelect,
} from 'components/Lib';

import { Col, Row, Select, Spin, Icon } from 'antd';
import { useCatalog } from 'hooks';
import { fetchMeasurements } from 'store/actions/measurements';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchContacts } from 'store/actions/contact';
import { fetchCatalogs, fetchFilteredCatalogs } from 'store/actions/catalog';
import { fetchSuppliers } from 'store/actions/contacts-new';
import { fetchStocks } from 'store/actions/stock';
import { fetchProducts } from 'store/actions/product';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import styles from '../styles.module.scss';

const { Option } = Select;

const WarehouseSideBar = props => {
    const {
        filters,
        currencyRate,
        currenciesLoading,
        measurementsLoading,
        handleCurrencyChange,
        fetchMeasurements,
        fetchCatalogs,
        fetchSuppliers,
        currencies,
        fetchCurrencies,
        onFilter,
        fetchStocks,
        fetchProducts,
        fetchFilteredCatalogs,
        profile,
        handleChange,
        fetchBusinessUnitList,
        fetchContacts,
        activeTableTab,
        openedSidebar,
        setOpenedSidebar
    } = props;

    const [subCatalogs, setSubCatalogs] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [
        filterSelectedMeauserments,
        setFilterSelectedMeauserments,
    ] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [filterSelectedSupplier, setFilterSelectedSupplier] = useState([]);
    const [selectedType, setSelectedType] = useState(
        filters.isSerialNumber ? Number(filters.isSerialNumber) : null
    );
    const [selectedProducts, setSelectedProducts] = useState(
        filters.invoiceValue ? Number(filters.invoiceValue) : null
    );
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);
    const [filterSelectedStocks, setFilterSelectedStocks] = useState([]);
    const [componentIsMounted, setComponentIsMounted] = useState(false);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [category, setCategory] = useState(null);
    const [subcategory, setSubCategory] = useState(null);
    const [filtered, setFiltered] = useState(false);
    const [productCode, setProductCode] = useState(
        filters.productCode ? filters.productCode : null
    );
    const [serialNumber, setSerialNumber] = useState(
        filters.serialNumber ? filters.serialNumber : null
    );
    const [barCode, setBarCode] = useState(
        filters.barcode ? filters.barcode : null
    );
    const [selectedCatalogs, setSelectedCatalogs] = useState([]);
    const [filterSelectedProduct, setFilterSelectedProduct] = useState([]);
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });
    const [filterSelectedCatalog, setFilterSelectedCatalog] = useState({
        root: [],
    });
    const [description, setDescription] = useState(
        filters.description ? filters.description : undefined
    );
    const [products, setProducts] = useState([]);
    const {
        parentCatalogs,
        childCatalogs,
        handleParentCatalogsChange,
        handleChildCatalogsChange,
    } = useCatalog();

    useEffect(() => {
        if (catalogs.root.length === 0) fetchCatalogs();
        // fetchProducts({ filters: { isDeleted: 0 } });
        fetchCurrencies();
    }, []);

    useEffect(() => {
        if (filters?.businessUnitIds) {
            ajaxStocksSelectRequest(1, 20, '', 1);
        } else {
            ajaxStocksSelectRequest(1, 20, '', 1);
        }
    }, [filters.businessUnitIds]);

    const handleDefaultFilters = (type, value) => {
        handleChange(1);
        onFilter(type, value);
    };

    // useEffect(() => {
    //     if (componentIsMounted) {
    //         onFilter(
    //             'rootCatalogs',
    //             parentCatalogs.map(parentCatalog => parentCatalog.id)
    //         );
    //         onFilter(
    //             'productCatalogs',
    //             childCatalogs.map(childCatalog => childCatalog.id)
    //         );
    //     } else {
    //         setComponentIsMounted(true);
    //     }
    // }, [parentCatalogs, childCatalogs]);

    useEffect(() => {
        if (componentIsMounted) {
            onFilter(
                'rootCatalogs',
                parentCatalogs.map(parentCatalog => parentCatalog.id)
            );
            if (category) {
                handleChange(1);
            }
        } else {
            setComponentIsMounted(true);
        }
    }, [parentCatalogs]);

    useEffect(() => {
        if (componentIsMounted) {
            onFilter(
                'productCatalogs',
                childCatalogs.map(childCatalog => childCatalog.id)
            );
            if (subcategory) {
                handleChange(1);
            }
        } else {
            setComponentIsMounted(true);
        }
    }, [childCatalogs]);

    useEffect(() => {
        if (
            filters.rootCatalogs &&
            catalogs.root?.length &&
            filterSelectedCatalog.root?.length &&
            !filtered
        ) {
            const catalogOptions = filterSelectedCatalog.root?.filter(catalog =>
                filters.rootCatalogs.map(id => Number(id)).includes(catalog.id)
            );
            const Options = catalogOptions.map(catalog => ({
                props: { catalog },
            }));
            handleParentCatalogsChange(
                filters.rootCatalogs.map(Number),
                Options
            );
            setFiltered(true);
        }
    }, [catalogs.root, filterSelectedCatalog]);

    const handleGetChildCats = v => {
        const catsIds = String(v).split(',');
        setSubCatalogs([]);
        catsIds.forEach(v => {
            if (catalogs.children[v] && catalogs.children[v].length > 0) {
                setSubCatalogs([...subCatalogs, ...catalogs.children[v]]);
            }
        });
    };

    useEffect(() => {
        if (measurements.length === 0) fetchMeasurements();
        if (filters.businessUnitIds) {
            fetchBusinessUnitList({
                filters: {
                    isDeleted: 0,
                    businessUnitIds: profile.businessUnits?.map(({ id }) => id),
                    ids: filters.businessUnitIds.map(Number),
                },
                onSuccess: data => {
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
                    setFilterSelectedBusinessUnit(appendList);
                },
            });
        }
        if (filters.stocks) {
            const defaultFilter = {
                businessUnitIds: filters?.businessUnitIds
                    ? filters?.businessUnitIds
                    : undefined,
                ids: filters.stocks.map(Number),
            };
            fetchStocks(defaultFilter, data => {
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
                setFilterSelectedStocks(appendList);
            });
        }
        if (filters.rootCatalogs) {
            fetchFilteredCatalogs(
                { ids: filters.rootCatalogs.map(Number) },
                data => {
                    let appendList = {};
                    if (data.data) {
                        appendList = data.data;
                    }
                    setFilterSelectedCatalog(appendList);
                }
            );
        }
        if (filters.products) {
            fetchProducts({
                filters: { ids: filters.products.map(Number) },
                callback: data => {
                    let appendList = {};
                    if (data.data) {
                        appendList = data.data;
                    }
                    setFilterSelectedProduct(appendList);
                },
            });
        }
        if (filters.suppliers) {
            const filter = {
                ids: filters.suppliers.map(Number),
                categories: [4],
            };
            fetchContacts(filter, data => {
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
                setFilterSelectedSupplier(appendList);
            });
        }
        if (filters.unitOfMeasurements) {
            const filter = {
                ids: filters.unitOfMeasurements.map(Number),
            };
            fetchMeasurements(filter, data => {
                let appendList = {};
                if (data.data) {
                    appendList = data.data;
                }
                setFilterSelectedMeauserments(appendList);
            });
        }
        handleChange(filters.page ? filters.page : 1);
    }, []);

    const handleFilterType = (value = null) => {
        handleChange(1);
        if (value) {
            setSelectedType(value);
            onFilter('isSerialNumber', [value]);
        } else {
            setSelectedType(null);
            onFilter('isSerialNumber', null);
        }
    };
    const handleFilterProducts = (value = null) => {
        onFilter('invoiceValue', value);
        if (value) {
            setSelectedProducts(value);
            if (value === 1) {
                onFilter(
                    activeTableTab === 2
                        ? 'attachedInvoiceTypes'
                        : 'invoiceTypes',
                    [11]
                );
            } else if (value === 2) {
                onFilter(
                    activeTableTab === 2
                        ? 'attachedInvoiceTypes'
                        : 'invoiceTypes',
                    [1, 3, 5, 7, 10]
                );
            }
        } else {
            setSelectedProducts(null);
            onFilter(
                activeTableTab === 2 ? 'attachedInvoiceTypes' : 'invoiceTypes',
                [1, 3, 5, 7, 10, 11]
            );
        }
        handleChange(1);
    };
    const handleSearchCodeFilter = value => {
        handleChange(1);
        if (value) {
            onFilter('productCode', value);
        } else {
            onFilter('productCode', null);
        }
    };
    const handleSearchSerialNumberFilter = value => {
        handleChange(1);
        if (value) {
            onFilter('serialNumber', value);
        } else {
            onFilter('serialNumber', null);
        }
    };
    const handleSearchBarcodeFilter = value => {
        handleChange(1);
        if (value) {
            onFilter('barcode', value);
        } else {
            onFilter('barcode', null);
        }
    };

    const handleInterval = (startValue, endValue) => {
        handleChange(1);
        onFilter('daysCountInStockFrom', startValue);
        onFilter('daysCountInStockTo', endValue);
    };
    const ajaxBusinessUnitSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = {
            limit,
            page,
            name: search,
            isDeleted: 0,
            businessUnitIds: profile.businessUnits?.map(({ id }) => id),
        };
        fetchBusinessUnitList({
            filters,
            onSuccess: data => {
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
                    setBusinessUnits(appendList);
                } else {
                    setBusinessUnits(businessUnits.concat(appendList));
                }
            },
        });
    };

    const ajaxStocksSelectRequest = (
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
            businessUnitIds: filters?.businessUnitIds
                ? filters?.businessUnitIds
                : undefined,
        };
        fetchStocks(defaultFilters, data => {
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
                setStocks(appendList);
            } else {
                setStocks(stocks.concat(appendList));
            }
        });
    };

    const ajaxSuppliersSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = {
            limit,
            page,
            categories: [4],
            name: search,
        };
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
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setSuppliers(appendList);
            } else {
                setSuppliers(suppliers.concat(appendList));
            }
        });
    };

    const ajaxCatalogsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchFilteredCatalogs(defaultFilters, data => {
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
        });
    };

    const ajaxProductsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, q: search, isDeleted: 0 };
        fetchProducts({
            filters: defaultFilters,
            callback: data => {
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
            },
        });
    };

    const ajaxMeasurementSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchMeasurements(defaultFilters, data => {
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
                setMeasurements(appendList);
            } else {
                setMeasurements(measurements.concat(appendList));
            }
        });
    };

    const handleDescriptionChange = (e, value) => {
        setDescription(e.target.value);
        if (e.target.value === '') {
            onFilter('description', value);
            handleChange(1);
        }
    };

    return (
        <Sidebar
            title="Anbar"
            openedSidebar={openedSidebar}
            setOpenedSidebar={setOpenedSidebar}
        >
            {businessUnits?.length === 1 &&
                profile.businessUnits.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProAsyncSelect
                        selectRequest={ajaxBusinessUnitSelectRequest}
                        mode="multiple"
                        valueOnChange={values =>
                            handleDefaultFilters('businessUnitIds', values)
                        }
                        value={
                            filters.businessUnitIds
                                ? filters.businessUnitIds.map(Number)
                                : businessUnits?.length === 1
                                    ? businessUnits[0]?.id === null
                                        ? businessUnits[0]?.name
                                        : businessUnits[0]?.id
                                    : filters.businessUnitIds
                        }
                        disabled={businessUnits?.length === 1}
                        data={
                            filterSelectedBusinessUnit.length > 0
                                ? [
                                    ...filterSelectedBusinessUnit.filter(
                                        item => item.id !== null
                                    ),
                                    ...businessUnits
                                        ?.map(item =>
                                            item.id === null
                                                ? { ...item, id: 0 }
                                                : item
                                        )
                                        .filter(
                                            item =>
                                                !filterSelectedBusinessUnit
                                                    .map(({ id }) => id)
                                                    ?.includes(item.id)
                                        ),
                                ]
                                : businessUnits?.map(item =>
                                    item.id === null
                                        ? { ...item, id: 0 }
                                        : item
                                )
                        }
                        disabledBusinessUnit={businessUnits?.length === 1}
                    />
                </ProSidebarItem>
            )}
            <ProSidebarItem label="Valyutalar">
                <Spin spinning={currenciesLoading}>
                    <Row gutter={[6, 6]} style={{ marginTop: '8px' }}>
                        {currencies.map(currency => (
                            <Col span={8}>
                                <ProTypeFilterButton
                                    label={currency.code}
                                    isActive={
                                        currencyRate.code === currency.code
                                    }
                                    onClick={() =>
                                        handleCurrencyChange(currency)
                                    }
                                />
                            </Col>
                        ))}
                    </Row>
                </Spin>
            </ProSidebarItem>

            <ProSidebarItem label="Hərəkətsizlik müddəti">
                <ProTimeInterval
                    onChangeDate={handleInterval}
                    defaultStartValue={
                        filters.daysCountInStockFrom
                            ? filters.daysCountInStockFrom
                            : undefined
                    }
                    defaultEndValue={
                        filters.daysCountInStockTo
                            ? filters.daysCountInStockTo
                            : undefined
                    }
                />
            </ProSidebarItem>

            <ProSidebarItem label="Seriya nömrə">
                <Row style={{ marginTop: '8px' }}>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={selectedType === null}
                            onClick={() => handleFilterType()}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hə"
                            isActive={selectedType === 1}
                            onClick={() => handleFilterType(1)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Yox"
                            isActive={selectedType === 2}
                            onClick={() => handleFilterType(2)}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Məhsullar">
                <Row style={{ marginTop: '8px' }}>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={selectedProducts === null}
                            onClick={() => handleFilterProducts()}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="İstehsal"
                            isActive={selectedProducts === 1}
                            onClick={() => handleFilterProducts(1)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hazır"
                            isActive={selectedProducts === 2}
                            onClick={() => handleFilterProducts(2)}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Anbar">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxStocksSelectRequest}
                    valueOnChange={warehouses =>
                        handleDefaultFilters('stocks', warehouses)
                    }
                    showArrow
                    data={
                        filterSelectedStocks.length > 0
                            ? [
                                ...filterSelectedStocks,
                                ...stocks.filter(
                                    item =>
                                        !filterSelectedStocks
                                            .map(({ id }) => id)
                                            ?.includes(item.id)
                                ),
                            ]
                            : stocks
                    }
                    value={
                        filters.stocks ? filters.stocks.map(Number) : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Kataloq">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxCatalogsSelectRequest}
                    valueOnChange={newCatalogs => {
                        setCategory(newCatalogs);
                        setSelectedCatalogs([
                            ...selectedCatalogs,
                            ...catalogs.root
                                ?.filter(catalog =>
                                    newCatalogs.includes(catalog.id)
                                )
                                .filter(
                                    d =>
                                        !new Set(
                                            selectedCatalogs.map(de => de.id)
                                        ).has(d.id)
                                ),
                        ]);
                        filterSelectedCatalog.root.length > 0
                            ? handleParentCatalogsChange(
                                newCatalogs,
                                [
                                    ...filterSelectedCatalog.root,
                                    ...catalogs.root.filter(
                                        item =>
                                            !filterSelectedCatalog.root
                                                .map(({ id }) => id)
                                                ?.includes(item.id)
                                    ),
                                ]
                                    ?.filter(catalog =>
                                        newCatalogs.includes(catalog.id)
                                    )
                                    .map(catalog => ({ props: { catalog } }))
                            )
                            : handleParentCatalogsChange(
                                newCatalogs,
                                [
                                    ...selectedCatalogs,
                                    ...catalogs.root?.filter(
                                        d =>
                                            !new Set(
                                                selectedCatalogs.map(
                                                    de => de.id
                                                )
                                            ).has(d.id)
                                    ),
                                ]
                                    ?.filter(catalog =>
                                        newCatalogs.includes(catalog.id)
                                    )
                                    .map(catalog => ({ props: { catalog } }))
                            );
                    }}
                    data={
                        filterSelectedCatalog.root.length > 0
                            ? [
                                ...filterSelectedCatalog.root,
                                ...catalogs.root.filter(
                                    item =>
                                        !filterSelectedCatalog.root
                                            .map(({ id }) => id)
                                            ?.includes(item.id)
                                ),
                            ]
                            : catalogs.root || []
                    }
                    // data={catalogs.root || []}
                    value={
                        filters.rootCatalogs
                            ? filters.rootCatalogs.map(Number)
                            : parentCatalogs.map(
                                parentCatalog => parentCatalog.id
                            )
                    }
                />
            </ProSidebarItem>

            <ProSidebarItem label="Alt kataloq">
                <Select
                    // loading={isLoading}
                    value={
                        filters.productCatalogs
                            ? filters.productCatalogs.map(Number)
                            : childCatalogs.map(childCatalog => childCatalog.id)
                    }
                    onChange={(newCatalogs, options) => {
                        setSubCategory(newCatalogs);
                        handleChildCatalogsChange(newCatalogs, options);
                    }}
                    mode="multiple"
                    placeholder="Seçin"
                    suffixIcon={<Icon component={DownArrow} />}
                    showArrow
                    disabled={!parentCatalogs.length}
                    className={styles.select}
                    size="large"
                    allowClear
                    filterOption={(input, option) =>
                        option.props.children
                            .replace('İ', 'I')
                            .toLowerCase()
                            .includes(input.replace('İ', 'I').toLowerCase())
                    }
                >
                    {parentCatalogs.map(parentCatalog =>
                        catalogs.children[parentCatalog.id]?.map(subCatalog => (
                            <Option
                                key={subCatalog.id}
                                value={subCatalog.id}
                                id={subCatalog.id}
                                className={styles.dropdown}
                                catalog={subCatalog}
                            >
                                {subCatalog.name}
                            </Option>
                        ))
                    )}
                </Select>
            </ProSidebarItem>
            <ProSidebarItem label="Məhsul adı">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxProductsSelectRequest}
                    valueOnChange={products =>
                        handleDefaultFilters('products', products)
                    }
                    showArrow
                    data={
                        filterSelectedProduct.length > 0
                            ? [
                                ...filterSelectedProduct,
                                ...products.filter(
                                    item =>
                                        !filterSelectedProduct
                                            .map(({ id }) => id)
                                            ?.includes(item.id)
                                ),
                            ]
                            : products
                    }
                    value={
                        filters.products
                            ? filters.products.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Məhsul kodu">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchCodeFilter(value)}
                    onChange={e => {
                        setProductCode(e.target.value);
                        if (e.target.value === '') {
                            handleChange(1);
                            handleSearchCodeFilter(undefined);
                        }
                    }}
                    value={productCode}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Seriya nömrəsi">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchSerialNumberFilter(value)}
                    onChange={e => {
                        setSerialNumber(e.target.value);
                        if (e.target.value === '') {
                            handleChange(1);
                            handleSearchSerialNumberFilter(undefined);
                        }
                    }}
                    value={serialNumber}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Barkod">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchBarcodeFilter(value)}
                    onChange={e => {
                        setBarCode(e.target.value);
                        if (e.target.value === '') {
                            handleChange(1);
                            handleSearchBarcodeFilter(undefined);
                        }
                    }}
                    value={barCode}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Təchizatçı">
                <ProAsyncSelect
                    valueOnChange={value =>
                        handleDefaultFilters('suppliers', value)
                    }
                    selectRequest={ajaxSuppliersSelectRequest}
                    mode="multiple"
                    data={
                        filterSelectedSupplier.length > 0
                            ? [
                                ...filterSelectedSupplier,
                                ...suppliers.filter(
                                    item =>
                                        !filterSelectedSupplier
                                            .map(({ id }) => id)
                                            ?.includes(item.id)
                                ),
                            ]
                            : suppliers
                    }
                    value={
                        filters.suppliers
                            ? filters.suppliers.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Ölçü vahidi">
                <ProAsyncSelect
                    valueOnChange={value =>
                        handleDefaultFilters('unitOfMeasurements', value)
                    }
                    selectRequest={ajaxMeasurementSelectRequest}
                    mode="multiple"
                    data={
                        filterSelectedMeauserments.length > 0
                            ? [
                                ...filterSelectedMeauserments,
                                ...measurements.filter(
                                    item =>
                                        !filterSelectedMeauserments
                                            .map(({ id }) => id)
                                            ?.includes(item.id)
                                ),
                            ]
                            : measurements
                    }
                    value={
                        filters.unitOfMeasurements
                            ? filters.unitOfMeasurements.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Əlavə məlumat">
                <ProSearch
                    onSearch={value => {
                        handleChange(1);
                        onFilter('description', value);
                    }}
                    onChange={(e, value) => handleDescriptionChange(e, value)}
                    value={description}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    suppliers: state.newContactsReducer.suppliers,
    catalogs: state.catalogsReducer.catalogs,
    currenciesLoading: state.loadings.fetchCurrencies,
    currencies: state.kassaReducer.currencies,
    stocksLoading: state.stockReducer.isLoading,
    products: state.productReducer.products,
    productsLoading: state.loadings.products,
    measurements: state.measurementsReducer.measurements,
    measurementsLoading: state.loadings.fetchMeasurements,
});

export default connect(
    mapStateToProps,
    {
        fetchStocks,
        fetchCatalogs,
        fetchProducts,
        fetchCurrencies,
        fetchMeasurements,
        fetchBusinessUnitList,
        fetchSuppliers,
        fetchContacts,
        fetchFilteredCatalogs,
    }
)(WarehouseSideBar);
