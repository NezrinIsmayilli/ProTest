import React, { useEffect, useState } from 'react';
import {
  Sidebar,
  ProDateRangePicker,
  ProSidebarItem,
  ProTypeFilterButton,
} from 'components/Lib';
import { Row, Col, Select } from 'antd';
import { types } from '../types';
import styles from '../../styles.module.scss';

const SalesReportSidebar = props => {
  const { filters, onFilter,handlePaginationChange,thisMonthEnd,thisMonthStart } = props;

  const [directionFilter, setDirectionFilter] = useState(filters.direction?Number(filters.direction):1);
  const [StartDate, setStartDate] = useState(filters.dateFrom!=thisMonthStart? filters.dateFrom:null);
  const [EndDate, setEndDate] = useState(filters.dateTo!=thisMonthEnd? filters.dateTo:null);
  const handleDirectionFilter = id => {
    handlePaginationChange(1);
    onFilter('direction', id);
    setDirectionFilter(id);
  };

  const handleTypeFilter = type => {
    handlePaginationChange(1);
    onFilter('type', types[type].name);
  };

  const handleDatePicker = (startDate, endDate) => {
    handlePaginationChange(1);
    setStartDate(startDate);
    onFilter(
      'dateFrom',
      startDate ? startDate.format('DD-MM-YYYY') : undefined
    );
    setEndDate(endDate);
    onFilter('dateTo', endDate ? endDate.format('DD-MM-YYYY') : undefined);
  };

  useEffect(()=>{
    handlePaginationChange(filters.page? filters.page:1);
  },[])
  return (
    <Sidebar title="Hesabatlar">
      <div className={styles.Sidebar}>
        <ProSidebarItem label="İstiqamət">
          <Row gutter={2} style={{ marginTop: '8px' }}>
            <Col span={12}>
              <ProTypeFilterButton
                label="Daxil olan"
                isActive={directionFilter === 1}
                onClick={() => handleDirectionFilter(1)}
              />
            </Col>
            <Col span={12}>
              <ProTypeFilterButton
                label="Xaric olan"
                isActive={directionFilter === 2}
                onClick={() => handleDirectionFilter(2)}
              />
            </Col>
          </Row>
        </ProSidebarItem>

        <div className={styles.sidebarItem}>
          <span className={styles.sectionName}>Tarix</span>
          <ProDateRangePicker
            size="large"
            buttonSize="default"
            buttonStyle={{ width: '31.5%' }}
            rangeButtonsStyle={{ margin: '10px 0 0 0' }}
            className={styles.datePicker}
            onChangeDate={handleDatePicker}
            style={{ marginTop: '8px' }}
            placeholder="Seçin"
            defaultStartValue={filters.dateFrom ? filters.dateFrom:undefined}
            defaultEndValue={filters.dateTo ? filters.dateTo:undefined}
            notRequired={StartDate||EndDate? true:false}
          />
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.sectionName}>Qruplaşdır:</span>
          <Select
            placeholder="Seçin"
            size="large"
            defaultValue={filters.type}
            className={styles.select}
            onChange={handleTypeFilter}
            showArrow
          >
            {Object.values(types).map(type => (
              <Select.Option
                value={type.name}
                key={type.id}
                className={styles.dropdown}
              >
                {type.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    </Sidebar>
  );
};

export default SalesReportSidebar;
