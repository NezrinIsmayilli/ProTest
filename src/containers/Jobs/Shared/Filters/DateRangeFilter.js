/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { ProDateRangePicker, ProSidebarItem } from 'components/Lib';
import moment from 'moment';

const DateRangeFilter = props => {
  const { onFilter } = props;
  const timeoutRef = useRef(null);

  const handleDatePicker = (startValue, endValue) => {
    const startDate = startValue
      ? moment(startValue).format('DD-MM-YYYY')
      : undefined;
    const endDate = endValue
      ? moment(endValue).format('DD-MM-YYYY')
      : undefined;
    onFilter('fromDate', startDate);
    onFilter('toDate', endDate);
  };

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
    }, 800);
  });

  return (
    <ProSidebarItem label="Tarix">
      <ProDateRangePicker onChangeDate={handleDatePicker} />
    </ProSidebarItem>
  );
};

export default React.memo(DateRangeFilter);
