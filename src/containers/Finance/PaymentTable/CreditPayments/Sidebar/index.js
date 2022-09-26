/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Spin } from 'antd';
import {
    Sidebar,
    ProSidebarItem,
    ProSelect,
    ProTypeFilterButton,
    ProDateRangePicker,
    ProInput,
    ProAsyncSelect,
} from 'components/Lib';
import { fetchUsers } from 'store/actions/users';
import { fetchFilteredContacts } from 'store/actions/contacts-new';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchCreditPayments } from 'store/actions/finance/paymentTable';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import moment from 'moment';
import { useDebounce } from 'use-debounce';
import styles from '../../styles.module.scss';

const CreditPaymentsSidebar = props => {
    const {
        onFilter,
        filters,
        fetchCreditPayments,
        setTableData,
        fetchBusinessUnitList,
        fetchFilteredContacts,
        fetchCurrencies,
        fetchUsers,
        profile,
        loading,
        handlePaginationChange
    } = props;

    const timeoutRef = useRef(null);
    const [searchResult, setSearchResult] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(filters.latenessStatuses?filters.latenessStatuses.length==1?
         filters.latenessStatuses:undefined:4);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [salesman, setSalesman] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [
        filterSelectedSalesManagers,
        setFilterSelectedSalesManagers,
    ] = useState([]);
    const [filterSelectedCurrencies, setFilterSelectedCurrencies] = useState(
        []
    );
    const [filterSelectedContacts, setFilterSelectedContacts] = useState([]);
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);
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
                console.log(contacts, 'contacts1');
                setContacts(contacts.concat(appendList));
            }
        });
    };
