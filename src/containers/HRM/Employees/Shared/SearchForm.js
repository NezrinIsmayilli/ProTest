/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import moment from 'moment';
import { Checkbox, Row, Col } from 'antd';

import {
  Sidebar,
  ProSearch,
  ProSelect,
  ProInput,
  ProDateRangePicker,
  ProSidebarItem,
  ProTypeFilterButton,
} from 'components/Lib';
// actions
import {
  workersSearchHandle,
  dismissedWorkesSearch,
} from 'store/actions/hrm/workers';
import { fetchStructures } from 'store/actions/structure';
import { fetchPositions } from 'store/actions/settings/vezifeler';

import styles from './styles.module.scss';

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

function WorkerSearchForm(props) {
  const {
    filters,
    onFilter,
    fetchStructures,
    structureList,
    structuresCount,
    fetchPositions,
    positionList,
    positionsCount,
    workersSearchHandle,
    dismissedWorkesSearch,
    workers,
    businessUnits,
    profile,
  } = props;

  useEffect(() => {
    Promise.all([positionsCount === 0 && fetchPositions()]);
    if (workers) {
      workersSearchHandle('');
    } else {
      dismissedWorkesSearch('');
    }
  }, []);
  useEffect(() => {
    if (filters?.businessUnitIds) {
      fetchStructures({ businessUnitIds: filters?.businessUnitIds });
    } else {
      fetchStructures();
    }
  }, [filters.businessUnitIds]);
  function handleGenderCheckbox(event) {
    const { name } = event.target;
    const gender = name === filters.gender ? undefined : name;
    onFilter('gender', gender);
  }
  const handleAgeChange = (type, value) => {
    const re = /^[0-9]{1,2}$/;
    if (re.test(value) && Number(value) <= 100) onFilter(type, value);
    if (value === '') onFilter(type, null);
  };

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

  return (
    <Sidebar title="Əməkdaşlar">
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
      {workers ? (
        <ProSidebarItem label="Əməkdaş">
          <ProSearch onChange={e => {
                        if (e.target.value === '') {
                          workersSearchHandle('');
                        }
                    }} onSearch={workersSearchHandle} />
        </ProSidebarItem>
      ) : (
        <ProSidebarItem label="Əməkdaş">
          <ProSearch  onChange={e => {
                        if (e.target.value === '') {
                          dismissedWorkesSearch('');
                        }
                    }} onSearch={dismissedWorkesSearch} />
        </ProSidebarItem>
      )}
      <ProSidebarItem label="Bölmə">
        <ProSelect
          name="structureId"
          data={structureList}
          allowClear
          onChange={value => onFilter('structureId', value)}
        />
      </ProSidebarItem>
      {workers ? null : (
        <ProSidebarItem label="Qara siyahıda olanlar">
          <Row gutter={2} style={{ marginTop: '8px' }}>
            <Col span={8}>
              <ProTypeFilterButton
                label="Hamısı"
                isActive={filters.isInBlackList === undefined}
                onClick={() => onFilter('isInBlackList', null)}
              />
            </Col>
            <Col span={8}>
              <ProTypeFilterButton
                label="Hə"
                isActive={filters.isInBlackList === 1}
                onClick={() => onFilter('isInBlackList', 1)}
              />
            </Col>
            <Col span={8}>
              <ProTypeFilterButton
                label="Yox"
                isActive={filters.isInBlackList === 0}
                onClick={() => onFilter('isInBlackList', 0)}
              />
            </Col>
          </Row>
        </ProSidebarItem>
      )}
      <ProSidebarItem label="Cinsi">
        <div className={styles.flexCenter}>
          <Checkbox
            className={styles.noMargin}
            checked={filters.gender === '1'}
            onChange={handleGenderCheckbox}
            name="1"
          >
            Kişi
          </Checkbox>
          <Checkbox
            className={styles.noMargin}
            checked={filters.gender === '2'}
            onChange={handleGenderCheckbox}
            name="2"
          >
            Qadın
          </Checkbox>
        </div>
      </ProSidebarItem>
      <ProSidebarItem label="Vəzifə">
        <ProSelect
          data={positionList}
          onChange={value => onFilter('occupationId', value)}
        />
      </ProSidebarItem>

      <ProSidebarItem label="İşə başlama tarixi">
        <ProDateRangePicker onChangeDate={handleDatePicker} />
      </ProSidebarItem>
      <ProSidebarItem label="Ştat növü">
        <ProSelect
          name="employmentType"
          data={employmentTypes}
          allowClear
          onChange={value => onFilter('employmentType', value)}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Yaş">
        <div className={styles.flexRow}>
          <ProInput
            value={filters.minAge}
            onChange={event => handleAgeChange('minAge', event.target.value)}
            placeholder="Dan"
          />
          <ProInput
            value={filters.maxAge}
            onChange={event => handleAgeChange('maxAge', event.target.value)}
            placeholder="Dək"
          />
        </div>
      </ProSidebarItem>
    </Sidebar>
  );
}

const getStructuresCount = createSelector(
  state => state.structureReducer.structureList,
  structuresCount => structuresCount.length
);

const getPositionsCount = createSelector(
  state => state.vezifelerReducer.data,
  positionsCount => positionsCount.length
);

const mapStateToProps = state => ({
  structuresCount: getStructuresCount(state),
  structureList: state.structureReducer.structures,
  positionsCount: getPositionsCount(state),
  positionList: state.vezifelerReducer.data,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  {
    fetchStructures,
    fetchPositions,
    workersSearchHandle,
    dismissedWorkesSearch,
  }
)(WorkerSearchForm);
