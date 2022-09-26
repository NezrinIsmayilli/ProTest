import React from 'react';
import moment from 'moment';
// content
import {
  Sidebar as ProSidebar,
  ProSidebarItem,
  ProDateRangePicker,
} from 'components/Lib';

const Sidebar = props => {
  const { onFilter } = props;

  const handleDatePicker = (startValue, endValue) => {
    const startDate = startValue
      ? moment(startValue).format('DD-MM-YYYY')
      : undefined;
    const endDate = endValue
      ? moment(endValue).format('DD-MM-YYYY')
      : undefined;
    onFilter('dateFrom', startDate);
    onFilter('dateTo', endDate);
  };

  return (
    <ProSidebar title="Valyuta tarixçəsi">
      <ProSidebarItem label="Tarix">
        <ProDateRangePicker
          placeholderStart="Başlama"
          placeholderEnd="Bitmə"
          getCalendarContainer={trigger => trigger.parentNode.parentNode}
          onChangeDate={handleDatePicker}
        />
      </ProSidebarItem>
    </ProSidebar>
  );
};

export default Sidebar;
