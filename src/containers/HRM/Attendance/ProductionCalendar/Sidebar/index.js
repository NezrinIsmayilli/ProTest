/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

// actions
import {
  createHRMCalendar,
  deleteHRMCalendarById,
  fetchHRMCalendars,
  setSelectedCaledar,
  fetchCalendarNonWorkingDaysByCalendarId,
} from 'store/actions/hrm/calendars';

// components
import { Spin } from 'antd';
import { Sidebar, Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

import SidebarListItem from '../../../#shared/SidebarListItem';
import AddInput from '../../../#shared/AddInput';
import styles from '../styles.module.scss';

function ProductionCalendarSidebar(props) {
  const {
    calendars,
    selectedCalendar,

    isCreateLoading,
    isFetchLoading,
    nonWorkingDaysByCalendarLoading,

    // actions
    createHRMCalendar,
    deleteHRMCalendarById,
    fetchHRMCalendars,
    setSelectedCaledar,
    fetchCalendarNonWorkingDaysByCalendarId,
  } = props;

  const selectedCalendarId = selectedCalendar?.id;
  const addInputRef = useRef(null);
  const [error,setError]=useState(false);

  useEffect(() => {
    if (selectedCalendarId) {
      fetchCalendarNonWorkingDaysByCalendarId(selectedCalendarId);
    }
  }, [selectedCalendarId]);

  // on succesfull delete
  function onSucces(id) {
    addInputRef.current.clear();
    if (id === selectedCalendarId) {
      setSelectedCaledar(calendars[0]);
    }
    fetchHRMCalendars();
  }

  function handleDelete(id, stopLoading) {
    deleteHRMCalendarById(
      id,
      () => {
        stopLoading();
        onSucces(id);
      },
      stopLoading
    );
  }

  // create new Calendar
  function createNewCalendar(name) {
    const data = {
      name,
    };

    createHRMCalendar(data, onSucces);
  }

  function onSubmit(value) {
    const term = value && value.trim();

    if (term.length > 2 && !isCreateLoading) {
      createNewCalendar(term);
      setError(false)
    }
    else{
      setError(true)
    }
  }

  function selectCalendar(data) {
    setSelectedCaledar({ attribute: data });
  }

  useEffect(() => {
    fetchHRMCalendars();
  }, []);

  const List = calendars.map(calendar => {
    const { id, name } = calendar;
    return (
      <SidebarListItem
        data={calendar}
        onDelete={stopLoading => handleDelete(id, stopLoading)}
        onSelect={selectCalendar}
        key={id}
        showDeleteButton={abilities.can(
          accessTypes.manage,
          permissions.calendar
        )}
        isSelected={selectedCalendarId === id}
        mainTitle={name}
        secondTitle=""
      />
    );
  });

  return (
    <Sidebar title="İstehsalat təqvimi">
      <Can I={accessTypes.manage} a={permissions.calendar}>
        <AddInput
          onSubmit={onSubmit}
          isCreateLoading={isCreateLoading}
          ref={addInputRef}
          label="İstehsalat təqvimi əlavə et"
          placeholder="Təqvimin adı"
          error={error}
        />
      </Can>

      {/*  list  */}
      <ul className={styles.list}>
        <Spin spinning={isFetchLoading || nonWorkingDaysByCalendarLoading}>
          {List}
        </Spin>
      </ul>
    </Sidebar>
  );
}

const mapStateToProps = state => ({
  calendars: state.hrmCalendarReducer.calendars,
  selectedCalendar: state.hrmCalendarReducer.selectedCalendar,

  isCreateLoading: !!state.loadings.createHRMCalendar,
  isFetchLoading: !!state.loadings.fetchHRMCalendars,
  nonWorkingDaysByCalendarLoading: !!state.loadings
    .fetchCalendarNonWorkingDaysByCalendarId,
});

export default connect(
  mapStateToProps,
  {
    createHRMCalendar,
    deleteHRMCalendarById,
    fetchHRMCalendars,
    setSelectedCaledar,
    fetchCalendarNonWorkingDaysByCalendarId,
  }
)(ProductionCalendarSidebar);
