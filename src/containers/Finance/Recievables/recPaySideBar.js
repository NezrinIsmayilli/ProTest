/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Select, Icon, Col, Row } from 'antd';
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
import moment from 'moment';
import { fetchContacts } from 'store/actions/contact';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchUsers } from 'store/actions/users';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import { useDebounce } from 'use-debounce';

import { connect } from 'react-redux';
import styles from './styles.module.scss';

const { Option } = Select;

function RecPaySideBar({
    fetchContacts,
    filters,
    onFilter,
    type,
    salesman,
    businessUnits,
    profile,
    ajaxBusinessUnitSelectRequest,
    ajaxSalesmansSelectRequest,
    handlePaginationChange,
    fetchUsers,
    fetchBusinessUnitList,
}) {
    const [agents, setAgents] = useState([]);
    const [
        filterSelectedSalesManagers,
        setFilterSelectedSalesManagers,
    ] = useState([]);
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);
    const [filterSelectedContacts, setFilterSelectedContacts] = useState([]);
    const [amountFromValue, setAmountToBePaidFromValue] = useState(
        filters.amountToBePaidFrom
    );
    const [amountToValue, setAmountToBePaidToValue] = useState(
        filters.amountToBePaidTo
    );
    const [description, setDescription] = useState(
        filters.description ? filters.description : undefined
    );
    const [from] = useDebounce(amountFromValue, 600);
    const [to] = useDebounce(amountToValue, 600);

    useEffect(() => {
        if (from !== filters.amountToBePaidFrom) {
            onFilter('amountToBePaidFrom', from);
        }
    }, [from, filters.amountToBePaidFrom]);

    useEffect(() => {
        if (to !== filters.amountToBePaidTo) {
            onFilter('amountToBePaidTo', to);
        }
    }, [to, filters.amountToBePaidTo]);

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

    const handleChange = (e, value) => {
        setDescription(e.target.value);
        if (e.target.value === '') {
            onFilter('description', value);
            handlePaginationChange(1);
        }

    };

    useEffect(() => {
        handlePaginationChange(filters.page ? filters.page : 1);

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

        if (filters.contrparty) {
            fetchContacts({ name: filters.contrparty }, data => {
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
    }, []);

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
        <Sidebar title={type ? 'Kreditor borclar' : 'Debitor borclar'}>
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
                                (businessUnitLength === 1
                                    ? businessUnits[0]?.id === null
                                        ? businessUnits[0]?.name
                                        : businessUnits[0]?.id
                                    : filters.businessUnitIds)
                            }
                        />
                    </ProSidebarItem>
                )}
                <div className={styles.sidebarItem}>
                    <span className={styles.sectionName}>Qarşı tərəf</span>
                    <ProAsyncSelect
                        placeholder="Tərəfi seçin"
                        id={false}
                        selectRequest={ajaxSelectRequest}
                        valueOnChange={e => {
                            handlePaginationChange(1);
                            onFilter('contrparty', e)}}
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
                        value={filters.contrparty?filters.contrparty:undefined}
                    />
                </div>
                <ProSidebarItem label="Satış meneceri">
                    <ProAsyncSelect
                        mode="multiple"
                        keys={['name', 'lastName']}
                        selectRequest={ajaxSalesmansSelectRequest}
                        valueOnChange={values =>{
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
                     defaultStartValue={filters.dateOfTransactionFrom ? filters.dateOfTransactionFrom:undefined}
                     defaultEndValue={filters.dateOfTransactionTo ? filters.dateOfTransactionTo:undefined}
                     onChangeDate={handleDatePicker}
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
                                    { handlePaginationChange(1);
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
                                    {   handlePaginationChange(1);
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
                                onClick={() => {
                                    handlePaginationChange(1);
                                    onFilter('borrow',0)
                                    onFilter('withDebt', 1)}}
                            />
                        </Col>
                        <Col span={8}>
                            <ProTypeFilterButton
                                label="Yox"
                                isActive={filters.withDebt == 0}
                                onClick={() => {
                                    handlePaginationChange(1);
                                    onFilter('borrow',0)
                                    onFilter('withDebt', 0)}}
                            />
                        </Col>
                        <Col span={8}>
                            <ProTypeFilterButton
                                label="Hamısı"
                                isActive={filters.withDebt == undefined}
                                onClick={() => {
                                    handlePaginationChange(1);
                                    onFilter('borrow',1)
                                    onFilter('withDebt', null)}}
                            />
                        </Col>
                    </Row>
                </ProSidebarItem>
                <ProSidebarItem label="Əlavə məlumat">
                    <ProSearch
                        onSearch={value =>{   
                             handlePaginationChange(1);
                             onFilter('description', value)}}
                        onChange={(e, value) => handleChange(e, value)}
                        value={description}
                    />
                </ProSidebarItem>
            </div>
        </Sidebar>
    );
}

const mapStateToProps = state => ({
    contacts: state.contactsReducer.contacts,
    profile: state.profileReducer.profile,
});
export default connect(
    mapStateToProps,
    { fetchContacts, fetchUsers, fetchBusinessUnitList }
)(RecPaySideBar);
