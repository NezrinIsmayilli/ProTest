import React, { useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import {
  Sidebar as ProSidebar,
  ProSidebarItem,
  ProSelect,
} from 'components/Lib';
import { months } from 'utils';
import Navigation from '../../Navigation';

const Sidebar = props => {
  const { filters, onFilter } = props;

  const [allMonthsSelected, setAllMonthsSelected] = useState(false);
  const { years: filteredYears, months: filteredMonths } = filters;
  const handleYearFilter = newYear => {
    onFilter('years', newYear.toDate());
  };
  const handleMonthFilter = newMonths => {
    if (newMonths.length === 0 || newMonths.length === 12) {
      setAllMonthsSelected(true);
    } else if (allMonthsSelected) {
      setAllMonthsSelected(false);
    }
    onFilter('months', [newMonths]);
  };

  return (
    <ProSidebar title="Əsas göstəricilər">
      <Navigation />

      <ProSidebarItem label="İl">
        <DatePicker
          allowClear={false}
          onlyYearPicker
          style={{
            width: '100%',
            fontWeight: 'normal',
            fontSize: '13px',
            color: '#555555',
            marginBottom: '5px',
            height: '35px',
          }}
          containerStyle={{
            width: '100%',
          }}
          value={filteredYears}
          range={false}
          multiple={false}
          onChange={year => handleYearFilter(year)}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Ay">
        <ProSelect
          keys={['label']}
          data={months}
          value={filteredMonths}
          onChange={handleMonthFilter}
          allowClear={false}
        />
      </ProSidebarItem>
    </ProSidebar>
  );
};

export default Sidebar;
