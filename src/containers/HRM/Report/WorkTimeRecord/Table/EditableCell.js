import React, { useState, Fragment } from 'react';
import { connect } from 'react-redux';

// components
import { Popover, Button, Tooltip } from 'antd';

import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

// utils
import { workTimeEventCodes } from 'utils';

// actions
import { editTimecardEvent } from 'store/actions/hrm/timecard';

import styles from '../styles.module.scss';

function secondToHour(seconds) {
  const hours = Number(seconds) / 3600;
  return Number(hours.toFixed('0'));
}

function getPopupContainer() {
  return document.getElementById('timecardArea');
}

// popover content
const EventListContent = props => {
  const { eventClickHandle } = props;

  const content = Object.keys(workTimeEventCodes).map(code => {
    // not render 'İşə qəbul olunmayıb', 'İş günü' as list item
    if (code === '1' || code === '7') return null;

    function clickHandler(e) {
      e.stopPropagation();
      eventClickHandle(code);
    }

    return (
      <li onClick={clickHandler} className={styles.eventTitle} key={code}>
        {workTimeEventCodes[code].title}
      </li>
    );
  });

  return content;
};

function EditableCell(props) {
  const { row, editTimecardEvent } = props;
  const { id, eventCode, workingSeconds } = row;

  // use work hour as index //index start from 8
  const [state, setState] = useState(() => ({
    selectedEventCode:
      eventCode === 7 ? secondToHour(workingSeconds) + 7 : eventCode,
    isPopoverOpen: false,
    isTimecarEditLoading: false,
  }));

  const { selectedEventCode, isPopoverOpen, isTimecarEditLoading } = state;

  // most used referances
  const event = workTimeEventCodes[selectedEventCode];
  const color = event?.color || '#000';
  const isWorkHour = selectedEventCode > 6;
  const colorStyle = { color: isWorkHour ? '#fff' : color };
  const workHourTitle = event ? event.label : secondToHour(workingSeconds);

  const CustomToolTip = ({ children, ...rest }) => (
    <Tooltip
      title={
        <span style={{ color: isWorkHour ? '#000' : '#fff' }}>
          {isWorkHour ? 'İş günü' : event?.title}
        </span>
      }
      getPopupContainer={getPopupContainer}
      overlayStyle={colorStyle}
      overlayClassName={styles.tooltip}
      {...rest}
    >
      {children}
    </Tooltip>
  );

  if (!id) {
    return (
      <div className={styles.editableCell}>
        <CustomToolTip>
          <div className={styles.cellWrap} style={colorStyle}>
            {isWorkHour ? (
              <span className={styles.hour}>{workHourTitle}</span>
            ) : (
              event?.label
            )}
          </div>
        </CustomToolTip>
      </div>
    );
  }

  function eventClickHandle(code) {
    let data;
    const numberCode = Number(code);

    if (numberCode > 7) {
      data = {
        eventCode: 7,
        workingSeconds: workTimeEventCodes[code].label * 60 * 60, // hour to seconds
      };
    } else {
      data = {
        eventCode: numberCode,
        workingSeconds: null,
      };
    }

    setState({
      ...state,
      isPopoverOpen: true,
      isTimecarEditLoading: true,
    });

    editTimecardEvent(
      id,
      data,
      () => successCallback(numberCode),
      failureCallback
    );
  }

  function successCallback(code) {
    setState({
      selectedEventCode: code,
      isPopoverOpen: false,
      isTimecarEditLoading: false,
    });
  }

  function failureCallback() {
    setState({
      ...state,
      isTimecarEditLoading: false,
    });
  }

  function editIconClickHandle(e) {
    e.stopPropagation();
  }

  function onChangePopoverVisible(visible) {
    setState({
      ...state,
      isPopoverOpen: visible,
    });
  }

  return (
    <Fragment>
      <div
        className={`
            ${styles.editableCell} 
            ${id ? styles.canEdit : ''} 
            ${isTimecarEditLoading ? styles.loading : ''}
         `}
      >
        {isWorkHour ? (
          <span className={styles.hour}>{workHourTitle}</span>
        ) : (
          <div className={styles.cellWrap} style={{ color }}>
            {event?.label}
          </div>
        )}
      </div>

      {id && (
        <div className={styles.cellWrap} style={colorStyle}>
          <Popover
            placement="bottomLeft"
            content={<EventListContent eventClickHandle={eventClickHandle} />}
            trigger="click"
            arrowPointAtCenter
            visible={isPopoverOpen}
            getPopupContainer={getPopupContainer}
            onVisibleChange={onChangePopoverVisible}
            overlayClassName={styles.popover}
            mouseLeaveDelay={0}
            mouseEnterDelay={0}
            autoAdjustOverflow={false}
          >
            <CustomToolTip>
              <Button
                type="link"
                icon="form"
                className={styles.cellEditButton}
                loading={isTimecarEditLoading}
                onClick={editIconClickHandle}
                disabled={
                  !abilities.can(
                    accessTypes.manage,
                    permissions.timecard_report
                  )
                }
              />
            </CustomToolTip>
          </Popover>
        </div>
      )}
    </Fragment>
  );
}

export default connect(
  null,
  {
    editTimecardEvent,
  }
)(EditableCell);
