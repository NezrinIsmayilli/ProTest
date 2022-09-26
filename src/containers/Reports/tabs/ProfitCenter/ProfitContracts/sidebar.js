import React, { useEffect, useState } from 'react';
import {
    Sidebar,
    ProDateRangePicker,
    ProSelect,
    ProSidebarItem,
    ProSearch,
    ProTypeFilterButton,
    ProInput,
    ProAsyncSelect,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchContacts } from 'store/actions/contact';
import moment from 'moment';
import { Row, Col, Button } from 'antd';
import { connect } from 'react-redux';

const SideBar = props => {
    const {
        contacts,
        onFilter,
        filters,
        profile,
        fetchBusinessUnitList,
        fetchCurrencies,
        fetchContacts,
        setCurrentPage,
        filterSelectedCurrencies,
        filterSelectedContacts,
        agents,
        setAgents,
        handlePaginationChange,
    } = props;
    const [selectedType, setSelectedType] = useState(null);
    const [amountFrom, setAmountFrom] = useState('');
    const [amountTo, setAmountTo] = useState('');
    const [businessUnits, setBusinessUnits] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);
    const [businessUnitLength, setBusinessUnitLength] = useState(2);

    const handleFilterByType = (type, values) => {
        onFilter(type, values);
    };
    const handleFilterType = (value = null) => {
        if (value) {
            setSelectedType(value);
            onFilter('types', [value]);
        } else {
            setSelectedType(null);
            onFilter('types', null);
        }
    };
    const handleDefaultFilter = (type, value) => {
        setCurrentPage(1);
        onFilter('page', 1);
        onFilter(type, value);
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

    const handleFilterAmount = (type, value) => {
        if (type === 'from') setAmountFrom(value);
        if (type === 'to') setAmountTo(value);
        if (type === 'submit') {
            onFilter('amountFrom', amountFrom);
            onFilter('amountTo', amountTo);
        }
    };

    useEffect(() => {
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
        } else {
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
        }
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
    return (
        <Sidebar title="Müqavilələr">
            {businessUnitLength === 1 &&
            profile.businessUnits.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxBusinessUnitSelectRequest}
                        valueOnChange={values => {
                            handlePaginationChange(1);
                            handleFilterByType('businessUnitIds', values);
                        }}
                        value={
                            filters.businessUnitIds
                                ? filters.businessUnitIds.map(Number)
                                : businessUnitLength === 1
                                ? businessUnits[0]?.id === null
                                    ? businessUnits[0]?.name
                                    : businessUnits[0]?.id
                                : filters.businessUnitIds
                        }
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
                    />
                </ProSidebarItem>
            )}
            <ProSidebarItem label="Tarix">
                <ProDateRangePicker
                    onChangeDate={handleDatePicker}
                    style={{ marginTop: '8px' }}
                    placeholder="Seçin"
                />
            </ProSidebarItem>
            <ProSidebarItem label="Qarşı tərəf">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxSelectRequest}
                    valueOnChange={values => {
                        handleFilterByType('contacts', values);
                    }}
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
            <ProSidebarItem label="Nov">
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
                            label="Məhsul"
                            isActive={selectedType === 1}
                            onClick={() => handleFilterType(1)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Xidmət"
                            isActive={selectedType === 2}
                            onClick={() => handleFilterType(2)}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Müqavilə">
                <ProSearch
                    onChange={e => {
                        if (e.target.value === '') {
                            handleFilterByType('contractNo', undefined);
                        }
                    }}
                    onSearch={contractNo =>
                        handleFilterByType('contractNo', contractNo)
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Valyuta">
                <ProAsyncSelect
                    selectRequest={ajaxCurrenciesSelectRequest}
                    valueOnChange={values =>
                        handleFilterByType('currencyId', values)
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
            <ProSidebarItem label="Məbləğ">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProInput
                            value={amountFrom}
                            onChange={event =>
                                handleFilterAmount('from', event.target.value)
                            }
                            placeholder="Dən"
                        />{' '}
                    </Col>
                    <Col span={12}>
                        <ProInput
                            value={amountTo}
                            onChange={event =>
                                handleFilterAmount('to', event.target.value)
                            }
                            placeholder="Dək"
                        />
                    </Col>
                    <Col span={24}>
                        <Button
                            onClick={() => handleFilterAmount('submit')}
                            style={{
                                marginTop: 16,
                                width: '100%',
                                fontSize: '14px',
                            }}
                            type="primary"
                        >
                            Axtar
                        </Button>
                    </Col>
                </Row>
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({});

export default connect(
    mapStateToProps,
    { fetchBusinessUnitList, fetchCurrencies, fetchContacts }
)(SideBar);
