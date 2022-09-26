import React from 'react';
import { ProDatePicker } from 'components/Lib';

import styles from './styles.module.scss';

export const ProCalendar = React.memo(props => {
  const { wrapStyle, ...rest } = props;

  return (
    <div className={styles.wrap} style={wrapStyle}>
      <ProDatePicker
        open
        dropdownClassName={styles.interviewdatePicker}
        getCalendarContainer={trigger => trigger.parentNode}
        suffixIcon={<i />}
        {...rest}
      />
    </div>
  );
});
