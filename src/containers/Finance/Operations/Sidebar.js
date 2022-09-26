import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import {
    Sidebar,
    ProSidebarItem,
    ProSelect,
    ProTypeFilterButton,
    ProDateRangePicker,
    ProJobsSelect,
    ProSearch,
    ProAsyncSelect,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import moment from 'moment';
import { paymentType, defaultFormItemSize } from 'utils';

const OperationsSidebar = props => {
    const {
        employees,
        contacts,
        onFilter,
        expenseCatalogs,
        allCashBoxNames,
        fetchExpenseItemByCatalogId,
        hrmEmployees,
        filters,
        permissionsByKeyValue,
        setCurrentPage,
        profile,
        fetchBusinessUnitList,
        handlePaginationChange
    } = props;

    const { transactionCatalogs, transactionItems } = filters;

    const [subCategories, setSubCategories] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('act');
    const [businessUnits, setBusinessUnits] = useState([]);
    const [filterSelectedBusinessUnit, setFilterSelectedBusinessUnit] = useState([]);
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

    const handleChangeContrparty = counterparties => {
        handlePaginationChange(1);
        const employees = [];
        const hrmEmployees = [];
        const contacts = [];
        const CountryPrtyArray=[]
        counterparties.forEach(counterparty => {
            const [type, id] = counterparty.split('-');
            if (type === '0') {
                employees.push(Number(id));
            } else if (type === '1') {
                hrmEmployees.push(Number(id));
            } else {
                contacts.push(Number(id));
            }
        });

        onFilter('contrParty', counterparties);
        onFilter('tenantPersons', employees);
        onFilter('employees', hrmEmployees);
        onFilter('contacts', contacts);
    };

    const handleDatePicker = (startValue, endValue) => {
        handlePaginationChange(1);
        const startDate = startValue
            ? moment(startValue).format('DD-MM-YYYY')
            : undefined;
        const endDate = endValue
            ? moment(endValue).format('DD-MM-YYYY')
            : undefined;
        onFilter('dateOfTransactionStart', startDate);
        onFilter('dateOfTransactionEnd', endDate);
    };

    const handleChangeCategory = value => {
        handlePaginationChange(1);
        onFilter('transactionCatalogs', value);
        if (value.length > 0) {
            console.log('file', value);
        } else {
            onFilter('transactionItems', value);
        }

        setSubCategories([]);
        value.forEach(item => {
            fetchExpenseItemByCatalogId({ attribute: item }, data => {
                setSubCategories([...subCategories, data.data]);
            });
        });
    };
    const handleChangeTypeOfOperation = value => {
        handlePaginationChange(1);
        onFilter('typeOfOperations', value);
    };
    const handleFilterByCashboxNames = value => {
        handlePaginationChange(1);
        onFilter('cashboxes', value);
    };

    const toggleButton = (e, type) => {
        if (selectedStatus === type) setSelectedStatus('act');
        else setSelectedStatus(type);
        if (filters.isDeleted === e) onFilter('isDeleted', undefined);
        else onFilter('isDeleted', e);
    };

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

    useEffect(()=>{
        if(filters.transactionCatalogs){
            handleChangeCategory(filters.transactionCatalogs.map(Number))
        }
        handlePaginationChange(filters.page? filters.page:1);

        if(filters.isDeleted){
            filters.isDeleted.length==1?
            toggleButton([1], 'del'):toggleButton([0, 1], 'all')
        }
        else{
            toggleButton(undefined, 'act')
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <Sidebar title="Maliyyə">
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
            <ProSidebarItem label="Qarşı tərəf">
                <ProSelect
                    mode="multiple"
                    onChange={handleChangeContrparty}
                    keys={['name', 'surname', 'patronymic']}
                    data={[
                        ...hrmEmployees.map(employee => ({
                            ...employee,
                            id: `1-${employee.id}`,
                        })),
                        ...contacts.map(contact => ({
                            ...contact,
                            id: `2-${contact.id}`,
                        })),
                    ]}
                    value={filters.contrParty?filters.contrParty.map(item=>item):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Hesab">
                <ProSelect
                    mode="multiple"
                    onChange={handleFilterByCashboxNames}
                    data={allCashBoxNames}
                    value={filters.cashboxes?filters.cashboxes.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Əməliyyatın növü">
                <ProSelect
                    mode="multiple"
                    onChange={handleChangeTypeOfOperation}
                    data={[
                        { id: 1, name: 'Mədaxil' },
                        { id: -1, name: 'Məxaric' },
                        { id: 2, name: 'Balans' },
                    ]}
                    value={filters.typeOfOperations?filters.typeOfOperations.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Əməliyyat tarixi">
                <ProDateRangePicker
                 defaultStartValue={filters.dateOfTransactionStart ? filters.dateOfTransactionStart:undefined}
                 defaultEndValue={filters.dateOfTransactionEnd ? filters.dateOfTransactionEnd:undefined}
                 onChangeDate={handleDatePicker}
                  />
            </ProSidebarItem>

            <ProSidebarItem label="Ödəniş təyinatı">
                <ProSelect
                    mode="multiple"
                    onChange={values =>{
                        handlePaginationChange(1);
                         onFilter('transactionTypes', values)}}
                    data={paymentType.filter(
                        ({ key }) => permissionsByKeyValue[key]?.permission >= 1
                    )}
                    value={filters.transactionTypes?filters.transactionTypes.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Kateqoriya">
                <ProJobsSelect
                    allowClear
                    mode="multiple"
                    value={transactionCatalogs}
                    onChange={handleChangeCategory}
                    placeholder="Seçin"
                    data={expenseCatalogs}
                    size={defaultFormItemSize}
                  
                />
            </ProSidebarItem>
            <ProSidebarItem label="Alt kateqoriya">
                <ProJobsSelect
                    allowClear
                    mode="multiple"
                    data={[].concat.apply([], subCategories)}
                    value={filters.transactionItems?filters.transactionItems.map(Number):transactionItems}
                    onChange={value => {
                        handlePaginationChange(1);
                        onFilter('transactionItems', value)}}
                    placeholder="Seçin"
                    size={defaultFormItemSize}
                    disabled={!transactionCatalogs?.length}
                />
            </ProSidebarItem>

            <ProSidebarItem label="Ödəniş növü">
                <ProSelect
                    mode="multiple"
                    onChange={e => onFilter('paymentTypes', e)}
                    data={[
                        { id: 1, name: 'Nəğd' },
                        { id: 2, name: 'Bank Transferi' },
                        { id: 3, name: 'Kart ödənişi' },
                        { id: 4, name: 'Digər' },
                    ]}
                    value={filters.paymentTypes?filters.paymentTypes.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Əməliyyatçı">
                <ProSelect
                    mode="multiple"
                    onChange={e => {
                        handlePaginationChange(1);
                        onFilter('createdByIds', e)}}
                    keys={['name', 'lastName']}
                    data={employees}
                    value={filters.createdByIds?filters.createdByIds.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Status">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={9}>
                        <ProTypeFilterButton
                            label="Aktiv"
                            isActive={selectedStatus === 'act'}
                            onClick={() =>{
                                handlePaginationChange(1);
                                toggleButton(undefined, 'act')}}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Silinmiş"
                            isActive={selectedStatus === 'del'}
                            onClick={() => {
                                handlePaginationChange(1);
                                toggleButton([1], 'del')}}
                        />
                    </Col>
                    <Col span={7}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={selectedStatus === 'all'}
                            onClick={() =>{
                                handlePaginationChange(1);
                                toggleButton([0, 1], 'all')}}
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

const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
});
export default connect(
    mapStateToProps,
    { fetchBusinessUnitList }
)(OperationsSidebar);
