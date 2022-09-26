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
import { useFilterHandle } from 'hooks';
import { TrophyOutlined } from '@ant-design/icons';

const Delayed = props => {
  const { fetchTasks, type } = props;

  const [filters, onFilter] = useFilterHandle(
    {
      'filter[startDate]': undefined,
      'filter[endDate]': undefined,
      'filter[priority]': undefined,
      'filter[myTask]': undefined,
    },
    ({ filters }) => {
      fetchTasks({
        type: 'delayed',
        filters,
      });
    }
  );

  const handleTypeFilter = type => {
    if (type === 1) {
      onFilter('filter[priority]', 1);
    } else if (type === 0) {
      onFilter('filter[priority]', 0);
    } else {
      onFilter('filter[priority]', undefined);
    }
  };
  const handleOwnerFilter = type => {
    if (type === true) {
      onFilter('filter[myTask]', true);
    } else if (type === false) {
      onFilter('filter[myTask]', false);
    } else {
      onFilter('filter[myTask]', undefined);
    }
  };

  return (
    <Sidebar title="Tapşırıqlar jurnalı">
      <ProSidebarItem label="Tapşırıqlar növü">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={8}>
            <ProTypeFilterButton
              label="Hamısı"
              isActive={filters['filter[priority]'] === undefined}
              onClick={() => handleTypeFilter(undefined)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Təcili"
              isActive={filters['filter[priority]'] === 1}
              onClick={() => handleTypeFilter(1)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Digər"
              isActive={filters['filter[priority]'] === 0}
              onClick={() => handleTypeFilter(0)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      <ProSidebarItem label="Qruplaşdır">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={8}>
            <ProTypeFilterButton
              label="Hamısı"
              isActive={filters['filter[myTask]'] === undefined}
              onClick={() => handleOwnerFilter(undefined)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Mən"
              isActive={filters['filter[myTask]'] === true}
              onClick={() => handleOwnerFilter(true)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Digər"
              isActive={filters['filter[myTask]'] === false}
              onClick={() => handleOwnerFilter(false)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
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
)(Delayed);
