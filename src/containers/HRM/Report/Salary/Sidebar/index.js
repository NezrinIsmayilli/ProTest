/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Sidebar,
  ProSearch,
  ProSidebarItem,
  ProDateRangePicker,
  ProInput,
  ProSelect,
} from 'components/Lib';
import moment from 'moment';
import { optionsYear, optionsMonth } from 'utils';
import { Row, Col, Button } from 'antd';
import { resetFilters, fetchFilteredReports } from 'store/actions/hrm/report';

import { fetchStructures } from 'store/actions/structure';
import { fetchPositions } from 'store/actions/settings/vezifeler';
import styles from '../styles.module.scss';

const employmentTypes = [
  {
    name: 'Tam ştat',
    id: 1,
  },
  {
    name: 'Yarım ştat',
    id: 2,
  },

  {
    name: 'Ştatdan kənar',
    id: 3,
  },
];

function SalarySidebar(props) {
  const {
    resetFilters,
    onFilter,
    structureList,
    positionList,
    fetchStructures,
    structuresCount,
    fetchPositions,
    positionsCount,
    setselectedYearandMonth,
    selectedYearandMonth,
    businessUnits,
    filters,
    profile,
  } = props;

  useEffect(() => {
    Promise.all([positionsCount === 0 && fetchPositions()]);
  }, []);
  useEffect(() => {
    if (filters?.businessUnitIds) {
      fetchStructures({ businessUnitIds: filters?.businessUnitIds });
    } else {
      fetchStructures();
    }
  }, [filters.businessUnitIds]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  useEffect(() => () => resetFilters(), []);
  const handleDatePicker = (startValue, endValue) => {
    const startDate = startValue
      ? moment(startValue).format('DD-MM-YYYY')
      : undefined;
    const endDate = endValue
      ? moment(endValue).format('DD-MM-YYYY')
      : undefined;
    onFilter('hireMinDate', startDate);
    onFilter('hireMaxDate', endDate);
  };
  const handleSalaryChange = (type, value) => {
    if (type === 'from') setFrom(value);
    if (type === 'to') setTo(value);
    if (type === 'submit') {
      onFilter('salaryMin', from);
      onFilter('salaryMax', to);
    }
  };
  const handleFilter = (type, value) => {
    setselectedYearandMonth(prevFilters => ({
      ...prevFilters,
      [type]: value,
    }));
  };
  return (
    <Sidebar title="Əməkhaqqı">
      {businessUnits?.length === 1 &&
      profile.businessUnits.length === 0 ? null : (
        <ProSidebarItem label="Biznes blok">
          <ProSelect
            mode="multiple"
            onChange={values => onFilter('businessUnitIds', values)}
            value={
              businessUnits?.length === 1
                ? businessUnits[0]?.id === null
                  ? businessUnits[0]?.name
                  : businessUnits[0]?.id
                : filters.businessUnitIds
            }
            disabled={businessUnits?.length === 1}
            data={businessUnits?.map(item =>
              item.id === null ? { ...item, id: 0 } : item
            )}
            disabledBusinessUnit={businessUnits?.length === 1}
          />
        </ProSidebarItem>
      )}
      <div className={styles.customWrap}>
        <div>
          <div className={styles.customLabel}>İl</div>
          <ProSelect
            style={{ width: '120px' }}
            value={selectedYearandMonth?.selectedYear}
            allowClear={false}
            data={optionsYear}
            onChange={value => {
              handleFilter('selectedYear', value);
            }}
          />
        </div>
        <div>
          <div className={styles.customLabel}>Ay</div>
          <ProSelect
            style={{ width: '120px' }}
            value={selectedYearandMonth?.selectedMonth}
            allowClear={false}
            data={optionsMonth}
            onChange={value => {
              handleFilter('selectedMonth', value);
            }}
          />
        </div>
      </div>
      <ProSidebarItem label="Əməkdaş">
        <ProSearch onChange={e => {
                        if (e.target.value === '') {
                          onFilter('name', undefined);
                        }
                    }} onSearch={value => onFilter('name', value)} />
      </ProSidebarItem>
      <ProSidebarItem label="Bölmə">
        <ProSelect
          name="structures"
          mode="multiple"
          data={structureList}
          allowClear
          onChange={value => onFilter('structures', value)}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Vəzifə">
        <ProSelect
          mode="multiple"
          allowClear
          data={positionList}
          onChange={value => onFilter('occupations', value)}
        />
      </ProSidebarItem>
      <ProSidebarItem label="İşə başlama tarixi">
        <ProDateRangePicker onChangeDate={handleDatePicker} />
      </ProSidebarItem>
      <ProSidebarItem label="Ştat növü">
        <ProSelect
          mode="multiple"
          name="employmentTypes"
          data={employmentTypes}
          allowClear
          onChange={value => onFilter('employmentTypes', value)}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Məbləğ">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <ProInput
              onChange={event => handleSalaryChange('from', event.target.value)}
              placeholder="Dən"
            />{' '}
          </Col>
          <Col span={12}>
            <ProInput
              onChange={event => handleSalaryChange('to', event.target.value)}
              placeholder="Dək"
            />
          </Col>
          <Col span={24}>
            <Button
              // onClick={() => reportsSalaryFilter({ from, to })}
              onClick={() => handleSalaryChange('submit')}
              style={{ marginTop: 16, width: '100%', fontSize: '14px' }}
              type="primary"
            >
              Axtar
            </Button>
          </Col>
        </Row>
      </ProSidebarItem>
    </Sidebar>
  );
}
const mapStateToProps = state => ({
  structuresCount: state.structureReducer.structureList.length,
  structureList: state.structureReducer.structures,
  positionsCount: state.vezifelerReducer.data.length,
  positionList: state.vezifelerReducer.data,
});
export default connect(
  mapStateToProps,
  {
    fetchFilteredReports,
    resetFilters,
    fetchStructures,
    fetchPositions,
  }
)(SalarySidebar);