console.log(contacts, 'contacts')
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

    const [mustPaidFromValue, setMustPaidFromValue] = useState(
        filters.remainingAmountFrom
    );
    const [mustPaidToValue, setMustPaidToValue] = useState(
        filters.remainingAmountTo
    );
    const [monthlyPaymentFromValue, setMonthlyPaymentFromValue] = useState(
        filters.monthlyPaymentAmountFrom
    );
    const [monthlyPaymentToValue, setMonthlyPaymentToValue] = useState(
        filters.monthlyPaymentAmountTo
    );
    const [latenessFromValue, setLatenessFromValue] = useState(
        filters.latenessDaysFrom
    );
    const [latenessToValue, setLatenessToValue] = useState(
        filters.latenessDaysTo
    );

    const [mustPaidFrom] = useDebounce(mustPaidFromValue, 600);
    const [mustPaidTo] = useDebounce(mustPaidToValue, 600);
    const [monthlyPaymentFrom] = useDebounce(monthlyPaymentFromValue, 600);
    const [monthlyPaymentTo] = useDebounce(monthlyPaymentToValue, 600);
    const [latenessFrom] = useDebounce(latenessFromValue, 600);
    const [latenessTo] = useDebounce(latenessToValue, 600);

    useEffect(() => {
        if (mustPaidFrom !== filters.remainingAmountFrom) {
            setTableData([]);
            handlePaginationChange(1);
            onFilter('remainingAmountFrom', mustPaidFrom);
        }
    }, [mustPaidFrom, filters.remainingAmountFrom]);

    useEffect(() => {
        if (mustPaidTo !== filters.remainingAmountTo) {
            setTableData([]);
            handlePaginationChange(1);
            onFilter('remainingAmountTo', mustPaidTo);
        }
    }, [mustPaidTo, filters.remainingAmountTo]);

    useEffect(() => {
        if (monthlyPaymentFrom !== filters.monthlyPaymentAmountFrom) {
            setTableData([]);
            handlePaginationChange(1);
            onFilter('monthlyPaymentAmountFrom', monthlyPaymentFrom);
        }
    }, [monthlyPaymentFrom, filters.monthlyPaymentAmountFrom]);

    useEffect(() => {
        if (monthlyPaymentTo !== filters.monthlyPaymentAmountTo) {
            setTableData([]);
            handlePaginationChange(1);
            onFilter('monthlyPaymentAmountTo', monthlyPaymentTo);
        }
    }, [monthlyPaymentTo, filters.monthlyPaymentAmountTo]);

    useEffect(() => {
        if (latenessFrom !== filters.latenessDaysFrom) {
            setTableData([]);
            handlePaginationChange(1);
            onFilter('latenessDaysFrom', latenessFrom);
        }
    }, [latenessFrom, filters.latenessDaysFrom]);

    useEffect(() => {
        if (latenessTo !== filters.latenessDaysTo) {
            setTableData([]);
            handlePaginationChange(1);
            onFilter('latenessDaysTo', latenessTo);
        }
    }, [latenessTo, filters.latenessDaysTo]);

    function validate() {
        fetchCreditPayments({
            filters: {
                invoiceType: filters.invoiceType,
                serialNumber: search,
                limit: 1000,
            },
            onSuccessCallback: onSearchResult,
            setOperations: false,
        });
    }
    const onSearchResult = data => {
        setSearchResult(data.data);
        setIsLoadingSearch(false);
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

    const handleDatePicker = (startValue, endValue) => {
        handlePaginationChange(1);
        setTableData([]);
        const startDate = startValue
            ? moment(startValue).format('DD-MM-YYYY')
            : undefined;
        const endDate = endValue
            ? moment(endValue).format('DD-MM-YYYY')
            : undefined;
        onFilter('startDateFrom', startDate);
        onFilter('startDateTo', endDate);
    };

    const toggleButton = e => {
        setTableData([]);
        setSelectedStatus(e);
        handlePaginationChange(1);
        onFilter('latenessStatuses', e ? [e] : [2, 3, 4]);
    };

    useEffect(()=>{
        handlePaginationChange(filters.page? filters.page:1);
        if (filters.salesmans) {
            fetchUsers({
                filters: { ids: filters.salesmans.map(Number) },
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
                    setFilterSelectedSalesManagers(appendList);
                },
            });
        }
        if (filters.currencies?.length) {
            fetchCurrencies({ ids: filters.currencies.map(Number) }, data => {
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
                setFilterSelectedCurrencies(appendList);
            });
        }
        if (filters.contacts?.length) {
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
                        appendList.push({ id: element.id, name: element.name });
                    });
                }
                setFilterSelectedContacts(appendList);
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
    },[]);

    return (
        <Sidebar title="Ödənişlər">
            <Spin spinning={loading}>
                {businessUnitLength === 1 &&
                profile.businessUnits.length === 0 ? null : (
                    <ProSidebarItem label="Biznes blok">
                        <ProAsyncSelect
                            mode="multiple"
                            selectRequest={ajaxBusinessUnitSelectRequest}
                            valueOnChange={values => {
                                setTableData([]);
                                handlePaginationChange(1);
                                onFilter('businessUnitIds', values);
                            }}
                            disabled={businessUnitLength === 1}
                            data={filterSelectedBusinessUnit.length > 0
                                ? [
                                      ...filterSelectedBusinessUnit.filter(item=> item.id !== null),
                                      ...businessUnits?.map(item =>
                                        item.id === null ? { ...item, id: 0 } : item
                                    ).filter(
                                          item =>
                                              !filterSelectedBusinessUnit
                                                  .map(({ id }) => id)
                                                  ?.includes(item.id)
                                      ),
                                  ]
                            : businessUnits?.map(item =>
                                item.id === null ? { ...item, id: 0 } : item
                            )}
                            disabledBusinessUnit={businessUnitLength === 1}
                            value={
                                filters.businessUnitIds ? filters.businessUnitIds.map(Number):
                               ( businessUnitLength === 1
                                    ? businessUnits[0]?.id === null
                                        ? businessUnits[0]?.name
                                        : businessUnits[0]?.id
                                    : filters.businessUnitIds)
                            }
                        />
                    </ProSidebarItem>
                )}
                <div className={styles.sidebarItem}>
                    <span className={styles.sectionName}></span>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '4px',
                        }}
                    >
                        <Button
                            className={`${styles.dataButton} ${
                                filters.invoiceType == 1
                                    ? styles.dataButtonActive
                                    : null
                            }`}
                            onClick={() => {
                                setTableData([]);
                                handlePaginationChange(1);
                                onFilter('invoiceType', 1);
                            }}
                        >
                            Debitor Borclar
                        </Button>
                        <Button
                            className={`${styles.dataButton} ${
                                filters.invoiceType == 2
                                    ? styles.dataButtonActive
                                    : null
                            }`}
                            onClick={() => {
                                setTableData([]);
                                handlePaginationChange(1);
                                onFilter('invoiceType', 2);
                            }}
                        >
                            Kreditor Borclar
                        </Button>
                    </div>
                </div>
                <ProSidebarItem label="Ödəniş tarixi">
                    <ProDateRangePicker
                    defaultStartValue={filters.startDateFrom ? filters.startDateFrom:undefined}
                    defaultEndValue={filters.startDateTo ? filters.startDateTo:undefined}
                     onChangeDate={handleDatePicker}
                      />
                </ProSidebarItem>
                <ProSidebarItem label="Status">
                    <Row gutter={2} style={{ marginTop: '8px' }}>
                        <Col span={12}>
                            <ProTypeFilterButton
                                label="Vaxtı çatıb"
                                isActive={selectedStatus == 4}
                                onClick={() => toggleButton(4)}
                            />
                        </Col>
                        <Col span={12}>
                            <ProTypeFilterButton
                                label="Qalır"
                                isActive={selectedStatus == 3}
                                onClick={() => toggleButton(3)}
                            />
                        </Col>
                    </Row>
                    <Row gutter={2} style={{ marginTop: '8px' }}>
                        <Col span={12}>
                            <ProTypeFilterButton
                                label="Gecikir"
                                isActive={selectedStatus == 2}
                                onClick={() => toggleButton(2)}
                            />
                        </Col>
                        <Col span={12}>
                            <ProTypeFilterButton
                                label="Hamısı"
                                isActive={selectedStatus === undefined}
                                onClick={() => toggleButton(undefined)}
                            />
                        </Col>
                    </Row>
                </ProSidebarItem>
                <ProSidebarItem label="Qarşı tərəf">
                    <ProAsyncSelect
                        mode="multiple"
                        keys={['name', 'surname', 'patronymic']}
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
                        valueOnChange={values => {
                            setTableData([]);
                            handlePaginationChange(1);
                            onFilter('contacts', values);
                        }}
                        value={filters.contacts?filters.contacts.map(Number):undefined}
                    />
                </ProSidebarItem>
                <ProSidebarItem label="Sənəd">
                    <ProSelect
                        mode="multiple"
                        value={filters.ids}
                        keys={['name']}
                        data={searchResult.map(result => ({
                            ...result,
                            id: result.creditId,
                            name: `KC${moment(
                                result.createdAt?.replace(
                                    /(\d\d)-(\d\d)-(\d{4})/,
                                    '$3'
                                ),
                                'YYYY'
                            ).format('YYYY')}/${result.serialNumber}`,
                        }))}
                        notFoundContent={
                            isLoadingSearch ? <Spin size="small" /> : null
                        }
                        onSearch={e => setSearch(e)}
                        onChange={values => {
                            setTableData([]);
                            handlePaginationChange(1);
                            onFilter('ids', values);
                        }}
                        showSearch
                    />
                </ProSidebarItem>
                <ProSidebarItem label="Satış meneceri">
                    <ProAsyncSelect
                        mode="multiple"
                        keys={['name', 'lastName']}
                        selectRequest={ajaxSalesmansSelectRequest}
                        valueOnChange={values => {
                            setTableData([]);
                            handlePaginationChange(1);
                            onFilter('salesmans', values);
                        }}
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
                        value={filters.salesmans?filters.salesmans.map(Number):undefined}
                    />
                </ProSidebarItem>
                <ProSidebarItem label="Valyuta">
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxCurrenciesSelectRequest}
                        valueOnChange={currencies => {
                            setTableData([]);
                            handlePaginationChange(1);
                            onFilter('currencies', currencies);
                        }}
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
                        value={filters.currencies?filters.currencies.map(Number):undefined}
                    />
                </ProSidebarItem>
                <ProSidebarItem label="Sənəd üzrə qalıq">
                    <Row gutter={2} style={{ marginTop: '8px' }}>
                        <Col span={12}>
                            <ProInput
                                value={mustPaidFromValue}
                                onChange={event =>
                                    setMustPaidFromValue(event.target.value)
                                }
                                placeholder="Başlanğıc"
                                disabled={loading}
                            />{' '}
                        </Col>
                        <Col span={12}>
                            <ProInput
                                value={mustPaidToValue}
                                onChange={event =>
                                    setMustPaidToValue(event.target.value)
                                }
                                placeholder="Son"
                                disabled={loading}
                            />
                        </Col>
                    </Row>
                </ProSidebarItem>
                <ProSidebarItem label="Ödəniş məbləği">
                    <Row gutter={2} style={{ marginTop: '8px' }}>
                        <Col span={12}>
                            <ProInput
                                value={monthlyPaymentFromValue}
                                onChange={event =>
                                    setMonthlyPaymentFromValue(
                                        event.target.value
                                    )
                                }
                                placeholder="Başlanğıc"
                                disabled={loading}
                            />{' '}
                        </Col>
                        <Col span={12}>
                            <ProInput
                                value={monthlyPaymentToValue}
                                onChange={event =>
                                    setMonthlyPaymentToValue(event.target.value)
                                }
                                placeholder="Son"
                                disabled={loading}
                            />
                        </Col>
                    </Row>
                </ProSidebarItem>
                <ProSidebarItem label="Gecikmə, gün">
                    <Row gutter={2} style={{ marginTop: '8px' }}>
                        <Col span={12}>
                            <ProInput
                                value={latenessFromValue}
                                onChange={event =>
                                    setLatenessFromValue(event.target.value)
                                }
                                placeholder="Başlanğıc"
                                disabled={loading}
                            />{' '}
                        </Col>
                        <Col span={12}>
                            <ProInput
                                value={latenessToValue}
                                onChange={event =>
                                    setLatenessToValue(event.target.value)
                                }
                                placeholder="Son"
                                disabled={loading}
                            />
                        </Col>
                    </Row>
                </ProSidebarItem>
            </Spin>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    contacts: state.newContactsReducer.filteredContacts,
    currencies: state.kassaReducer.currencies,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
    salesman: state.usersReducer.users,
});
export default connect(
    mapStateToProps,
    {
        fetchBusinessUnitList,
        fetchCreditPayments,
        fetchFilteredContacts,
        fetchUsers,
        fetchCurrencies,
    }
)(CreditPaymentsSidebar);
