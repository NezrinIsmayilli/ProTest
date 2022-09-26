import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Input, Button, Row, Col } from 'antd';
import { fetchUsedCurrencies } from 'store/actions/settings/kassa';
import { setVatInvoices } from 'store/actions/vat-invoices';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchUsers } from 'store/actions/users';
import moment from 'moment';
import {
    Sidebar,
    ProSidebarItem,
    ProDateRangePicker,
    ProInput,
    ProSelect,
    ProTypeFilterButton,
    ProSearch,
    ProAsyncSelect,
} from 'components/Lib';
import { useDebounce } from 'use-debounce';
import styles from '../styles.module.scss';

const VatSidebar = props => {
    const dispatch = useDispatch();
    const {
        onFilter,
        filters,
        fetchUsedCurrencies,
        setVatInvoices,
        profile,
        setCurrentPage,
        fetchBusinessUnitList,
        fetchUsers,
        handlePaginationChange,
        setChangeCurrency
    } = props;
    const [dataType, setDataType] = useState(filters.type?filters.type: 'recievables');
    const [amountFromValue, setAmountToBePaidFromValue] = useState(
        filters.amountToBePaidFrom
    );
    const [amountToValue, setAmountToBePaidToValue] = useState(
        filters.amountToBePaidTo
    );
    const [businessUnits, setBusinessUnits] = useState([]);
    const [salesman, setSalesman] = useState([]);
    const [
        filterSelectedSalesManagers,
        setFilterSelectedSalesManagers,
    ] = useState([]);
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);
    const [countryPrty, setCountryPrty] = useState(filters.contrparty?filters.contrparty: null);
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

    useEffect(() => {
        if (businessUnits) {
            if (businessUnitLength === 1 && businessUnits[0]?.id !== null) {
                onFilter('businessUnitIds', [businessUnits[0]?.id]);
            } else {
                onFilter('businessUnitIds',filters.businessUnitIds ? filters.businessUnitIds.map(Number): undefined);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessUnits]);

    useEffect(() => {
        if (filters?.businessUnitIds) {
            ajaxSalesmansSelectRequest(1, 20, '', 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.businessUnitIds]);

    const [from] = useDebounce(amountFromValue, 600);
    const [to] = useDebounce(amountToValue, 600);

    useEffect(() => {
        if (from !== filters.amountToBePaidFrom) {
            onFilter('amountToBePaidFrom', from);
        }
    }, [from, filters.amountToBePaidFrom, onFilter]);

    useEffect(() => {
        if (to !== filters.amountToBePaidTo) {
            onFilter('amountToBePaidTo', to);
        }
    }, [to, filters.amountToBePaidTo, onFilter]);

    const handlePaymentTypeFilter = type => {
        setDataType(type);
        onFilter('type', type);
        onFilter('page', 1);
        setCurrentPage(1);
        setChangeCurrency(type)
        fetchUsedCurrencies(
            type === 'recievables'
                ? {
                      usedInTaxInvoice: 1,
                      invoiceType: [2, 4, 13],
                  }
                : { usedInTaxInvoice: 1, invoiceType: [1, 3, 12] },
            ({ data }) => {
                if (data.length > 0) {
                    onFilter('currencyId', data[0].id);
                } else {
                    dispatch(setVatInvoices({ data: [] }));
                }
            }
        );
    };

    const handleNameFilter = searchValue => {
        handlePaginationChange(1);
        onFilter('contrparty', searchValue);
    };

    const handleChange = (e, value) => {
        setDescription(e.target.value);
        if (e.target.value === '') {
            onFilter('description', value);
           handlePaginationChange(1);
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
        onFilter('dateOfTransactionFrom', startDate);
        onFilter('dateOfTransactionTo', endDate);
    };

    const handleDaysChange = (type, value) => {
        handlePaginationChange(1);
        const re = /^(?:[1-9][0-9]*|0)$/;
        if (re.test(value)) onFilter(type, value);
        if (value === '') onFilter(type, null);
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
    },[])
    return (
        <Sidebar title="ƏDV">
            <div className={styles.Sidebar}>
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
                                dataType === 'recievables'
                                    ? styles.dataButtonActive
                                    : null
                            }`}
                            onClick={() =>
                                handlePaymentTypeFilter('recievables')
                            }
                        >
                            Debitor Borclar
                        </Button>
                        <Button
                            className={`${styles.dataButton} ${
                                dataType === 'payables'
                                    ? styles.dataButtonActive
                                    : null
                            }`}
                            onClick={() => handlePaymentTypeFilter('payables')}
                        >
                            Kreditor Borclar
                        </Button>
                    </div>
                </div>
                <div className={styles.sidebarItem}>
                    <Input.Group className={styles.inputGroup}>
                        <span className={styles.sectionName}>Qarşı tərəf</span>
                        <Input.Search
                            className={styles.input}
                            size="large"
                            onSearch={handleNameFilter}
                            onChange={e=> {
                                if(e.target.value==''){
                                    handlePaginationChange(1);
                                    onFilter('contrparty',undefined);
                                } setCountryPrty(e.target.value)}}
                            placeholder="Axtar"
                            value={countryPrty}
                        />
                    </Input.Group>
                </div>
                <ProSidebarItem label="Satış meneceri">
                    <ProAsyncSelect
                        mode="multiple"
                        keys={['name', 'lastName']}
                        selectRequest={ajaxSalesmansSelectRequest}
                        valueOnChange={values => {
                            handlePaginationChange(1);
                            onFilter('salesmans', values)}}
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
                <ProSidebarItem label="Son ödəniş tarixi">
                    <ProDateRangePicker
                     onChangeDate={handleDatePicker}
                     defaultStartValue={filters.dateOfTransactionFrom ? filters.dateOfTransactionFrom:undefined}
                     defaultEndValue={filters.dateOfTransactionTo ? filters.dateOfTransactionTo:undefined}
                      />
                </ProSidebarItem>
                <ProSidebarItem label="Günlərin sayı">
                    <div className={styles.flexRow}>
                        <ProInput
                            value={filters.daysFrom}
                            onChange={event =>
                                handleDaysChange('daysFrom', event.target.value)
                            }
                            placeholder="Dan"
                        />
                        <ProInput
                            value={filters.daysTo}
                            onChange={event =>
                                handleDaysChange('daysTo', event.target.value)
                            }
                            placeholder="Dək"
                        />
                    </div>
                </ProSidebarItem>
                <ProSidebarItem label="Ödəniləcək borc aralığı">
                    <Row gutter={2} style={{ marginTop: '8px' }}>
                        <Col span={12}>
                            <ProInput
                                value={amountFromValue}
                                onChange={event =>
                                   {    handlePaginationChange(1);
                                        setAmountToBePaidFromValue(
                                        event.target.value
                                    )}
                                }
                                placeholder="Başlanğıc"
                            />{' '}
                        </Col>
                        <Col span={12}>
                            <ProInput
                                value={amountToValue}
                                onChange={event =>
                                   {    handlePaginationChange(1);
                                        setAmountToBePaidToValue(event.target.value)}
                                }
                                placeholder="Son"
                            />
                        </Col>
                    </Row>
                </ProSidebarItem>
                <ProSidebarItem label="Borc">
                    <Row gutter={2} style={{ marginTop: '8px' }}>
                        <Col span={8}>
                            <ProTypeFilterButton
                                label="Var"
                                isActive={filters.withDebt == 1}
                                onClick={() =>{
                                    handlePaginationChange(1);
                                    onFilter('borrow',0);
                                    onFilter('withDebt', 1)}}
                            />
                        </Col>
                        <Col span={8}>
                            <ProTypeFilterButton
                                label="Yox"
                                isActive={filters.withDebt == 0}
                                onClick={() => {
                                    handlePaginationChange(1);
                                    onFilter('borrow',0);
                                    onFilter('withDebt', 0)}}
                            />
                        </Col>
                        <Col span={8}>
                            <ProTypeFilterButton
                                label="Hamısı"
                                isActive={filters.withDebt == undefined}
                                onClick={() => {
                                    handlePaginationChange(1);
                                    onFilter('borrow',1);
                                    onFilter('withDebt', null)}}
                            />
                        </Col>
                    </Row>
                </ProSidebarItem>
                <ProSidebarItem label="Əlavə məlumat">
                    <ProSearch
                        onSearch={value => {
                            handlePaginationChange(1);
                            onFilter('description', value)}}
                        onChange={(e, value) => handleChange(e, value)}
                        value={description}
                    />
                </ProSidebarItem>
            </div>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    usedCurrencies: state.kassaReducer.usedCurrencies,
});

export default connect(
    mapStateToProps,
    {
        fetchUsedCurrencies,
        setVatInvoices,
        fetchBusinessUnitList,
        fetchUsers,
    }
)(VatSidebar);
