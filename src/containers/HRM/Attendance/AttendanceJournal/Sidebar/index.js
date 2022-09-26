/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// components
import {
  Sidebar,
  ProSearch,
  ProCalendar,
  ProSelect,
  ProSidebarItem,
} from 'components/Lib';

// utils
import { attendanceJournalStatusData, formatDate } from 'utils';

// actions
import {
  fetchTimeCard,
  setFilters,
  setDate,
  setIntialState,
} from 'store/actions/hrm/attendance';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';

import styles from './sidebar.module.scss';

function SidebarAttendanceJournal(props) {
  const {
    searchQuery,
    filterStatus,
    date,
    // actions
    setDate,
    fetchTimeCard,
    setFilters,
    setIntialState,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;

  const [filter, setFilter] = useState({ businessUnitIds: [] });

  // date = "09-12-2019"
  useEffect(() => {
    fetchTimeCard(filter, date, 'fetchTimeCard');
  }, [date, fetchTimeCard, filter]);

  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);

  function onDateChange(value) {
    const newValue = formatDate(value);
    if (date !== newValue) {
      setDate({
        date: newValue,
      });
    }
  }

  function onSearch(searched) {
    setFilters({
      searchQuery: searched,
      filterStatus,
    });
  }

  function onStatusChange(status) {
    setFilters({
      searchQuery,
      filterStatus: status,
    });
  }

  useEffect(
    () => () => {
      setIntialState();
    },
    []
  );

  return (
    <Sidebar title="Davamiyyət jurnalı">
      {businessUnits?.length === 1 &&
      profile.businessUnits.length === 0 ? null : (
        <ProSidebarItem label="Biznes blok">
          <ProSelect
            mode="multiple"
            onChange={values => setFilter({ businessUnitIds: values })}
            value={
              businessUnits?.length === 1
                ? businessUnits[0]?.id === null
                  ? businessUnits[0]?.name
                  : businessUnits[0]?.id
                : filter.businessUnitIds
            }
            disabled={businessUnits?.length === 1}
            data={businessUnits?.map(item =>
              item.id === null ? { ...item, id: 0 } : item
            )}
            disabledBusinessUnit={businessUnits?.length === 1}
          />
        </ProSidebarItem>
      )}
      <ProSidebarItem label="Əməkdaş">
        <ProSearch onChange={e => {
                        if (e.target.value === '') {
                          setFilters({
                            searchQuery: '',
                            filterStatus,
                          });
                        }
                    }} onSearch={onSearch} autoFocus />
      </ProSidebarItem>
      <ProSidebarItem>
        <div className={styles.sidebarItemWrap}>
          <ProCalendar
            onChange={onDateChange}
            disabledDate={current => current && current > moment()}
          />
        </div>
      </ProSidebarItem>
      <ProSidebarItem label="Status">
        <ProSelect
          data={[
            ...attendanceJournalStatusData,
            { id: 1, name: 'Gəlib' },
            { id: 2, name: 'Gəlməyib' },
          ]}
          onChange={onStatusChange}
          allowClear
        />
      </ProSidebarItem>
    </Sidebar>
  );
}

const mapStateToProps = state => ({
  searchQuery: state.attendanceReducer.searchQuery,
  filterStatus: state.attendanceReducer.filterStatus,
  date: state.attendanceReducer.date,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  { fetchTimeCard, setFilters, setDate, setIntialState, fetchBusinessUnitList }
)(SidebarAttendanceJournal);
