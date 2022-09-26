/* eslint-disable import/no-duplicates */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
// components
import { Spin } from 'antd';
import { Sidebar, Can, ProSelect, ProSidebarItem } from 'components/Lib';

// actions
import {
  createTimecardReportArchive,
  fetchTimecardReportArchive,
  fetchTimecardArchivesByDate,
  fetchArchiveEmployees,
  deleteTimecardReportArchive,
  setSelectedArchive,
} from 'store/actions/hrm/timecard';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { optionsMonth, optionsYear } from 'utils';

import { defaultArchiveData } from 'store/reducers/hrm/timecard';

import { setSelectedYear, setSelectedMonth } from 'store/actions/hrm/timecard';
import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

import SidebarListItem from '../../../#shared/SidebarListItem';
import AddInput from '../../../#shared/AddInput';

import styles from '../styles.module.scss';

function WorkTimeRecordSidebar(props) {
  const {
    timecardReportArchive,
    selectedArchive,
    selectedYear,
    selectedMonth,

    isCreateLoading,
    isFetchLoading,

    // actions
    createTimecardReportArchive,
    fetchTimecardReportArchive,
    fetchArchiveEmployees,
    deleteTimecardReportArchive,
    setSelectedArchive,
    fetchTimecardArchivesByDate,

    setSelectedYear,
    setSelectedMonth,

    profile,
    fetchBusinessUnitList,
    businessUnits,
    filter,
    setFilter,
  } = props;

  const { id: selectedArchiveId } = selectedArchive;

  const addInputRef = useRef(null);

  function onSucces(id) {
    addInputRef.current.clear();
    if (id === selectedArchiveId) {
      selectArchive(defaultArchiveData);
    }
    fetchTimecardReportArchive();
  }

  function handleDelete(id, stopLoading) {
    deleteTimecardReportArchive(
      id,
      () => {
        stopLoading();
        onSucces(id);
      },
      stopLoading
    );
  }

  // create new Timecard report arrchive data
  function addNewTemplate(name) {
    const data = {
      name,
      year: selectedYear,
      month: selectedMonth,
    };

    createTimecardReportArchive(data, onSucces);
  }

  function onSubmit(value) {
    const term = value && value.trim();

    if (term.length > 2 && !isCreateLoading) {
      addNewTemplate(term);
    }
  }

  function selectArchive(data) {
    setSelectedArchive({ attribute: data });

    if (data.id === 0) {
      fetchTimecardArchivesByDate(selectedYear, selectedMonth, filter);
    }
  }

  useEffect(() => {
    fetchTimecardReportArchive();
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);

  useEffect(() => {
    if (selectedArchiveId && selectedArchiveId !== 0) {
      fetchArchiveEmployees(selectedArchiveId);
    }
  }, [fetchArchiveEmployees, selectedArchiveId]);

  function setYear(value) {
    setSelectedYear({
      attribute: value,
    });
  }

  function setMonth(value) {
    setSelectedMonth({
      attribute: value,
    });
  }

  const timecardReportArchiveList = timecardReportArchive.map(itemData => {
    const { name, year, month, id } = itemData;

    return (
      <SidebarListItem
        data={itemData}
        onDelete={stopLoading => handleDelete(id, stopLoading)}
        onSelect={selectArchive}
        key={id}
        showDeleteButton={
          id !== 0 &&
          abilities.can(accessTypes.manage, permissions.timecard_report)
        }
        isSelected={selectedArchiveId === id}
        mainTitle={name}
        secondTitle={`${moment(month, 'M').format('MMMM')} ${year}`}
      />
    );
  });

  return (
    <Sidebar title="İş vaxtının uçotu">
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
      <div className={styles.customWrap}>
        <div>
          <div className={styles.customLabel}>İl</div>
          <ProSelect
            style={{ width: '120px' }}
            value={selectedYear}
            allowClear={false}
            data={optionsYear}
            onChange={setYear}
          />
        </div>
        <div>
          <div className={styles.customLabel}>Ay</div>
          <ProSelect
            style={{ width: '120px' }}
            value={selectedMonth}
            allowClear={false}
            data={optionsMonth}
            onChange={setMonth}
          />
        </div>
      </div>

      <Can I={accessTypes.manage} a={permissions.timecard_report}>
        <AddInput
          label="Yeni cədvəl əlavə et"
          placeholder="Cədvəlin adı"
          onSubmit={onSubmit}
          isCreateLoading={isCreateLoading}
          ref={addInputRef}
        />
      </Can>

      {/*  list  */}
      <ul className={styles.archiveList}>
        <Spin spinning={isFetchLoading}>{timecardReportArchiveList}</Spin>
      </ul>
    </Sidebar>
  );
}

const mapStateToProps = state => ({
  timecardReportArchive: state.hrmTimecardReducer.timecardReportArchive,
  selectedArchive: state.hrmTimecardReducer.selectedArchive,

  selectedYear: state.hrmTimecardReducer.selectedYear,
  selectedMonth: state.hrmTimecardReducer.selectedMonth,

  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,

  isCreateLoading: !!state.loadings.createTimecardReportArchive,
  isFetchLoading: !!state.loadings.fetchTimecardReportArchive,
});

export default connect(
  mapStateToProps,
  {
    createTimecardReportArchive,
    fetchTimecardReportArchive,
    fetchArchiveEmployees,
    fetchTimecardArchivesByDate,
    deleteTimecardReportArchive,
    setSelectedArchive,
    fetchBusinessUnitList,

    setSelectedYear,
    setSelectedMonth,
  }
)(WorkTimeRecordSidebar);
