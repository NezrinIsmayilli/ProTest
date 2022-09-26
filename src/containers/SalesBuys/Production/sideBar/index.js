/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
    Sidebar,
    ProDateRangePicker,
    ProSelect,
    ProTypeFilterButton,
    ProSidebarItem,
    ProSearch,
    ProAsyncSelect,
} from 'components/Lib';
import moment from 'moment';
import { Spin, Row, Col } from 'antd';

const ProductionSideBar = props => {
    const {
        filters,
        onFilter,
        setCurrentPage,
        fetchBusinessUnitList,
        fetchSalesInvoiceSearch,
        fetchFilteredContacts,
        fetchSalesInvoiceList,
        profile,
        handlePaginationChange,
        isLoading,
        actionLoading,
        loader,
    } = props;

    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);
    const { productionStatus } = filters;
    const { isDeleted } = filters;
    const [searchResult, setSearchResult] = useState([]);
    const [endDateGroupFilter, setEndDateGroupFilter] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState();
    const [businessUnits, setBusinessUnits] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [productionInvoices, setProductionInvoices] = useState([]);
    const [filterSelectedContacts, setFilterSelectedContacts] = useState([]);
    const [
        filterSelectedProductionInvoices,
        setFilterSelectedProductionInvoices,
    ] = useState([]);
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);

    const [selectedFilterDirection, setSelectedFilterDirection] = useState(
        filters.order ? (filters.order == 'xarici' ? 2 : 1) : null
    );
    const [description, setDescription] = useState(
        filters.description ? filters.description : undefined
    );
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

    const timeoutRef = useRef(null);
    useEffect(() => {
        if (Number(filters.status) == 0 && !filters.productionStatus) {
            setSelectedStatus('all');
            onFilter('productionStatus', undefined);
            onFilter('isDeleted', undefined);
        } else if (Number(filters.status) == 1 && !filters.productionStatus) {
            onFilter('isDeleted', 1);
            onFilter('productionStatus', undefined);
        }
    }, []);

    useEffect(() => {
        if (selectedStatus === 'prod') {
            onFilter('isDeleted', 0);
            onFilter('productionStatus', 1);
        }
    }, [selectedStatus]);

    useEffect(() => {
        if (filters.productionStatus === 1) {
            setSelectedStatus('prod');
        } else if (filters.productionStatus === 2) {
            setSelectedStatus('ware');
        } else if (filters.productionStatus === undefined) {
            if (filters.isDeleted === 1) {
                setSelectedStatus('del');
            } else {
                setSelectedStatus('all');
            }
        }
    }, [productionStatus, isDeleted]);

    const handleFilterDirection = (value = null) => {
        handlePaginationChange(1);
        if (value) {
            if (value === 1) {
                setSelectedFilterDirection(value);
                onFilter('order', 'daxili');
            } else if (value === 2) {
                setSelectedFilterDirection(value);
                onFilter('order', 'xarici');
            }
        } else {
            setSelectedFilterDirection(null);
            onFilter('order', null);
        }
    };
    function validate() {
        fetchSalesInvoiceSearch({
            filters: {
                invoiceNumber: search,
                invoiceTypes: [11],
            },
            onSuccess: onSearchResult,
        });
    }
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
    const toggleButton = (e, type) => {
        handlePaginationChange(1);

        if (selectedStatus === type) {
            onFilter('productionStatus', 1);
            setSelectedStatus('prod');
        } else setSelectedStatus(type);
        if (filters.isDeleted === e) {
            onFilter('isDeleted', 0);
        } else if (e === 1) {
            onFilter('status', 1);
            onFilter('isDeleted', e);
            onFilter('productionStatus', undefined);
        } else {
            onFilter('isDeleted', e);
        }
        if (type === 'ware') {
            onFilter('productionStatus', 2);
        } else if (type === 'prod') {
            onFilter('productionStatus', 1);
        } else if (type === 'all') {
            onFilter('status', 0);
            onFilter('productionStatus', undefined);
        }
    };

    const onSearchResult = data => {
        setSearchResult(data.data);
        setIsLoadingSearch(false);
    };
    useEffect(() => {
        handlePaginationChange(filters.page ? filters.page : 1);
        if (filters.contacts) {
            fetchFilteredContacts(
                {
                    filters: {
                        ids: filters.contacts.map(Number),
                        includeDeleted: 1,
                    },
                },
                data => {
                    const appendList = [];

                    if (data.data) {
                        data.data.forEach(element => {
                            appendList.push({
                                id: element.id,
                                name: element.name,
                            });
                        });
                    }
                    setFilterSelectedContacts(appendList);
                }
            );
        }
        if (filters.invoices) {
            fetchSalesInvoiceList({
                label: 'invoicesForSelect',
                filters: {
                    ids: filters.invoices.map(Number),
                    invoiceTypes: [11],
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
                    setFilterSelectedProductionInvoices(appendList);
                },
            });
        }

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

    const ajaxSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, includeDeleted: 1 };
        fetchFilteredContacts({ filters }, data => {
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
                setContacts(appendList);
            } else {
                setContacts(contacts.concat(appendList));
            }
        });
    };
    const ajaxInvoicesSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search, invoiceTypes: [11] };
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
                    setProductionInvoices(appendList);
                } else {
                    setProductionInvoices(
                        productionInvoices.concat(appendList)
                    );
                }
            },
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

    const handleEndDateGroupFilter = id => {
        if (id === 2) {
            onFilter('withPeriod', 1);
        } else if (id === 3) {
            onFilter('withPeriod', 0);
        } else {
            onFilter('withPeriod', undefined);
        }
        setEndDateGroupFilter(id);
    };

    return (
        <Sidebar title="İstehsalat">
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
            <ProSidebarItem label="Status">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProTypeFilterButton
                            label="İstehsalatda"
                            isActive={selectedStatus === 'prod'}
                            onClick={() => toggleButton(0, 'prod')}
                            disabled={isLoading || actionLoading || loader}
                        />
                    </Col>
                    <Col span={12}>
                        <ProTypeFilterButton
                            label="Anbarda"
                            isActive={selectedStatus === 'ware'}
                            onClick={() => toggleButton(0, 'ware')}
                            disabled={isLoading || actionLoading || loader}
                        />
                    </Col>
                </Row>
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProTypeFilterButton
                            label="Silinib"
                            isActive={selectedStatus === 'del'}
                            onClick={() => toggleButton(1, 'del')}
                            disabled={isLoading || actionLoading || loader}
                        />
                    </Col>
                    <Col span={12}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={selectedStatus === 'all'}
                            onClick={() => toggleButton(undefined, 'all')}
                            disabled={isLoading || actionLoading || loader}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Tarix">
                <ProDateRangePicker
                    onChangeDate={handleDatePicker}
                    defaultStartValue={
                        filters.dateFrom ? filters.dateFrom : undefined
                    }
                    defaultEndValue={
                        filters.dateTo ? filters.dateTo : undefined
                    }
                />
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
            <ProSidebarItem label="Sifarişçi">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxSelectRequest}
                    data={
                        filterSelectedContacts.length > 0
                            ? [
                                  ...filterSelectedContacts,
                                  ...contacts.filter(
                                      item =>
                                          !filterSelectedContacts
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : contacts
                    }
                    valueOnChange={values =>
                        handleDefaultFilter('contacts', values)
                    }
                    value={
                        filters.contacts
                            ? filters.contacts.map(Number)
                            : undefined
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Sənəd">
                <ProAsyncSelect
                    mode="multiple"
                    keys={['invoiceNumber']}
                    selectRequest={ajaxInvoicesSelectRequest}
                    valueOnChange={values =>
                        handleDefaultFilter('invoices', values)
                    }
                    data={
                        filterSelectedProductionInvoices.length > 0
                            ? [
                                  ...filterSelectedProductionInvoices,
                                  ...productionInvoices.filter(
                                      item =>
                                          !filterSelectedProductionInvoices
                                              .map(({ id }) => id)
                                              ?.includes(item.id)
                                  ),
                              ]
                            : productionInvoices
                    }
                    value={
                        filters.invoices
                            ? filters.invoices.map(Number)
                            : undefined
                    }
                />
                {/* <ProSelect
          mode="multiple"
          keys={['invoiceNumber']}
          data={searchResult}
          notFoundContent={isLoadingSearch ? <Spin size="small" /> : null}
          onSearch={e => setSearch(e)}
          onChange={values => handleDefaultFilter('invoices', values)}
          value={filters.invoices ? filters.invoices.map(Number) : undefined}
          showSearch
        /> */}
            </ProSidebarItem>
            <ProSidebarItem label="Sifarişlər">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={selectedFilterDirection === null}
                            onClick={() => handleFilterDirection()}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Daxili"
                            isActive={selectedFilterDirection === 1}
                            onClick={() => handleFilterDirection(1)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Xarici"
                            isActive={selectedFilterDirection === 2}
                            onClick={() => handleFilterDirection(2)}
                        />
                    </Col>
                </Row>
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

export default ProductionSideBar;
