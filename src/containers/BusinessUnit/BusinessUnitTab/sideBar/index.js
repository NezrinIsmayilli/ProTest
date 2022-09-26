/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
  Sidebar,
  ProSelect,
  ProAsyncSelect,
  ProTypeFilterButton,
  ProSidebarItem,
} from 'components/Lib';
import { Spin, Row, Col } from 'antd';
import { connect } from 'react-redux';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchFilteredStocks } from 'store/actions/stock';
import { fetchUsers } from 'store/actions/users';
import { fetchFilteredStructures } from 'store/actions/structure';
import { fetchFilteredCashboxes } from 'store/actions/settings/kassa';
import { fetchFilteredProductPriceTypes } from 'store/actions/settings/mehsul';

const BusinessUnitSideBar = props => {
  const {
    filters,
    onFilter,
    fetchSalesInvoiceSearch,
    profile,
    fetchBusinessUnitList,
    fetchFilteredStocks,
    filterSelectedStocks,
    fetchUsers,
    filterSelectedTenantPersons,
    filterSelectedStructures,
    fetchFilteredStructures,
    fetchFilteredCashboxes,
    filterSelectedCashBoxes,
    fetchFilteredProductPriceTypes,
    filterSelectedProductPriceTypes
  } = props;

  const [searchResult, setSearchResult] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('act');
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [structures, setStructures] = useState([]);
  const [cashboxes, setCashBoxes] = useState([]);
  const [priceTypes, setPriceTypes] = useState([]);

  const timeoutRef = useRef(null);

  function validate() {
    fetchSalesInvoiceSearch({
      filters: {
        invoiceNumber: search,
        invoiceTypes: [11],
      },
      onSuccess: onSearchResult,
    });
  }

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
    if (selectedStatus === type) setSelectedStatus('act');
    else setSelectedStatus(type);
    if (filters.isDeleted === e) onFilter('isDeleted', 0);
    else onFilter('isDeleted', e);
  };

  const onSearchResult = data => {
    setSearchResult(data.data);
    setIsLoadingSearch(false);
  };

  const [businessUnits, setBusinessUnits] = useState([]);
  const [businessUnitLength, setBusinessUnitLength] = useState(2);
  
  const [
    filterSelectedBusinessUnit,
    setFilterSelectedBusinessUnit,
] = useState([]);

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
  }
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
const ajaxStocksSelectRequest = (
  page = 1,
  limit = 20,
  search = '',
  stateReset = 0,
  onSuccessCallback
) => {
  const defaultFilters = {
      limit,
      page,
      name: search,
      businessUnitIds: filters?.businessUnitIds
          ? filters?.businessUnitIds
          : undefined,
  };
  fetchFilteredStocks({
      filters: defaultFilters,
      onSuccessCallback: ({ data }) => {
          const appendList = [];

          if (data) {
              data.forEach(element => {
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
              setStocks(appendList);
          } else {
              setStocks(stocks.concat(appendList));
          }
      },
  });
};
const ajaxCashBoxesSelectRequest = (
  page = 1,
  limit = 20,
  search = '',
  stateReset = 0,
  onSuccessCallback
) => {
  const defaultFilters = {
      limit,
      page,
      q: search,
      businessUnitIds: filters?.businessUnitIds
          ? filters?.businessUnitIds
          : undefined,
  };
  fetchFilteredCashboxes({
      filters: defaultFilters,
      onSuccessCallback: ({ data }) => {
          const appendList = [];

          if (data) {
              data.forEach(element => {
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
              setCashBoxes(appendList);
          } else {
              setCashBoxes(cashboxes.concat(appendList));
          }
      },
  });
};
const ajaxPriceTypesSelectRequest = (
  page = 1,
  limit = 20,
  search = '',
  stateReset = 0,
  onSuccessCallback
) => {
  const defaultFilters = {
      limit,
      page,
      q: search,
      businessUnitIds: filters?.businessUnitIds
          ? filters?.businessUnitIds
          : undefined,
  };
  fetchFilteredProductPriceTypes({
      filters: defaultFilters,
      onSuccessCallback: ({ data }) => {
          const appendList = [];

          if (data) {
              data.forEach(element => {
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
              setPriceTypes(appendList);
          } else {
              setPriceTypes(priceTypes.concat(appendList));
          }
      },
  });
};
const ajaxStructureSelectRequest = (
  page = 1,
  limit = 20,
  search = '',
  stateReset = 0,
  onSuccessCallback
) => {
  const defaultFilters = {
      limit,
      page,
      name: search,
      businessUnitIds: filters?.businessUnitIds
          ? filters?.businessUnitIds
          : undefined,
  };
  fetchFilteredStructures({
      filters: defaultFilters,
      onSuccessCallback: ({ data }) => {
          const appendList = [];

          if (data) {
              data.forEach(element => {
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
              setStructures(appendList);
          } else {
              setStructures(structures.concat(appendList));
          }
      },
  });
};

const ajaxUsersSelectRequest = (
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
              setUsers(appendList);
          } else {
              setUsers(users.concat(appendList));
          }
      },
  });
};

  return (
    <Sidebar title="Biznes blok">
      <ProSidebarItem label="Status">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={8}>
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
          <Col span={8}>
            <ProTypeFilterButton
              label="Hamısı"
              isActive={selectedStatus === 'all'}
              onClick={() => toggleButton(undefined, 'all')}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      {businessUnitLength === 1 &&
      profile.businessUnits.length === 0 ? null : (
      <ProSidebarItem label="Blokun adı">
        <ProAsyncSelect
          mode="multiple"
          selectRequest={ajaxBusinessUnitSelectRequest}
          valueOnChange={values => onFilter('businessUnitIds', values)}
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
      <ProSidebarItem label="Blokun növü">
        <ProSelect
          mode="multiple"
          onChange={values => onFilter('contacts', values)}
          data={[{ id: 0, name: 'Bölmə' }]}
        />
      </ProSidebarItem>
      <ProSidebarItem label="İstifadəçi">
        <ProAsyncSelect
          mode="multiple"
          keys={['name', 'lastName']}
          selectRequest={ajaxUsersSelectRequest}
          valueOnChange={values => onFilter('tenantPersons', values)}
          data={
            filterSelectedTenantPersons.length > 0
                ? [
                      ...filterSelectedTenantPersons,
                      ...users.filter(
                          item =>
                              !filterSelectedTenantPersons
                                  .map(({ id }) => id)
                                  ?.includes(item.id)
                      ),
                  ]
                : users
        }
        value={
            filters.tenantPersons
                ? filters.tenantPersons.map(Number)
                : undefined
        }
        />
      </ProSidebarItem>
      <ProSidebarItem label="Bölmə">
      <ProAsyncSelect
          mode="multiple"
          selectRequest={ajaxStructureSelectRequest}
          valueOnChange={values => onFilter('structures', values)}
          data={
            filterSelectedStructures.length > 0
                ? [
                      ...filterSelectedStructures,
                      ...structures.filter(
                          item =>
                              !filterSelectedStructures
                                  .map(({ id }) => id)
                                  ?.includes(item.id)
                      ),
                  ]
                : structures
        }
        value={
            filters.structures ? filters.structures.map(Number) : undefined
        }
        />
      </ProSidebarItem>
      <ProSidebarItem label="Anbar">
        <ProAsyncSelect
          mode="multiple"
          selectRequest={ajaxStocksSelectRequest}
          valueOnChange={values => onFilter('stocks', values)}
          data={
            filterSelectedStocks.length > 0
                ? [
                      ...filterSelectedStocks,
                      ...stocks.filter(
                          item =>
                              !filterSelectedStocks
                                  .map(({ id }) => id)
                                  ?.includes(item.id)
                      ),
                  ]
                : stocks
        }
        value={
            filters.stocks ? filters.stocks.map(Number) : undefined
        }
        />
      </ProSidebarItem>
      <ProSidebarItem label="Hesab">
        <ProAsyncSelect
          mode="multiple"
          selectRequest={ajaxCashBoxesSelectRequest}
          valueOnChange={values => onFilter('cashboxes', values)}
          data={
            filterSelectedCashBoxes.length > 0
                ? [
                      ...filterSelectedCashBoxes,
                      ...cashboxes.filter(
                          item =>
                              !filterSelectedCashBoxes
                                  .map(({ id }) => id)
                                  ?.includes(item.id)
                      ),
                  ]
                : cashboxes
        }
        value={
            filters.cashboxes ? filters.cashboxes.map(Number) : undefined
        }
        />
      </ProSidebarItem>
      <ProSidebarItem label="Qiymət tipi">
        <ProAsyncSelect
          mode="multiple"
          selectRequest={ajaxPriceTypesSelectRequest}
          valueOnChange={values => onFilter('priceTypes', values)}
          data={
            filterSelectedProductPriceTypes.length > 0
                ? [
                      ...filterSelectedProductPriceTypes,
                      ...priceTypes.filter(
                          item =>
                              !filterSelectedProductPriceTypes
                                  .map(({ id }) => id)
                                  ?.includes(item.id)
                      ),
                  ]
                : priceTypes
        }
        value={
            filters.priceTypes ? filters.priceTypes.map(Number) : undefined
        }
        />
      </ProSidebarItem>
    </Sidebar>
  );
};

const mapStateToProps = state => ({

});

export default connect(mapStateToProps,  {
  fetchBusinessUnitList,
  fetchFilteredStocks,
  fetchUsers,
  fetchFilteredStructures,
  fetchFilteredCashboxes,
  fetchFilteredProductPriceTypes
})(BusinessUnitSideBar);
