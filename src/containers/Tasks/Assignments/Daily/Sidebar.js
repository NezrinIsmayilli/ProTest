/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {
  Sidebar,
  ProSidebarItem,
  ProTypeFilterButton,
  ProDateRangePicker,
} from 'components/Lib';
import { fetchTasks } from 'store/actions/tasks';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import moment from 'moment';

const DailySidebar = props => {
  const { fetchTasks, filters, onFilter } = props;

  const handleTypeFilter = type => {
    if (type === 1) {
      onFilter('filter[priority]', 1);
    } else if (type === 0) {
      onFilter('filter[priority]', 0);
    } else {
      onFilter('filter[priority]', undefined);
    }
  };
  const handleDatePicker = (startValue, endValue) => {
    const startDate = startValue
      ? moment(startValue).format('DD-MM-YYYY')
      : undefined;
    const endDate = endValue
      ? moment(endValue).format('DD-MM-YYYY')
      : undefined;
    onFilter('filter[startDate]', startDate);
    onFilter('filter[endDate]', endDate);
  };

  return (
    <Sidebar title="Tapşırıqlar jurnalı">
      <ProSidebarItem label="Tarix">
        <ProDateRangePicker onChangeDate={handleDatePicker} />
      </ProSidebarItem>
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
    </Sidebar>
  );
};

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {
    fetchTasks,
  }
)(DailySidebar);
