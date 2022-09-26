/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

// components
import { Row, Col, Icon, Button } from 'antd';
import { ProSelect, Can } from 'components/Lib';
import EditInput from 'containers/HRM/#shared/EditInput';

// utils
import { optionsYear } from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

// actions
import {
  editHRMCalendar,
  fetchHRMCalendars,
  changeCalendarSelectedYear,
} from 'store/actions/hrm/calendars';

import styles from '../styles.module.scss';

function SettingsPanel(props) {
  const {
    openNonWorkingDaysDrawer,

    selectedCalendar,
    calendars,
    isEditLoading,
    selectedYear,

    editHRMCalendar,
    fetchHRMCalendars,
    changeCalendarSelectedYear,
  } = props;

  const { name, id } = selectedCalendar || {};
  const [error,SetError]=useState(false)
  const [state, setState] = useState(() => ({
    isEdit: false,
    initialInputValue: name,
  }));

  const { isEdit, initialInputValue } = state;

  function setToEdit() {
    if (abilities.can(accessTypes.manage, permissions.calendar)) {
      setState({
        ...state,
        isEdit: true,
      });
    }
  }

  function handleEdit(value) {
    const name = value.trim();
    if (!isEditLoading && name.length > 2) {
      editHRMCalendar(id, { name }, () => onSuccess(name));
      SetError(false)
    }
    else{
      SetError(true)
    }
  }

  const changeSelectedYear = calendar =>
    changeCalendarSelectedYear({ data: calendar });

  function onSuccess(name) {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: name,
    });
    fetchHRMCalendars();
  }

  function getSelectedCalendarName() {
    const selectedCalendar = calendars.find(item => item.id === id);
    return selectedCalendar?.name || '';
  }

  function cancelEdit() {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: getSelectedCalendarName(),
    });
  }

  let renderTitle = null;

  if (isEdit) {
    renderTitle = (
      <div>
        <EditInput
          name={initialInputValue}
          onSubmitEdit={handleEdit}
          isEditLoading={isEditLoading}
          handleCancel={cancelEdit}
        />
         {error&& <p style={{color:'red',fontSize:"12px"}}>Bu dəyər 3 simvoldan az olmamalıdır.</p>}
      </div>
    );
  } else {
    renderTitle = (
      <button
        type="button"
        title="Redaktə et"
        className={styles.penButton}
        onClick={setToEdit}
      >
        <span className={styles.nameSpan}>{initialInputValue}</span>
        <Can I={accessTypes.manage} a={permissions.calendar}>
          <Icon type="edit" />
        </Can>
      </button>
    );
  }

  useEffect(() => {
    setState({
      ...state,
      isEdit: false,
      initialInputValue: name,
    });
  }, [id]);

  return (
    <Row gutter={12} className={styles.settingsWrap}>
      <Col span={17} className={styles.textColsWrap}>
        <div className={styles.infoText}>{renderTitle}</div>
        <div className={styles.alignRight}>
          <ProSelect
            className={styles.borderedRadius}
            value={selectedYear}
            data={optionsYear}
            onSelect={changeSelectedYear}
          />
          <Can I={accessTypes.manage} a={permissions.calendar}>
            <Button
              className={styles.nonWorkingDaysButton}
              type="link"
              icon="tool"
              onClick={openNonWorkingDaysDrawer}
            >
              Qeyri iş günləri
            </Button>
          </Can>
        </div>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => ({
  calendars: state.hrmCalendarReducer.calendars,
  selectedCalendar: state.hrmCalendarReducer.selectedCalendar,
  selectedYear: state.hrmCalendarReducer.calendarSelectedYear,
  isEditLoading: !!state.loadings.editHRMCalendar,
});

export default connect(
  mapStateToProps,
  {
    fetchHRMCalendars,
    editHRMCalendar,
    changeCalendarSelectedYear,
  }
)(SettingsPanel);
