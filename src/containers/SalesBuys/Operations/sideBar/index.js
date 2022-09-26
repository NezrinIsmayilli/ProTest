/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import {
    Sidebar,
    ProDateRangePicker,
    ProSelect,
    ProTypeFilterButton,
    ProSidebarItem,
    ProInput,
    ProSearch,
    ProAsyncSelect,
} from 'components/Lib';
import { fetchContacts } from 'store/actions/contact';
import { fetchUsers } from 'store/actions/users';
import moment from 'moment';
import { Spin, Row, Col } from 'antd';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { fetchFilteredStocks } from 'store/actions/stock';
import { fetchProducts } from 'store/actions/product';
import { fetchContracts } from 'store/actions/contracts';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { typeOfOperations, paymentStatuses } from 'utils';
import { useDebounce } from 'use-debounce';

const SalesOperationsSideBar = props => {
    const {
        filters,
        onFilter,
        setCurrentPage,
        fetchSalesInvoiceSearch,
        permissionsByKeyValue,
        profile,
        fetchProducts,
        fetchFilteredStocks,
        fetchContacts,
        fetchContracts,
        fetchCurrencies,
        fetchUsers,
        handlePaginationChange,
        fetchBusinessUnitList,
        fetchSalesInvoiceList,
        agents,
        setAgents,
        filterSelectedContacts,
        filterSelectedContracts,
        filterSelectedSalesInvoices,
        filterSelectedStocks,
        filterSelectedProducts,
        filterSelectedCurrencies,
        filterSelectedSalesManagers,
        filterSelectedAgent,
    } = props;

    const [selectedStatus, setSelectedStatus] = useState('act');
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);
    const [serialNumbSearch, setSerialNumbSearch] = useState(
        filters.serialNumber ? filters.serialNumber : null
    );
    const [description, setDescription] = useState(
        filters.description ? filters.description : undefined
    );

    const [amountFromValue, setAmountFromValue] = useState(filters.amountFrom);
    const [amountToValue, setAmountToValue] = useState(filters.amountTo);
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

    const [from] = useDebounce(amountFromValue, 600);
    const [to] = useDebounce(amountToValue, 600);

    useEffect(() => {
        if (from !== filters.amountFrom) {
            onFilter('amountFrom', from);
        }
    }, [from, filters.amountFrom]);

    useEffect(() => {
        if (to !== filters.amountTo) {
            onFilter('amountTo', to);
        }
    }, [to, filters.amountTo]);

    const handleDefaultFilter = (type, value) => {
        setCurrentPage(1);
        onFilter('page', 1);
        onFilter(type, value);
    };

    const handleChange = (e, value) => {
        setDescription(e.target.value);
        if (e.target.value === '') {
            onFilter('description', value);
            setCurrentPage(1);
            onFilter('page', 1);
        }
    };

    const handleDatePicker = (startValue, endValue) => {
        handlePaginationChange(1);
        const startDate = startValue
            ? moment(startValue).format('DD-MM-YYYY')
            : undefined;
        const endDate = endValue
            ? moment(endValue).format('DD-MM-YYYY')
            : undefined;
        onFilter('dateFrom', startDate);
        onFilter('dateTo', endDate);
    };

    const toggleButton = (e, type) => {
        if (selectedStatus === type) setSelectedStatus('act');
        else setSelectedStatus(type);
        if (filters.isDeleted === e) onFilter('isDeleted', 0);
        else onFilter('isDeleted', e);
    };

    useEffect(() => {
        if (filters.isDeleted) {
            toggleButton(
                Number(filters.isDeleted),
                Number(filters.isDeleted) == 0 ? 'act' : 'del'
            );
        }
        if (filters.paymentStatuses) {
            onFilter('paymentStatuses', filters.paymentStatuses.map(Number));
        }
        handlePaginationChange(filters.page ? filters.page : 1);

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
    }, []);

    const handleSearchSerialNumberFilter = value => {
        if (value) {
            onFilter('serialNumber', value);
        } else {
            onFilter('serialNumber', null);
        }
    };

    const [contracts, setContracts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesman, setSalesman] = useState([]);
    const [agent, setAgent] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [salesInvoices, setSalesInvoices] = useState([]);

    const ajaxInvoicesSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
        fetchSalesInvoiceList({
            label: 'invoicesForSelect',
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
                    setSalesInvoices(appendList);
                } else {
                    setSalesInvoices(salesInvoices.concat(appendList));
                }
            },
        });
    };

    const ajaxSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
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
                setAgents(appendList);
            } else {
                setAgents(agents.concat(appendList));
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
        fetchFilteredStocks({
            filters: defaultFilters,
            onSuccessCallback: ({ data }) => {
                const appendList = [];

                if (data) {
                    data.forEach(element => {
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
    const ajaxCurrenciesSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchCurrencies(defaultFilters, data => {
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

    const ajaxAgentSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
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
                setAgent(appendList);
            } else {
                setAgent(agent.concat(appendList));
            }
        });
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

    return (
        <Sidebar title="Ticarət">
            {businessUnitLength === 1 &&
            profile.businessUnits.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxBusinessUnitSelectRequest}
                        valueOnChange={values => {
                            handlePaginationChange(1);
                            onFilter('businessUnitIds', values);
                        }}
                        disabled={businessUnitLength === 1}
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
            <ProSidebarItem label="Əməliyyat tarixi">
                <ProDateRangePicker
                    defaultStartValue={
                        filters.dateFrom ? filters.dateFrom : undefined
                    }
                    defaultEndValue={
                        filters.dateTo ? filters.dateTo : undefined
                    }
                    onChangeDate={handleDatePicker}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Status">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={9}>
                        <ProTypeFilterButton
                            label="Aktiv"
                            isActive={selectedStatus === 'act'}
                            onClick={() => {
                                handlePaginationChange(1);
                                toggleButton(0, 'act');
                            }}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Silinib"
                            isActive={selectedStatus === 'del'}
                            onClick={() => {
                                handlePaginationChange(1);
                                toggleButton(1, 'del');
                            }}
                        />
                    </Col>
                    <Col span={7}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={selectedStatus === 'all'}
                            onClick={() => {
                                handlePaginationChange(1);
                                toggleButton(undefined, 'all');
                            }}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Ödəniş statusu">
                <ProSelect
                    mode="multiple"
                    onChange={values =>
                        handleDefaultFilter('paymentStatuses', values)
                    }
                    data={paymentStatuses}
                    value={
                        filters.paymentStatuses
                            ? filters.paymentStatuses.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Əməliyyat növü">
                <ProSelect
                    mode="multiple"
                    onChange={values =>
                        handleDefaultFilter('invoiceTypes', values)
                    }
                    data={typeOfOperations.filter(
                        operationType =>
                            permissionsByKeyValue[operationType.key]
                                .permission >= 1
                    )}
                    value={
                        filters.invoiceTypes
                            ? filters.invoiceTypes.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Qarşı tərəf">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('contacts', values)
                    }
                    data={
                        filterSelectedContacts.length > 0
                            ? [
                                  ...filterSelectedContacts,
                                  ...agents.filter(
                                      item =>
                                          !filterSelectedContacts
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : agents
                    }
                    value={
                        filters.contacts
                            ? filters.contacts.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Müqavilə">
                <ProAsyncSelect
                    mode="multiple"
                    keys={['contract_no']}
                    selectRequest={ajaxContractsSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('contracts', values)
                    }
                    data={
                        filterSelectedContracts.length > 0
                            ? [
                                  ...filterSelectedContracts,
                                  ...contracts.filter(
                                      item =>
                                          !filterSelectedContracts
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : contracts
                    }
                    value={
                        filters.contracts
                            ? filters.contracts.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Qaimə">
                <ProAsyncSelect
                    mode="multiple"
                    keys={['invoiceNumber']}
                    selectRequest={ajaxInvoicesSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('invoices', values)
                    }
                    data={
                        filterSelectedSalesInvoices.length > 0
                            ? [
                                  ...filterSelectedSalesInvoices,
                                  ...salesInvoices.filter(
                                      item =>
                                          !filterSelectedSalesInvoices
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : salesInvoices
                    }
                    value={
                        filters.invoices
                            ? filters.invoices.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Anbar">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxStocksSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('stocks', values)
                    }
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
            <ProSidebarItem label="Məhsul">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxProductsSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('products', values)
                    }
                    data={
                        filterSelectedProducts.length > 0
                            ? [
                                  ...filterSelectedProducts,
                                  ...products.filter(
                                      item =>
                                          !filterSelectedProducts
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
            <ProSidebarItem label="Seriya nömrəsi">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchSerialNumberFilter(value)}
                    onChange={e => {
                        setSerialNumbSearch(e.target.value);
                        if (e.target.value === '') {
                            handleSearchSerialNumberFilter(undefined);
                        }
                    }}
                    value={serialNumbSearch}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Valyuta">
                <ProAsyncSelect
                    selectRequest={ajaxCurrenciesSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('currencyId', values)
                    }
                    data={
                        filterSelectedCurrencies.length > 0
                            ? [
                                  ...filterSelectedCurrencies,
                                  ...currencies.filter(
                                      item =>
                                          !filterSelectedCurrencies
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : currencies
                    }
                    value={
                        filters.currencyId
                            ? Number(filters.currencyId)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Qiymət aralığı">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProInput
                            value={amountFromValue}
                            onChange={event =>
                                setAmountFromValue(event.target.value)
                            }
                            placeholder="Başlanğıc"
                        />{' '}
                    </Col>
                    <Col span={12}>
                        <ProInput
                            value={amountToValue}
                            onChange={event =>
                                setAmountToValue(event.target.value)
                            }
                            placeholder="Son"
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Satış meneceri">
                <ProAsyncSelect
                    mode="multiple"
                    keys={['name', 'lastName']}
                    selectRequest={ajaxSalesmansSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('salesManagers', values)
                    }
                    data={
                        filterSelectedSalesManagers.length > 0
                            ? [
                                  ...filterSelectedSalesManagers,
                                  ...salesman.filter(
                                      item =>
                                          !filterSelectedSalesManagers
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : salesman
                    }
                    value={
                        filters.salesManagers
                            ? filters.salesManagers.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Agent">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxAgentSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('agents', values)
                    }
                    data={
                        filterSelectedAgent.length > 0
                            ? [
                                  ...filterSelectedAgent,
                                  ...agent.filter(
                                      item =>
                                          !filterSelectedAgent
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : agent
                    }
                    value={
                        filters.agents ? filters.agents.map(Number) : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Əlavə məlumat">
                <ProSearch
                    onSearch={value =>
                        handleDefaultFilter('description', value)
                    }
                    onChange={(e, value) => handleChange(e, value)}
                    value={description}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};
const mapStateToProps = state => ({
    products: state.productReducer.products,
    stocks: state.stockReducer.stocks,
});

export default connect(
    mapStateToProps,
    {
        fetchFilteredStocks,
        fetchContacts,
        fetchProducts,
        fetchContracts,
        fetchUsers,
        fetchCurrencies,
        fetchBusinessUnitList,
        fetchSalesInvoiceList,
    }
)(SalesOperationsSideBar);
