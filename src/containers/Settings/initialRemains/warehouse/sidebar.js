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
import { Spin, Row, Col } from 'antd';
import moment from 'moment';
import { fetchStocks } from 'store/actions/stock';
import { fetchProducts } from 'store/actions/product';
import {
    fetchSalesInvoiceList,
    fetchSalesInvoiceSearch,
    fetchSalesInvoiceCount,
} from 'store/actions/salesAndBuys';

const InitialRemainsCashboxSideBar = props => {
    const {
        businessUnits,
        profile,
        stocks,
        products,
        fetchStocks,
        fetchProducts,
        fetchSalesInvoiceList,
        fetchSalesInvoiceSearch,
        fetchSalesInvoiceCount,
    } = props;

    const timeoutRef = useRef(null);
    const url = new URL(window.location.href);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const stocksParam = urlParams.get('stocks');
    const isDeleted = urlParams.get('isDeleted');

    const [searchResult, setSearchResult] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('act');

    const [filters, onFilter] = useFilterHandle(
        {
            invoiceTypes: [7],
            invoices: undefined,
            stocks:
                stocksParam !== null && stocksParam !== ''
                    ? stocksParam.split(',').map(Number)
                    : undefined,
            dateFrom: undefined,
            dateTo: undefined,
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
            isDeleted: isDeleted === null ? 0 : isDeleted,
        },
        ({ filters }) => {
            fetchSalesInvoiceList({ filters });
            fetchSalesInvoiceCount({ filters });
        }
    );

    useEffect(() => {
        fetchProducts({ filters: { type: 'product', isDeleted: 0 } });
    }, [fetchProducts]);

    useEffect(() => {
        if (filters?.businessUnitIds) {
            fetchStocks({ limit: 1000, businessUnitIds: filters?.businessUnitIds });
        } else {
            fetchStocks({ limit: 1000 });
        }
    }, [fetchStocks, filters.businessUnitIds]);

    const addParamsToUrl = (key, value) => {
        if (Array.isArray(value)) {
            url.searchParams.set(`${key}`, value);
        } else {
            url.searchParams.set(key, value);
        }
        window.history.replaceState(null, null, url);
    };

    function validate() {
        fetchSalesInvoiceSearch({
            filters: {
                invoiceNumber: search,
                invoiceTypes: [7],
            },
            onSuccess: onSearchResult,
        });
    }

    const onSearchResult = data => {
        setSearchResult(data.data);
        setIsLoadingSearch(false);
    };

    const toggleButton = (e, type) => {
        if (selectedStatus === type) setSelectedStatus('act');
        else setSelectedStatus(type);
        if (filters.isDeleted === e) {
            addParamsToUrl('isDeleted', 0);
            onFilter('isDeleted', 0);
        } else {
            addParamsToUrl('isDeleted', e);
            onFilter('isDeleted', e);
        }
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

    useEffect(() => {
        if (filters.isDeleted) {
            setSelectedStatus('del');
        } else if (filters.isDeleted === 0 || filters.isDeleted === null) {
            setSelectedStatus('act');
        } else {
            setSelectedStatus('all');
        }
    }, [filters.isDeleted]);

    const handleSearchSerialNumberFilter = value => {
        if (value) {
            addParamsToUrl('serialNumber', value);
            onFilter('serialNumber', value);
        } else {
            addParamsToUrl('serialNumber', null);
            onFilter('serialNumber', null);
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
            <ProSidebarItem label="Status">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={9}>
                        <ProTypeFilterButton
                            label="Aktiv"
                            isActive={selectedStatus === 'act'}
                            onClick={() => toggleButton(0, 'act')}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Silinib"
                            isActive={selectedStatus === 'del'}
                            onClick={() => toggleButton(1, 'del')}
                        />
                    </Col>
                    <Col span={7}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={selectedStatus === 'all'}
                            onClick={() => toggleButton(undefined, 'all')}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Anbar">
                <ProSelect
                    mode="multiple"
                    onChange={values => {
                        addParamsToUrl('stocks', values);
                        onFilter('stocks', values);
                    }}
                    data={stocks}
                    value={filters.stocks}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Məhsul adı">
                <ProSelect
                    mode="multiple"
                    onChange={values => {
                        addParamsToUrl('products', values);
                        onFilter('products', values);
                    }}
                    data={products}
                    showSearch
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
            <ProSidebarItem label="Sənəd">
                <ProSelect
                    mode="multiple"
                    value={filters?.invoices}
                    keys={['invoiceNumber']}
                    data={searchResult}
                    notFoundContent={
                        isLoadingSearch ? <Spin size="small" /> : null
                    }
                    onSearch={e => setSearch(e)}
                    onChange={values => {
                        addParamsToUrl('invoices', values);
                        onFilter('invoices', values);
                    }}
                    showSearch
                />
            </ProSidebarItem>
        </>
    );
};

const mapStateToProps = state => ({
    tenant: state.tenantReducer.tenant,
    permissionsList: state.permissionsReducer.permissions,
    businessUnits: state.businessUnitReducer.businessUnits,
    profile: state.profileReducer.profile,
    stocks: state.stockReducer.stocks,
    products: state.productReducer.products,
});

export default connect(
    mapStateToProps,
    {
        fetchStocks,
        fetchProducts,
        fetchSalesInvoiceList,
        fetchSalesInvoiceSearch,
        fetchSalesInvoiceCount,
    }
)(InitialRemainsCashboxSideBar);
