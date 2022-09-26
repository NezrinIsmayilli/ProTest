/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import {
    Sidebar,
    ProDateRangePicker,
    ProSelect,
    ProSidebarItem,
    ProSearch,
    ProTypeFilterButton,
    ProAsyncSelect,
} from 'components/Lib';
import { useCatalog } from 'hooks';
import { Col, Row, Select, Icon } from 'antd';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
// fetchs
import { fetchStocks } from 'store/actions/stock';
import { fetchProducts } from 'store/actions/product';
import { fetchFilteredCatalogs } from 'store/actions/catalog';
import styles from './styles.module.scss';

const { Option } = Select;
const SoldItemsSidebar = ({
    fetchProducts,
    fetchStocks,
    fetchFilteredCatalogs,
    setStocks,
    onFilter,
    filters,
    businessUnits,
    profile,
    setBusinessUnits,
    fetchBusinessUnitList,
}) => {
    const [selectedType, setSelectedType] = useState(null);
    const [componentIsMounted, setComponentIsMounted] = useState(false);
    const [products, setProducts] = useState([]);
    const [stock, setStock] = useState([]);
    const [catalogs, setCatalogs] = useState({ root: [], children: {} });

    const {
        parentCatalogs,
        childCatalogs,
        handleParentCatalogsChange,
        handleChildCatalogsChange,
    } = useCatalog();

    const [businessUnitLength, setBusinessUnitLength] = useState(2);

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {
                limit: 10,
                page: 1,
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
            onSuccess: data => {
                setBusinessUnitLength(data.data?.length || 0);
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                setStock(appendList);
            } else {
                setStock(stock.concat(appendList));
            }
        });
    };

    useEffect(() => {
        if (componentIsMounted) {
            onFilter(
                'rootCatalogs',
                parentCatalogs.map(parentCatalog => parentCatalog.id)
            );
            onFilter(
                'productCatalogs',
                childCatalogs.map(childCatalog => childCatalog.id)
            );
        } else {
            setComponentIsMounted(true);
        }
    }, [parentCatalogs, childCatalogs]);

    const handleFilterType = (value = null) => {
        if (value) {
            setSelectedType(value);
            onFilter('isSerialNumber', [value]);
        } else {
            setSelectedType(null);
            onFilter('isSerialNumber', null);
        }
    };
    const handleSearchCodeFilter = value => {
        if (value) {
            onFilter('productCode', value);
        } else {
            onFilter('productCode', null);
        }
    };
    const handleSearchSerialNumberFilter = value => {
        if (value) {
            onFilter('serialNumber', value);
        } else {
            onFilter('serialNumber', null);
        }
    };
    const handleSearchBarcodeFilter = value => {
        if (value) {
            onFilter('barcode', value);
        } else {
            onFilter('barcode', null);
        }
    };
    const handleDatePicker = (startValue, endValue) => {
        const startDate = startValue
            ? moment(startValue).format('DD-MM-YYYY')
            : undefined;
        const endDate = endValue
            ? moment(endValue).format('DD-MM-YYYY')
            : undefined;
        onFilter('dateFrom', startDate);
        onFilter('dateTo', endDate);
    };

    useEffect(() => {
        if (filters?.businessUnitIds) {
            ajaxStocksSelectRequest(1, 20, '', 1);
        } else {
            ajaxStocksSelectRequest(1, 20, '', 1);
        }
    }, [filters.businessUnitIds]);

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

    return (
        <Sidebar title="Ticarət">
            {businessUnitLength === 1 &&
            profile.businessUnits.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxBusinessUnitSelectRequest}
                        valueOnChange={values => {
                            onFilter('businessUnitIds', values);
                        }}
                        disabled={businessUnitLength === 1}
                        data={businessUnits?.map(item =>
                            item.id === null ? { ...item, id: 0 } : item
                        )}
                        disabledBusinessUnit={businessUnitLength === 1}
                        value={
                            filters.businessUnitIds
                                ? filters.businessUnitIds.map(Number)
                                : businessUnitLength === 1
                                ? businessUnits[0]?.id === null
                                    ? businessUnits[0]?.name
                                    : businessUnits[0]?.id
                                : filters.businessUnitIds
                        }
                    />
                </ProSidebarItem>
            )}
            <ProSidebarItem label="Tarix">
                <ProDateRangePicker
                    onChangeDate={handleDatePicker}
                    notRequired={false}
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
            <ProSidebarItem label="Anbar">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxStocksSelectRequest}
                    valueOnChange={stocks => setStocks(stocks)}
                    data={stock}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Kateqoriya">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxCatalogsSelectRequest}
                    valueOnChange={newCatalogs => {
                        handleParentCatalogsChange(
                            newCatalogs,
                            catalogs.root
                                ?.filter(catalog =>
                                    newCatalogs.includes(catalog.id)
                                )
                                .map(catalog => ({ props: { catalog } }))
                        );
                    }}
                    data={catalogs.root || []}
                    value={parentCatalogs.map(
                        parentCatalog => parentCatalog.id
                    )}
                />
                {/* <Select
                    value={parentCatalogs.map(
                        parentCatalog => parentCatalog.id
                    )}
                    mode="multiple"
                    placeholder="Seçin"
                    showArrow
                    size="large"
                    className={styles.select}
                    allowClear
                    onChange={(newCatalogs, options) =>
                        handleParentCatalogsChange(newCatalogs, options)
                    }
                    suffixIcon={<Icon component={DownArrow} />}
                    filterOption={(input, option) =>
                        option.props.children
                            .replace('İ', 'I')
                            .toLowerCase()
                            .includes(input.replace('İ', 'I').toLowerCase())
                    }
                >
                    {catalogs.root?.map(catalog => (
                        <Option
                            key={catalog.id}
                            value={catalog.id}
                            className={styles.dropdown}
                            catalog={catalog}
                        >
                            {catalog.name}
                        </Option>
                    ))}
                </Select> */}
            </ProSidebarItem>

            <ProSidebarItem label="Alt kateqoriya">
                <Select
                    // loading={isLoading}
                    value={childCatalogs.map(childCatalog => childCatalog.id)}
                    onChange={(newCatalogs, options) =>
                        handleChildCatalogsChange(newCatalogs, options)
                    }
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
            <ProSidebarItem label="Məhsul">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxProductsSelectRequest}
                    valueOnChange={products => onFilter('products', products)}
                    data={products}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Məhsul kodu">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchCodeFilter(value)}
                    onChange={e => {
                        if (e.target.value === '') {
                            handleSearchCodeFilter(undefined);
                        }
                    }}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Seriya nömrəsi">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchSerialNumberFilter(value)}
                    onChange={e => {
                        if (e.target.value === '') {
                            handleSearchSerialNumberFilter(undefined);
                        }
                    }}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Barkod">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchBarcodeFilter(value)}
                    onChange={e => {
                        if (e.target.value === '') {
                            handleSearchBarcodeFilter(undefined);
                        }
                    }}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    products: state.productReducer.products,
    stocks: state.stockReducer.stocks,
    catalogs: state.catalogsReducer.catalogs,
    isLoading: state.salesAndBuysReducer.isLoading,
});

export default connect(
    mapStateToProps,
    {
        fetchStocks,
        fetchProducts,
        fetchFilteredCatalogs,
    }
)(SoldItemsSidebar);
