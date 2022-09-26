import React from 'react';
import DatePicker from 'react-multi-date-picker';
import { Sidebar as ProSidebar, ProSidebarItem } from 'components/Lib';

import Navigation from '../../Navigation';

const Sidebar = props => {
  const { filters, onFilter } = props;
  const { years: filteredYears } = filters;

  const handleYearFilter = newYear => {
    onFilter('years', newYear.toDate());
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
    </ProSidebar>
  );
};

export default Sidebar;
