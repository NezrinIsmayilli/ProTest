/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
  Sidebar,
  ProSelect,
  ProSidebarItem,
  ProTypeFilterButton,
  ProDateRangePicker,
} from 'components/Lib';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';

const ProjectSidebar = props => {
  const { type } = props;

  return (
    <Sidebar title="Tapşırıqlar jurnalı">
      {/* <ProSidebarItem label="Status">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={8}>
            <ProTypeFilterButton
              label="Aktiv"
              isActive={statusGroupFilter === 1}
              onClick={() => handleStageGroupFilter(1)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Bitib"
              isActive={statusGroupFilter === 2}
              onClick={() => handleStageGroupFilter(2)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Silinib"
              isActive={statusGroupFilter === 3}
              onClick={() => handleStageGroupFilter(3)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
     
      <ProSidebarItem label="Bitmə tarixi">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={8}>
            <ProTypeFilterButton
              label="Hamısı"
              isActive={endDateGroupFilter === 1}
              onClick={() => handleEndDateGroupFilter(1)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Müddətli"
              isActive={endDateGroupFilter === 2}
              onClick={() => handleEndDateGroupFilter(2)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Müddətsiz"
              isActive={endDateGroupFilter === 3}
              onClick={() => handleEndDateGroupFilter(3)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      <ProSidebarItem label="Anbar">
        <ProSelect
          mode="multiple"
          onChange={warehouses => handleDefaultFilters('stocks', warehouses)}
          showArrow
          data={stocks}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Qarşı tərəf">
        <ProSelect
          mode="multiple"
          data={clients}
          onChange={contacts => handleDefaultFilters('contacts', contacts)}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Sənəd">
        <ProSelect
          mode="multiple"
          value={filters.invoices}
          keys={['invoiceNumber']}
          data={searchResult}
          notFoundContent={isLoadingSearch ? <Spin size="small" /> : null}
          onSearch={e => setSearch(e)}
          onChange={values => handleDefaultFilters('invoices', values)}
          showSearch
        />
      </ProSidebarItem>
      <ProSidebarItem label="Müqavilə">
        <ProSelect
          mode="multiple"
          keys={['contract_no']}
          onChange={values => handleDefaultFilters('contracts', values)}
          data={contracts}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Sifariş">
        <ProSelect
          mode="multiple"
          onChange={values => handleDefaultFilters('orders', values)}
          data={[
            ...orders.map(order => ({
              ...order,
              name:
                order.direction === 1
                  ? `SFD${String(new Date().getFullYear())}/${
                      order.serialNumber
                    }`
                  : `SFX${String(new Date().getFullYear())}/${
                      order.serialNumber
                    }`,
            })),
          ]}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Satış meneceri">
        <ProSelect
          mode="multiple"
          keys={['name', 'lastName']}
          data={salesmen}
          onChange={values => handleDefaultFilters('salesManagers', values)}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Məhsul adı">
        <ProSelect
          mode="multiple"
          onChange={products => handleDefaultFilters('products', products)}
          showArrow
          data={products}
        />
      </ProSidebarItem> */}
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  salesmen: state.usersReducer.users,
  catalogs: state.catalogsReducer.catalogs,
  contracts: state.contractsReducer.contracts,
  clients: state.contactsReducer.clients,
  orders: state.ordersReducer.orders,
  stocks: state.stockReducer.stocks,
  products: state.productReducer.products,
  stocksLoading: state.stockReducer.isLoading,
  productsLoading: state.loadings.products,
});

export default connect(
  mapStateToProps,
  {}
)(ProjectSidebar);
