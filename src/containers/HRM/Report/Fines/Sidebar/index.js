/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Checkbox } from 'antd';
import { Sidebar, JobsSidebarItemWrapper, ProSelect } from 'components/Lib';
import { optionsMonth, optionsYear } from 'utils';

// actions
import { fetchPositions } from 'store/actions/settings/vezifeler';
import { fetchStructures } from 'store/actions/structure';
import { fetchHrmPenalties } from 'store/actions/hrm/fines';

import styles from '../styles.module.scss';

function FinesSidebar(props) {
  const {
    // data
    positions,
    positionsLoading,
    structures,
    structuresLoading,
    // actions
    fetchPositions,
    fetchStructures,

    setYearAndMonth,
    fetchHrmPenalties,
    yearAndMonth,

    filters,
    onFilter,
    businessUnits,
    profile,
  } = props;

  useEffect(() => {
    if (positions.length === 0) {
      fetchPositions();
    }
  }, []);
  useEffect(() => {
    if (filters?.businessUnitIds) {
      fetchStructures({ businessUnitIds: filters?.businessUnitIds });
    } else {
      fetchStructures();
    }
  }, [filters.businessUnitIds]);

  function setYear(value) {
    setYearAndMonth({ ...yearAndMonth, year: value });
  }
  function setMonth(value) {
    setYearAndMonth({ ...yearAndMonth, month: value });
  }
  useEffect(() => {
    fetchHrmPenalties({
      year: yearAndMonth.year,
      month: yearAndMonth.month,
      filters,
    });
  }, [yearAndMonth]);

  return (
    <Sidebar title="Cərimələr">
      {/* <ProSearch placeholder="" /> */}
      {businessUnits?.length === 1 &&
      profile.businessUnits.length === 0 ? null : (
        <JobsSidebarItemWrapper label="Biznes blok">
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
        </JobsSidebarItemWrapper>
      )}
      <div className={styles.customWrap}>
        <div>
          <div className={styles.customLabel}>İl</div>
          <ProSelect
            style={{ width: '120px' }}
            value={yearAndMonth.year}
            allowClear={false}
            data={optionsYear}
            onChange={setYear}
          />
        </div>
        <div>
          <div className={styles.customLabel}>Ay</div>
          <ProSelect
            style={{ width: '120px' }}
            value={yearAndMonth.month}
            allowClear={false}
            data={optionsMonth}
            onChange={setMonth}
          />
        </div>
      </div>
      <JobsSidebarItemWrapper label="Bölmə">
        <ProSelect
          // value={filterValue}
          onChange={value => onFilter('structure', value)}
          allowClear
          loading={structuresLoading}
          disabled={structuresLoading}
          data={structures}
        />
      </JobsSidebarItemWrapper>

      <JobsSidebarItemWrapper label="Vəzifə">
        <ProSelect
          // value={filterValue}
          onChange={value => onFilter('occupation', value)}
          allowClear
          loading={positionsLoading}
          disabled={positionsLoading}
          data={positions}
        />
      </JobsSidebarItemWrapper>

      <JobsSidebarItemWrapper label="Bölmə rəhbəri">
        <Checkbox
          checked={filters.isChief === '1'}
          className={styles.sidebarCheckbox}
          onChange={({ target: { checked } }) =>
            onFilter('isChief', checked ? '1' : undefined)
          }
        >
          Bölmə rəhbəri
        </Checkbox>
        <Checkbox
          checked={filters.isChief === '0'}
          className={styles.sidebarCheckbox}
          onChange={({ target: { checked } }) =>
            onFilter('isChief', checked ? '0' : undefined)
          }
        >
          Digər
        </Checkbox>
      </JobsSidebarItemWrapper>
    </Sidebar>
  );
}

const mapStateToProps = state => ({
  positions: state.vezifelerReducer.data,
  positionsLoading: state.vezifelerReducer.isLoading,
  structures: state.structureReducer.structures,
  structuresLoading: state.structureReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    fetchPositions,
    fetchStructures,
    fetchHrmPenalties,
  }
)(FinesSidebar);
