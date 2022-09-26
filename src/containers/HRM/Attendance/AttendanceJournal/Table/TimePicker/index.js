import React, { useState, useEffect } from 'react';
import moment from 'moment';

import { TimePicker as AntdTimePicker } from 'antd';
import { Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';

import styles from './time.module.scss';

const displayFormat = 'HH:mm';

function formatDate(date) {
  return moment(date).format(displayFormat);
}

export default function TimePicker(props) {
  const { label, value, sendChangedTime = () => {}, row } = props;

  const [innerValue, setInnerValue] = useState(() => value);

  function setTodayTime() {
    const today = moment();

    setInnerValue(today);
    sendChangedTime(formatDate(today), row);
  }

  function onChangeTime(selectedTime) {
    if (selectedTime) {
      setInnerValue(selectedTime);
      sendChangedTime(formatDate(selectedTime), row);
    } else {
      setInnerValue(undefined);
      sendChangedTime(null, row);
    }
  }

  //
  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const isDisabled =
    (row.employeeActivityType !== 1 && row.employeeActivityType !== 2) ||
    !abilities.can(accessTypes.manage, permissions.timecard);

  return (
    <div className={styles.timeWrap}>
      <AntdTimePicker
        placeholder="--:--"
        allowClear={false}
        size="middle"
        className={styles.time}
        getPopupContainer={trigger => trigger.parentNode}
        suffixIcon={<i />}
        format={displayFormat}
        value={innerValue ? moment(innerValue, displayFormat) : undefined}
        onChange={onChangeTime}
        disabled={isDisabled}
      />
      {!isDisabled && (
        <Can I={accessTypes.manage} a={permissions.timecard}>
          <button
            type="button"
            className={styles.timeButton}
            onClick={setTodayTime}
            disabled={isDisabled}
          >
            {label}
          </button>
        </Can>
      )}
    </div>
  );
}
