import React from 'react';
import { TimePicker } from 'antd';
import styles from './styles.module.scss';

export function ProTimePicker(props) {
  return (
    <TimePicker
      size="large"
      suffixIcon={<i />} // hide calendar icon
      allowClear={false}
      showToday={false}
      placeholder=""
      className={styles.timePickerDefault}
      popupClassName={styles.popupDefault}
      format="HH:mm"
      {...props}
    />
  );
}
