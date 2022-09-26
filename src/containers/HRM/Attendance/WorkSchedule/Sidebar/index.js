/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

// config
import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

// actions
import {
  fetchWorkSchedules,
  createWorkSchedule,
  deleteWorkSchedule,
  setSelectedSchedule,
} from 'store/actions/hrm/attendance/workSchedules';
import { fetchWorkScheduleDays } from 'store/actions/hrm/attendance/workScheduleDays';

// components
import { Spin } from 'antd';
import { Sidebar as LayoutSidebar, Can } from 'components/Lib';
import AddInput from 'containers/HRM/#shared/AddInput';
import SidebarListItem from 'containers/HRM/#shared/SidebarListItem';

import styles from '../workSchedule.module.scss';

function Sidebar(props) {
  const {
    workSchedules,
    selectedSchedule,

    isFetchLoading,
    isCreateLoading,

    fetchWorkSchedules,
    createWorkSchedule,
    deleteWorkSchedule,
    fetchWorkScheduleDays,

    setSelectedSchedule,
  } = props;

  const selectedScheduleId = selectedSchedule?.id;
  const addInputRef = useRef(null);
  const [error,setError]=useState(false);

  function handleSubmit(value = '') {
    const name = value && value.trim();
    if (!name || name.length < 3 || name.length > 250 || isCreateLoading){
      setError(true)
      return;}
      setError(false)
    createWorkSchedule(name, onSucces);
  }

  function workScheduleDeleteHandle(id, stopLoading) {
    deleteWorkSchedule(
      id,
      // onSucces
      () => {
        stopLoading();
        onSucces(id);
      },
      // onFail
      stopLoading
    );
  }

  function onSucces(id) {
    addInputRef.current.clear();

    if (id === selectedScheduleId) {
      setSelectedSchedule(workSchedules[0]);
    }

    fetchWorkSchedules();
  }

  function selectSchedule(data) {
    setSelectedSchedule({ attribute: data });
  }

  useEffect(() => {
    if (selectedScheduleId) {
      fetchWorkScheduleDays(selectedScheduleId);
    }
  }, [selectedScheduleId]);

  useEffect(() => {
    fetchWorkSchedules();
  }, []);

  const WorkSchedulesList = workSchedules.map(schedule => {
    const { id, name } = schedule;
    return (
      <SidebarListItem
        data={schedule}
        onDelete={stopLoading => workScheduleDeleteHandle(id, stopLoading)}
        onSelect={selectSchedule}
        key={id}
        showDeleteButton={abilities.can(
          accessTypes.manage,
          permissions.work_schedule
        )}
        isSelected={selectedScheduleId === id}
        mainTitle={name}
        secondTitle=""
      />
    );
  });

  return (
    <LayoutSidebar title="İş rejimi">
      <Can I={accessTypes.manage} a={permissions.work_schedule}>
        {() => (
          <AddInput
            onSubmit={handleSubmit}
            isCreateLoading={isCreateLoading}
            ref={addInputRef}
            label="İş rejimini əlavə et"
            placeholder="Rejimin adı"
            error={error}
          />
        )}
      </Can>

      {/*  list  */}
      <ul className={styles.list}>
        <Spin spinning={isFetchLoading}>{WorkSchedulesList}</Spin>
      </ul>
    </LayoutSidebar>
  );
}

const mapStateToProps = state => ({
  workSchedules: state.workSchedulesReducer.workSchedules,
  selectedSchedule: state.workSchedulesReducer.selectedSchedule,

  isCreateLoading: !!state.loadings.createWorkSchedule,
  isFetchLoading: !!state.loadings.fetchWorkSchedules,
});

export default connect(
  mapStateToProps,
  {
    createWorkSchedule,
    deleteWorkSchedule,
    fetchWorkSchedules,
    fetchWorkScheduleDays,
    setSelectedSchedule,
  }
)(Sidebar);
