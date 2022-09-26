/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
    Sidebar,
    ProSelect,
    ProSidebarItem,
    ProTypeFilterButton,
    ProDateRangePicker,
    ProSearch,
    ProAsyncSelect,
} from 'components/Lib';
import { Row, Col, Spin } from 'antd';
import moment from 'moment';
import { fetchSalesInvoiceSearch } from 'store/actions/salesAndBuys';
import { fetchUsers } from 'store/actions/users';
import { fetchContracts } from 'store/actions/contracts';
import { fetchCatalogs } from 'store/actions/catalog';
import { fetchContacts } from 'store/actions/contact';
import { fetchStocks } from 'store/actions/stock';
import { connect } from 'react-redux';
import { fetchProducts } from 'store/actions/product';
import { fetchOrders } from 'store/actions/orders';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';

const BronSideBar = props => {
    const {
        fetchSalesInvoiceSearch,
        fetchBusinessUnitList,
        fetchContacts,
        fetchUsers,
        fetchCatalogs,
        fetchContracts,
        fetchOrders,
        fetchStocks,
        fetchProducts,
        catalogs,
        onFilter,
        filters,
        setCustomFilter,
        profile,
        setCurrentPage,
        openedSidebar,
        setOpenedSidebar,
    } = props;

    useEffect(() => {
        if (catalogs.root.length === 0) fetchCatalogs();
        if (orders.length === 0) {
            fetchOrders({ statusGroup: 1 });
        }
        if (products.length === 0) fetchProducts({ filters: { isDeleted: 0 } });
    }, []);
    useEffect(() => {
        if (filters?.businessUnitIds) {
            fetchUsers({
                filters: {
                    businessUnitIds: filters?.businessUnitIds,
                },
            });
            fetchContracts({
                limit: 1000,
                businessUnitIds: filters?.businessUnitIds,
            });
            fetchStocks({
                limit: 1000,
                businessUnitIds: filters?.businessUnitIds,
            });
        } else {
            fetchUsers({});
            fetchContracts({ limit: 1000 });
            fetchStocks({ limit: 1000 });
        }
    }, [filters.businessUnitIds]);
    const [statusGroupFilter, setStatusGroupFilter] = useState(1);
    const [endDateGroupFilter, setEndDateGroupFilter] = useState(1);
    const [searchResult, setSearchResult] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const timeoutRef = useRef(null);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [clients, setClients] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [salesman, setSalesman] = useState([]);
    const [products, setProducts] = useState([]);

    function validate() {
        fetchSalesInvoiceSearch({
            filters: { invoiceNumber: search, invoiceTypes: [9] },
            onSuccess: onSearchResult,
        });
    }
    useEffect(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            setSearchResult([]);
            if (search !== '') {
                setIsLoadingSearch(true);
                validate();
            }
        }, 800);
    }, [search]);
    const onSearchResult = data => {
        setSearchResult(data.data);
        setIsLoadingSearch(false);
    };
    const handleDefaultFilters = (type, value) => {
        onFilter(type, value);
    };

    const handleChange = (e, value) => {
        if (e.target.value === '') {
            onFilter('description', value);
        }
    };

    const handleStageGroupFilter = id => {
        if (id === 1) {
            setCustomFilter(1);
        }
        if (id === 2) {
            setCustomFilter(2);
        }
        if (id === 3) {
            setCustomFilter(3);
        }
        setStatusGroupFilter(id);
    };
    const handleEndDateGroupFilter = id => {
        if (id === 2) {
            onFilter('bronEndDate', 'muddetli');
        } else if (id === 3) {
            onFilter('bronEndDate', 'muddetsiz');
        } else {
            onFilter('bronEndDate', undefined);
        }
        setEndDateGroupFilter(id);
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

    const ajaxClientSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, categories: [1] };
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
                setClients(appendList);
            } else {
                setClients(clients.concat(appendList));
            }
        });
    };

    const ajaxContractsSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            contractNo: search,
            businessUnitIds: filters?.businessUnitIds
                ? filters?.businessUnitIds
                : undefined,
        };
        fetchContracts(defaultFilters, data => {
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
                setContracts(appendList);
            } else {
                setContracts(contracts.concat(appendList));
            }
        });
    };
    const ajaxOrdersSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            serialNumber: search,
            businessUnitIds: filters?.businessUnitIds
                ? filters?.businessUnitIds
                : undefined,
        };
        fetchOrders(defaultFilters, data => {
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
                setOrders(appendList);
            } else {
                setOrders(orders.concat(appendList));
            }
        });
    };
    const ajaxSalesmansSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            'filters[search]': search,
            businessUnitIds: filters?.businessUnitIds
                ? filters?.businessUnitIds
                : undefined,
        };
        fetchUsers({
            filters: defaultFilters,
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
                    setSalesman(appendList);
                } else {
                    setSalesman(salesman.concat(appendList));
                }
            },
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

    return (
        <Sidebar
            title="Bron"
            openedSidebar={openedSidebar}
            setOpenedSidebar={setOpenedSidebar}
        >
            {businessUnits?.length === 1 &&
            profile.businessUnits.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxBusinessUnitSelectRequest}
                        valueOnChange={values =>
                            onFilter('businessUnitIds', values)
                        }
                        value={
                            businessUnits?.length === 1
                                ? businessUnits[0]?.id === null
                                    ? businessUnits[0]?.name
                                    : businessUnits[0]?.id
                                : filters.businessUnitIds
                        }
                        disabled={businessUnits?.length === 1}
                        data={businessUnits?.map(item =>
                            item.id === null ? { ...item, id: 0 } : item
                        )}
                        disabledBusinessUnit={businessUnits?.length === 1}
                    />
                </ProSidebarItem>
            )}
            <ProSidebarItem label="Status">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Aktiv"
                            isActive={statusGroupFilter === 1}
                            onClick={() => handleStageGroupFilter(1)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Bitib"
                            isActive={statusGroupFilter === 2}
                            onClick={() => handleStageGroupFilter(2)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Silinib"
                            isActive={statusGroupFilter === 3}
                            onClick={() => handleStageGroupFilter(3)}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Tarix">
                <ProDateRangePicker onChangeDate={handleDatePicker} />
            </ProSidebarItem>
            <ProSidebarItem label="Bitmə tarixi">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={endDateGroupFilter === 1}
                            onClick={() => handleEndDateGroupFilter(1)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Müddətli"
                            isActive={endDateGroupFilter === 2}
                            onClick={() => handleEndDateGroupFilter(2)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Müddətsiz"
                            isActive={endDateGroupFilter === 3}
                            onClick={() => handleEndDateGroupFilter(3)}
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
                    data={stocks}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Qarşı tərəf">
                <ProAsyncSelect
                    mode="multiple"
                    data={clients}
                    selectRequest={ajaxClientSelectRequest}
                    valueOnChange={contacts =>
                        handleDefaultFilters('contacts', contacts)
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Sənəd">
                <ProSelect
                    mode="multiple"
                    value={filters.invoices}
                    keys={['invoiceNumber']}
                    data={searchResult}
                    notFoundContent={
                        isLoadingSearch ? <Spin size="small" /> : null
                    }
                    onSearch={e => setSearch(e)}
                    onChange={values =>
                        handleDefaultFilters('invoices', values)
                    }
                    showSearch
                />
            </ProSidebarItem>
            <ProSidebarItem label="Müqavilə">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxContractsSelectRequest}
                    keys={['contract_no']}
                    valueOnChange={values =>
                        handleDefaultFilters('contracts', values)
                    }
                    data={contracts}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Sifariş">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxOrdersSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilters('orders', values)
                    }
                    data={[
                        ...orders.map(order => ({
                            ...order,
                            name:
                                order.direction === 1
                                    ? `SFD${moment(
                                          order.createdAt.replace(
                                              /(\d\d)-(\d\d)-(\d{4})/,
                                              '$3'
                                          ),
                                          'YYYY'
                                      ).format('YYYY')}/${order.serialNumber}`
                                    : `SFX${moment(
                                          order.createdAt.replace(
                                              /(\d\d)-(\d\d)-(\d{4})/,
                                              '$3'
                                          ),
                                          'YYYY'
                                      ).format('YYYY')}/${order.serialNumber}`,
                        })),
                    ]}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Satış meneceri">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxSalesmansSelectRequest}
                    keys={['name', 'lastName']}
                    data={salesman}
                    valueOnChange={values =>
                        handleDefaultFilters('salesManagers', values)
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Məhsul adı">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxProductsSelectRequest}
                    valueOnChange={products =>
                        handleDefaultFilters('products', products)
                    }
                    showArrow
                    data={products}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Əlavə məlumat">
                <ProSearch
                    onSearch={value =>
                        handleDefaultFilters('description', value)
                    }
                    onChange={(e, value) => handleChange(e, value)}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    catalogs: state.catalogsReducer.catalogs,
    stocksLoading: state.stockReducer.isLoading,
    productsLoading: state.loadings.products,
});

export default connect(
    mapStateToProps,
    {
        fetchUsers,
        fetchBusinessUnitList,
        fetchCatalogs,
        fetchContracts,
        fetchContacts,
        fetchOrders,
        fetchStocks,
        fetchProducts,
        fetchSalesInvoiceSearch,
    }
)(BronSideBar);
