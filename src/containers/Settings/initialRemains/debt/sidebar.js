import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import {
    ProSidebarItem,
    ProDateRangePicker,
    ProSelect,
    ProSearch,
    ProTypeFilterButton,
} from 'components/Lib';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { Spin, Checkbox } from 'antd';
import moment from 'moment';
import {
    fetchSalesInvoiceList,
    fetchSalesInvoiceSearch,
    fetchSalesInvoiceCount,
    fetchInitialDebtList,
    fetchInitialDebtCount,
} from 'store/actions/salesAndBuys';
import { getContact } from 'store/actions/contacts-new';

const InitialRemainsCashboxSideBar = props => {
    const {
        businessUnits,
        profile,
        fetchInitialDebtCount,
        fetchSalesInvoiceSearch,
        fetchInitialDebtList,
        fetchSalesInvoiceCount,
        getContact,
        contactsLoading,
        initialDebt,
    } = props;

    const timeoutRef = useRef(null);
    const url = new URL(window.location.href);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const contactsParam = urlParams.get('contacts');
    const contactParam = urlParams.get('clients');

    const [searchResult, setSearchResult] = useState([]);
    const [search, setSearch] = useState('');
    const [contact, setContact] = useState([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [filter, setFilter] = useState({});

    const [filters, onFilter] = useFilterHandle(
        {
            contacts:
                contactsParam !== null && contactsParam !== ''
                    ? contactsParam.split(',').map(Number)
                    : undefined,
            clients: undefined,
            dateFrom: undefined,
            dateTo: undefined,
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
            limit: 8,
            page: 1,
            isDeleted: 0,
        },
        ({ filters }) => {
            fetchInitialDebtList({ filters: { ...filter, ...filters } });
            fetchInitialDebtCount({ filters: { ...filter, ...filters } });
        }
    );

    useEffect(() => {
        if (filters?.businessUnitIds) {
            getContact(
                { businessUnitIds: filters?.businessUnitIds },
                ({ data }) => {
                    setContact(data);
                }
            );
        } else {
            getContact({}, ({ data }) => {
                setContact(data);
            });
        }
    }, [filters.businessUnitIds]);
    useEffect(() => {
        fetchInitialDebtList({
            filters: {
                ...filters,
                businessUnitIds: filter.businessUnitIds,
            },
        });
        fetchInitialDebtCount({
            filters: { ...filters, businessUnitIds: filter.businessUnitIds },
        });
    }, [filter]);

    const addParamsToUrl = (key, value) => {
        if (Array.isArray(value)) {
            url.searchParams.set(`${key}`, value);
        } else {
            url.searchParams.set(key, value);
        }
        window.history.replaceState(null, null, url);
    };

    const handleCheckbox = ({ target: { checked } }) => {
        onFilter('withoutDebt', checked ? 1 : undefined);
        addParamsToUrl('withoutDebt', checked ? 1 : undefined);
    };

    function validate() {
        fetchSalesInvoiceSearch({
            filters: {
                invoiceNumber: search,
                invoiceTypes: [13],
            },
            onSuccess: onSearchResult,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

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

    return (
        <>
            {businessUnits?.length === 1 &&
            profile?.businessUnits?.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProSelect
                        mode="multiple"
                        onChange={values => {
                            addParamsToUrl('businessUnitIds', values);
                            onFilter('businessUnitIds', values);
                        }}
                        value={
                            businessUnits?.length === 1
                                ? businessUnits[0]?.id === null
                                    ? businessUnits[0]?.name
                                    : businessUnits[0]?.id
                                : filters?.businessUnitIds
                        }
                        disabled={businessUnits?.length === 1}
                        data={businessUnits?.map(item =>
                            item.id === null ? { ...item, id: 0 } : item
                        )}
                        disabledBusinessUnit={businessUnits?.length === 1}
                    />
                </ProSidebarItem>
            )}
            <ProSidebarItem label="İlkin qalıq tarixi">
                <ProDateRangePicker
                    placeholderStart="Başlama"
                    placeholderEnd="Bitmə"
                    getCalendarContainer={trigger =>
                        trigger.parentNode.parentNode
                    }
                    onChangeDate={handleDatePicker}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Qarşı tərəf">
                <ProSelect
                    mode="multiple"
                    onChange={values => {
                        addParamsToUrl('contacts', values);
                        onFilter('contacts', values);
                    }}
                    data={contact}
                    value={filters.contacts}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Sənəd">
                <ProSelect
                    mode="multiple"
                    value={filters.clients}
                    keys={['invoiceNumber']}
                    data={searchResult.map(result => ({
                        ...result,
                        id: result.clientId,
                    }))}
                    notFoundContent={
                        isLoadingSearch ? <Spin size="small" /> : null
                    }
                    onSearch={e => setSearch(e)}
                    onChange={values => {
                        onFilter('clients', values);
                        const filter = {
                            businessUnitIds: searchResult
                                .filter(result =>
                                    values.includes(result.clientId)
                                )
                                .map(({ businessUnitId }) =>
                                    businessUnitId === null ? 0 : businessUnitId
                                ),
                        };
                        setFilter(filter);
                    }}
                    showSearch
                />
            </ProSidebarItem>
            <ProSidebarItem>
                <Checkbox
                    checked={filters.withoutDebt === 1}
                    style={{ fontSize: '13px' }}
                    onChange={handleCheckbox}
                >
                    Borcu olmayanları göstər
                </Checkbox>
            </ProSidebarItem>
        </>
    );
};

const mapStateToProps = state => ({
    tenant: state.tenantReducer.tenant,
    permissionsList: state.permissionsReducer.permissions,
    businessUnits: state.businessUnitReducer.businessUnits,
    profile: state.profileReducer.profile,
    contacts: state.contactsReducer.contacts,
    contactsLoading: state.contactsReducer.isLoading,
    initialDebt: state.salesAndBuysReducer.initialDebt,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceList,
        fetchSalesInvoiceSearch,
        fetchSalesInvoiceCount,
        fetchInitialDebtList,
        getContact,
        fetchInitialDebtCount,
    }
)(InitialRemainsCashboxSideBar);
