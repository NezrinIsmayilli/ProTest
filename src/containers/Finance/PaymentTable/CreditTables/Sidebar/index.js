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
import { fetchCreditPayments } from 'store/actions/finance/paymentTable';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchSalesInvoiceSearch } from 'store/actions/salesAndBuys';
import { fetchFilteredContacts } from 'store/actions/contacts-new';
import moment from 'moment';
import { useDebounce } from 'use-debounce';
import styles from '../../styles.module.scss';

const CreditTablesSidebar = props => {
    const {
        onFilter,
        filters,
        setCurrentPage,
        // contacts,
        creditTypes,
        fetchBusinessUnitList,
        profile,
        invoiceList,
        fetchCreditPayments,
        fetchSalesInvoiceSearch,
        fetchFilteredContacts,
        fetchCurrencies,
        handlePaginationChange
    } = props;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const invoiceType = urlParams.get('invoiceType');
    const timeoutRef = useRef(null);
    const timeoutRefInvoice = useRef(null);

    const [selectedStatus, setSelectedStatus] = useState(filters.statuses? 
        Number(filters.statuses)===1?'act':Number(filters.statuses)===2? "all":"del":undefined);
    const [searchResult, setSearchResult] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchResultInvoice, setSearchResultInvoice] = useState([]);
    const [searchInvoice, setSearchInvoice] = useState('');
    const [isLoadingSearchInvoice, setIsLoadingSearchInvoice] = useState(false);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [filterSelectedCurrencies, setFilterSelectedCurrencies] = useState([]);
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

    const [creditAmountFromValue, setCreditAmountFromValue] = useState(
        filters.totalInvoiceAmountFrom
    );
    const [creditAmountToValue, setCreditAmountToValue] = useState(
        filters.totalInvoiceAmountTo
    );
    const [paidFromValue, setPaidFromValue] = useState(
        filters.totalPaidAmountFrom
    );
    const [paidToValue, setPaidToValue] = useState(filters.totalPaidAmountTo);

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
    const [numberOfMonthFromValue, setNumberOfMonthFromValue] = useState(
        filters.numberOfMonthsFrom
    );
    const [numberOfMonthToValue, setNumberOfMonthToValue] = useState(
        filters.numberOfMonthsTo
    );

    const [from] = useDebounce(creditAmountFromValue, 600);
    const [to] = useDebounce(creditAmountToValue, 600);
    const [paidFrom] = useDebounce(paidFromValue, 600);
    const [paidTo] = useDebounce(paidToValue, 600);
    const [mustPaidFrom] = useDebounce(mustPaidFromValue, 600);
    const [mustPaidTo] = useDebounce(mustPaidToValue, 600);
    const [monthlyPaymentFrom] = useDebounce(monthlyPaymentFromValue, 600);
    const [monthlyPaymentTo] = useDebounce(monthlyPaymentToValue, 600);
    const [numberOfMonthFrom] = useDebounce(numberOfMonthFromValue, 600);
    const [numberOfMonthTo] = useDebounce(numberOfMonthToValue, 600);

    useEffect(() => {
        if (from !== filters.totalInvoiceAmountFrom) {
            handlePaginationChange(1);
            onFilter('totalInvoiceAmountFrom', from);
        }
    }, [from, filters.totalInvoiceAmountFrom]);

    useEffect(() => {
        if (to !== filters.totalInvoiceAmountTo) {
            handlePaginationChange(1);
            onFilter('totalInvoiceAmountTo', to);
        }
    }, [to, filters.totalInvoiceAmountTo]);

    useEffect(() => {
        if (paidFrom !== filters.totalPaidAmountFrom) {
            handlePaginationChange(1);
            onFilter('totalPaidAmountFrom', paidFrom);
        }
    }, [paidFrom, filters.totalPaidAmountFrom]);

    useEffect(() => {
        if (paidTo !== filters.totalPaidAmountTo) {
            handlePaginationChange(1);
            onFilter('totalPaidAmountTo', paidTo);
        }
    }, [paidTo, filters.totalPaidAmountTo]);

    useEffect(() => {
        if (mustPaidFrom !== filters.remainingAmountFrom) {
            handlePaginationChange(1);
            onFilter('remainingAmountFrom', mustPaidFrom);
        }
    }, [mustPaidFrom, filters.remainingAmountFrom]);

    useEffect(() => {
        if (mustPaidTo !== filters.remainingAmountTo) {
            handlePaginationChange(1);
            onFilter('remainingAmountTo', mustPaidTo);
        }
    }, [mustPaidTo, filters.remainingAmountTo]);

    useEffect(() => {
        if (monthlyPaymentFrom !== filters.monthlyPaymentAmountFrom) {
            handlePaginationChange(1);
            onFilter('monthlyPaymentAmountFrom', monthlyPaymentFrom);
        }
    }, [monthlyPaymentFrom, filters.monthlyPaymentAmountFrom]);

    useEffect(() => {
        if (monthlyPaymentTo !== filters.monthlyPaymentAmountTo) {
            handlePaginationChange(1);
            onFilter('monthlyPaymentAmountTo', monthlyPaymentTo);
        }
    }, [monthlyPaymentTo, filters.monthlyPaymentAmountTo]);

    useEffect(() => {
        if (numberOfMonthFrom !== filters.numberOfMonthsFrom) {
            handlePaginationChange(1);
            onFilter('numberOfMonthsFrom', numberOfMonthFrom);
        }
    }, [numberOfMonthFrom, filters.numberOfMonthsFrom]);

    useEffect(() => {
        if (numberOfMonthTo !== filters.numberOfMonthsTo) {
            handlePaginationChange(1);
            onFilter('numberOfMonthsTo', numberOfMonthTo);
        }
    }, [numberOfMonthTo, filters.numberOfMonthsTo]);

    const [contacts, setContacts] = useState([]);
    const [filterSelectedContacts, setFilterSelectedContacts] = useState([]);

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

    const handleDatePicker = (startValue, endValue) => {
        handlePaginationChange(1);
        const startDate = startValue
            ? moment(startValue).format('DD-MM-YYYY')
            : undefined;
        const endDate = endValue
            ? moment(endValue).format('DD-MM-YYYY')
            : undefined;
        onFilter('createdAtFrom', startDate);
        onFilter('createdAtTo', endDate);
    };

    const toggleButton = (e, type) => {
        // setCurrentPage(1);
        handlePaginationChange(1);
        if (selectedStatus === type) setSelectedStatus('act');
        else setSelectedStatus(type);
        onFilter('statuses', [e]);
    };

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

    function validateInvoice() {
        fetchSalesInvoiceSearch({
            filters: {
                invoiceTypes: filters.invoiceType === 1 ? [2, 4] : [1, 3, 10],
                invoiceNumber: searchInvoice,
                isDeleted: 0,
                limit: 1000,
            },
            onSuccess: onSearchResultInvoice,
        });
    }
    const onSearchResultInvoice = data => {
        setSearchResultInvoice(data.data);
        setIsLoadingSearchInvoice(false);
    };
    useEffect(() => {
        if (timeoutRefInvoice.current !== null) {
            clearTimeout(timeoutRefInvoice.current);
        }

        timeoutRefInvoice.current = setTimeout(() => {
            timeoutRefInvoice.current = null;
            setSearchResultInvoice([]);
            if (searchInvoice !== '') {
                setIsLoadingSearchInvoice(true);
                validateInvoice();
            }
        }, 800);
    }, [searchInvoice]);
    
    useEffect(()=>{
        handlePaginationChange(filters.page? filters.page:1);

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
                setFilterSelectedCurrencies(appendList)
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
                            )
                        }
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
                            handlePaginationChange(1);
                            window.history.replaceState(
                                null,
                                null,
                                '?invoiceType=1'
                            );
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
                            handlePaginationChange(1);
                            window.history.replaceState(
                                null,
                                null,
                                '?invoiceType=2'
                            );
                            onFilter('invoiceType', 2);
                        }}
                    >
                        Kreditor Borclar
                    </Button>
                </div>
            </div>
            <ProSidebarItem label="Tarix">
                <ProDateRangePicker 
                  defaultStartValue={filters.createdAtFrom ? filters.createdAtFrom:undefined}
                  defaultEndValue={filters.createdAtTo ? filters.createdAtTo:undefined}
                onChangeDate={handleDatePicker}
                 />
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
                    valueOnChange={value => {
                        handlePaginationChange(1);
                        onFilter('contacts', value)}}
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
                        handlePaginationChange(1);
                        onFilter('ids', values);
                    }}
                    showSearch
                />
            </ProSidebarItem>

            <ProSidebarItem label="Kredit növü">
                <ProSelect
                    mode="multiple"
                    onChange={value =>{
                        handlePaginationChange(1);
                        onFilter('creditTypes', value)}}
                    data={[{ id: 0, name: 'Sərbəst' }, ...creditTypes]}
                    value={filters.creditTypes?filters.creditTypes.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Status">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Açıq"
                            isActive={selectedStatus === 'act'}
                            onClick={() => toggleButton(1, 'act')}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Bağlı"
                            isActive={selectedStatus === 'all'}
                            onClick={() => toggleButton(2, 'all')}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Silinib"
                            isActive={selectedStatus === 'del'}
                            onClick={() => toggleButton(3, 'del')}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Valyuta">
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxCurrenciesSelectRequest}
                    valueOnChange={currencies =>
                       { handlePaginationChange(1);
                         onFilter('currencies', currencies)}
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
                    value={filters.currencies?filters.currencies.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Qaimə">
                <ProSelect
                    mode="multiple"
                    value={filters.invoiceIds}
                    keys={['invoiceNumber']}
                    data={searchResultInvoice}
                    notFoundContent={
                        isLoadingSearchInvoice ? <Spin size="small" /> : null
                    }
                    onSearch={e => setSearchInvoice(e)}
                    onChange={invoices => {
                        handlePaginationChange(1);
                        onFilter('invoiceIds', invoices)}}
                    showSearch
                />
            </ProSidebarItem>
            <ProSidebarItem label="Kredit məbləği">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProInput
                            value={creditAmountFromValue}
                            onChange={event =>
                                setCreditAmountFromValue(event.target.value)
                            }
                            placeholder="Başlanğıc"
                        />{' '}
                    </Col>
                    <Col span={12}>
                        <ProInput
                            value={creditAmountToValue}
                            onChange={event =>
                                setCreditAmountToValue(event.target.value)
                            }
                            placeholder="Son"
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Ödənilib">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProInput
                            value={paidFromValue}
                            onChange={event =>
                                setPaidFromValue(event.target.value)
                            }
                            placeholder="Başlanğıc"
                        />{' '}
                    </Col>
                    <Col span={12}>
                        <ProInput
                            value={paidToValue}
                            onChange={event =>
                                setPaidToValue(event.target.value)
                            }
                            placeholder="Son"
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Ödənilməlidir">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProInput
                            value={mustPaidFromValue}
                            onChange={event =>
                                setMustPaidFromValue(event.target.value)
                            }
                            placeholder="Başlanğıc"
                        />{' '}
                    </Col>
                    <Col span={12}>
                        <ProInput
                            value={mustPaidToValue}
                            onChange={event =>
                                setMustPaidToValue(event.target.value)
                            }
                            placeholder="Son"
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Aylıq ödəniş">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProInput
                            value={monthlyPaymentFromValue}
                            onChange={event =>
                                setMonthlyPaymentFromValue(event.target.value)
                            }
                            placeholder="Başlanğıc"
                        />{' '}
                    </Col>
                    <Col span={12}>
                        <ProInput
                            value={monthlyPaymentToValue}
                            onChange={event =>
                                setMonthlyPaymentToValue(event.target.value)
                            }
                            placeholder="Son"
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Müddət (Ay) / Dəfə">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={12}>
                        <ProInput
                            value={numberOfMonthFromValue}
                            onChange={event =>
                                setNumberOfMonthFromValue(event.target.value)
                            }
                            placeholder="Başlanğıc"
                        />{' '}
                    </Col>
                    <Col span={12}>
                        <ProInput
                            value={numberOfMonthToValue}
                            onChange={event =>
                                setNumberOfMonthToValue(event.target.value)
                            }
                            placeholder="Son"
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    contacts: state.newContactsReducer.filteredContacts,
    creditTypes: state.creditReducer.creditTypes,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
});
export default connect(
    mapStateToProps,
    {
        fetchBusinessUnitList,
        fetchCreditPayments,
        fetchSalesInvoiceSearch,
        fetchFilteredContacts,
        fetchCurrencies,
    }
)(CreditTablesSidebar);
