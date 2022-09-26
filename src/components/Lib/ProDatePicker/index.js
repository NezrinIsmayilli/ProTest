import React, { forwardRef } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

import { minimumDate, maximumDate, dateFormat } from 'utils';

import az from './locale.json';
import styles from './styles.module.scss';

export const ProDatePicker = forwardRef((props, ref) => {
  const {
    allowClear = false,
    showToday = false,
    placeholder = 'Tarixi seçin',
    size = 'large',
    format = 'DD-MM-YYYY',
    ...rest
  } = props;
  return (
    <DatePicker
      ref={ref}
      size={size}
      // suffixIcon={<i />} // hide calendar icon
      allowClear={allowClear}
      showToday={showToday}
      className={styles.datePicker}
      dropdownClassName={styles.dropdownDatePicker}
      getCalendarContainer={trigger => trigger.parentNode}
      placeholder={placeholder}
      format={format}
      locale={az}
      disabledDate={date =>
        !date ||
        date.isBefore(moment(minimumDate, dateFormat)) ||
        date.isAfter(moment(maximumDate, dateFormat))
      }
      {...rest}
    />
  );
});
