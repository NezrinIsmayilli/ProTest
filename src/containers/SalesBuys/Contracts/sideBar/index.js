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
import { fetchContacts } from 'store/actions/contact';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchUsers } from 'store/actions/users';
import moment from 'moment';
import { Row, Col, Button } from 'antd';
import { connect } from 'react-redux';
import styles from './styles.module.scss';

const ContractSideBar = props => {
  const {
    fetchContacts,
    fetchUsers,
    fetchCurrencies,
    users,
    onFilter,
    handlePaginationChange,
    filters,
    profile,
    contractsCount,
    fetchBusinessUnitList,
  } = props;
  const [selectedType, setSelectedType] = useState(filters.types?Number(filters.types):null);
  const [selectedFilterDirection, setSelectedFilterDirection] = 
  useState(filters.directions ? Number(filters.directions) :  null);

  const [selectedFilterStatus, setSelectedFilterStatus] = useState(filters.status?Number(filters.status):null);
  const [contract, setContract] = useState(filters.contractNo? filters.contractNo:null);
  const [amountFrom, setAmountFrom] = useState(filters.amountFrom? filters.amountFrom:'');
  const [amountTo, setAmountTo] = useState(filters.amountTo? filters.amountTo:'');
  const [description, setDescription] = useState(filters.description? filters.description:undefined);
  const [limitedContacts, setLimitedContacts] = useState([]);
  const [responsiblePersons, setResponsiblePersons] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [
    filterSelectedBusinessUnit,
    setFilterSelectedBusinessUnit,
  ] = useState([]);
    const [filterSelectedCurrencies, setFilterSelectedCurrencies] = useState(
        []
    );
    const [filterSelectedContacts, setFilterSelectedContacts] = useState([]);
    const [filterSelectedResponsiblePersons, setFilterSelectedResponsiblePersons] = useState([]);
    const [filterSelectedRelatedContacts, setFilterSelectedRelatedContacts] = useState([]);
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

    useEffect(() => {
      if (filters?.businessUnitIds) {
        ajaxSelectResponsiblePersonsRequest(1, 20, '', 1);
      }
  }, [filters.businessUnitIds]);
    
  const ajaxSelectRelatedContactsRequest = (
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
            setContacts(appendList);
        } else {
            setContacts(contacts.concat(appendList));
        }
    });
  };

    const ajaxSelectResponsiblePersonsRequest = (
      page = 1,
      limit = 20,
      search = '',
      stateReset = 0,
      onSuccessCallback
    ) => {
      const defaultFilters = { limit, page, name: search, businessUnitIds: filters?.businessUnitIds, };
      fetchUsers({filters: defaultFilters, onSuccessCallback: data => {
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
              setResponsiblePersons(appendList);
          } else {
              setResponsiblePersons(responsiblePersons.concat(appendList));
          }
      }});
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
            setLimitedContacts(appendList);
        } else {
            setLimitedContacts(limitedContacts.concat(appendList));
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

  const handleFilterByType = (type, values) => {
    onFilter(type, values);
    handlePaginationChange(1);
  };
  const handleChange = (e, value) => {
    setDescription(e.target.value)
    if (e.target.value === '') {
      onFilter('description', value);
      handlePaginationChange(1);
    }
  };

  const handleFilterDirection = (value = null) => {
    if (value) {
      setSelectedFilterDirection(value);
      onFilter('directions', [value]);
    } else {
      setSelectedFilterDirection(null);
      onFilter('directions', null);
    }
    handlePaginationChange(1);
  };

  const handleFilterType = (value = null) => {
    if (value) {
      setSelectedType(value);
      onFilter('types', [value]);
    } else {
      setSelectedType(null);
      onFilter('types', null);
    }
    handlePaginationChange(1);
  };
  const handleFilterStatus = (value = null) => {
    setSelectedFilterStatus(value);
    onFilter('status', value);
    handlePaginationChange(1);
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

  const handleFilterAmount = (type, value) => {
    if (type === 'from') setAmountFrom(value);
    if (type === 'to') setAmountTo(value);
    if (type === 'submit') {
      onFilter('amountFrom', amountFrom);
      onFilter('amountTo', amountTo);
      handlePaginationChange(1);
    }
   
  };

  useEffect(() => {
    handlePaginationChange(filters.page? filters.page:1);

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
    if (filters.contacts) {
      fetchContacts({ ids: filters.contacts.map(Number) }, data => {
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
    if (filters.currencies) {
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

    if (filters.responsiblePersons) {
      fetchUsers({filters: { ids: filters.responsiblePersons.map(Number) }, onSuccessCallback: data => {
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
        setFilterSelectedResponsiblePersons(appendList)
      }}); 
    }
    if (filters.relatedContacts) {
      fetchContacts({ ids: filters.relatedContacts.map(Number)}, data => {
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
        setFilterSelectedRelatedContacts(appendList)
      }); 
    }
  }, []);

  return (
    <Sidebar title="Müqavilələr">
      {businessUnitLength === 1 &&
      profile.businessUnits.length === 0 ? null : (
        <ProSidebarItem label="Biznes blok">
          <ProAsyncSelect
            mode="multiple"
            selectRequest={ajaxBusinessUnitSelectRequest}
            valueOnChange={values => {
              handleFilterByType('businessUnitIds', values)
            }}
            value={
              filters.businessUnitIds ? filters.businessUnitIds.map(Number):
              (businessUnitLength === 1
                ? businessUnits[0]?.id === null
                  ? businessUnits[0]?.name
                  : businessUnits[0]?.id
                : filters.businessUnitIds)
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
          defaultStartValue={filters.dateFrom ? filters.dateFrom:undefined}
          defaultEndValue={filters.dateTo ? filters.dateTo:undefined}
          style={{ marginTop: '8px' }}
          placeholder="Seçin"
        />
      </ProSidebarItem>
      <ProSidebarItem label="Qarşı tərəf">
        <ProAsyncSelect
          mode="multiple"
          selectRequest={ajaxSelectRequest}
          valueOnChange={contacts =>
            handleFilterByType('contacts', contacts)
          }
          data={
              filterSelectedContacts.length > 0
                  ? [
                        ...filterSelectedContacts,
                        ...limitedContacts.filter(
                            item =>
                                !filterSelectedContacts
                                    .map(({ id }) => id)
                                    ?.includes(item.id)
                        ),
                    ]
                  : limitedContacts
          }
          value={
              filters.contacts
                  ? filters.contacts.map(Number)
                  : undefined
          }
        />
      </ProSidebarItem>
      <ProSidebarItem label="Növ">
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
      <ProSidebarItem label="İstiqamət">
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
              label="Alış"
              isActive={selectedFilterDirection === 1}
              onClick={() => handleFilterDirection(1)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Satış"
              isActive={selectedFilterDirection === 2}
              onClick={() => handleFilterDirection(2)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      <ProSidebarItem label="Müqavilə">
        <ProSearch
          onSearch={contractNo => handleFilterByType('contractNo', contractNo)}
          onChange={(e)=> {
            setContract(e.target.value);
            if(e.target.value === '') {
              handleFilterByType('contractNo', undefined)
            }
          }}
          value={contract}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Məsul şəxs">
        <ProAsyncSelect
          mode="multiple"
          keys={['name', 'lastName']}
          selectRequest={ajaxSelectResponsiblePersonsRequest}
          valueOnChange={people => handleFilterByType('responsiblePersons', people)}
          data={
              filterSelectedResponsiblePersons.length > 0
                  ? [
                        ...filterSelectedResponsiblePersons,
                        ...responsiblePersons.filter(
                            item =>
                                !filterSelectedResponsiblePersons
                                    .map(({ id }) => id)
                                    ?.includes(item.id)
                        ),
                    ]
                  : responsiblePersons
          }
          value={
              filters.responsiblePersons
                  ? filters.responsiblePersons.map(Number)
                  : undefined
          }
        />
      </ProSidebarItem>
      <ProSidebarItem label="Əlaqəli tərəflər">
        <ProAsyncSelect
          mode="multiple"
          selectRequest={ajaxSelectRelatedContactsRequest}
          valueOnChange={contacts =>
            handleFilterByType('relatedContacts', contacts)}
          data={
              filterSelectedRelatedContacts.length > 0
                  ? [
                        ...filterSelectedRelatedContacts,
                        ...contacts.filter(
                            item =>
                                !filterSelectedRelatedContacts
                                    .map(({ id }) => id)
                                    ?.includes(item.id)
                        ),
                    ]
                  : contacts
          }
          value={
              filters.relatedContacts
                  ? filters.relatedContacts.map(Number)
                  : undefined
          }
        />
      </ProSidebarItem>

      <ProSidebarItem label="Valyuta">
        <ProAsyncSelect
          mode="multiple"
          selectRequest={ajaxCurrenciesSelectRequest}
          valueOnChange={currencies => handleFilterByType('currencies', currencies)}
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
              filters.currencies
                  ? filters.currencies.map(Number)
                  : undefined
          }
      />
      </ProSidebarItem>
      <ProSidebarItem label="Məbləğ">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <ProInput
              value={amountFrom}
              onChange={event => handleFilterAmount('from', event.target.value)}
              placeholder="Dən"
            />{' '}
          </Col>
          <Col span={12}>
            <ProInput
              value={amountTo}
              onChange={event => handleFilterAmount('to', event.target.value)}
              placeholder="Dək"
            />
          </Col>
          <Col span={24}>
            <Button
              onClick={() => handleFilterAmount('submit')}
              style={{ marginTop: 16 }}
              className={styles.submitButton}
              type="primary"
            >
              Axtar
            </Button>
          </Col>
        </Row>
      </ProSidebarItem>

      <ProSidebarItem label="Status">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <ProTypeFilterButton
              label="Hamısı"
              isActive={selectedFilterStatus === null}
              onClick={() => handleFilterStatus()}
            />
          </Col>
          <Col span={12}>
            <ProTypeFilterButton
              label="Imzalı"
              isActive={selectedFilterStatus === 1}
              onClick={() => handleFilterStatus(1)}
            />
          </Col>
        </Row>
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <ProTypeFilterButton
              label="Qaralama"
              isActive={selectedFilterStatus === 2}
              onClick={() => handleFilterStatus(2)}
            />
          </Col>
          <Col span={12}>
            <ProTypeFilterButton
              label="Silinib"
              isActive={selectedFilterStatus === 3}
              onClick={() => handleFilterStatus(3)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      <ProSidebarItem label="Əlavə məlumat">
        <ProSearch
          onSearch={value => handleFilterByType('description', value)}
          onChange={(e, value) => handleChange(e, value)}
          value={description}
        />
      </ProSidebarItem>
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  currencies: state.kassaReducer.currencies,
  contracts: state.contractsReducer.contracts,
  users: state.usersReducer.users,
});

export default connect(
  mapStateToProps,
  {fetchBusinessUnitList, fetchContacts, fetchCurrencies, fetchUsers}
)(ContractSideBar);
