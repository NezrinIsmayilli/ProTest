import React, { useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import {
  Sidebar as ProSidebar,
  ProSidebarItem,
  ProSelect,
} from 'components/Lib';
import { Checkbox } from 'antd';
import { months, today } from 'utils';

const Sidebar = props => {
  const { filters, onFilter, businessUnits, profile } = props;

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
    onFilter('months', newMonths);
  };

  const handleFilterAllMonths = event => {
    if (event.target.checked) {
      setAllMonthsSelected(true);
      onFilter('months', []);
    } else {
      const currentMonth = today.split('-')[1];
      onFilter('months', [Number(currentMonth)]);
      setAllMonthsSelected(false);
    }
  };

  return (
    <ProSidebar title="Mənfəət və Zərər">
      {businessUnits?.length === 1 &&
      profile.businessUnits.length === 0 ? null : (
        <ProSidebarItem label="Biznes blok">
          <ProSelect
            mode="multiple"
            onChange={values => onFilter('businessUnitIds', values)}
            value={
              businessUnits?.length === 1
                ? businessUnits[0]?.id === null
                  ? businessUnits[0]?.name
                  : businessUnits[0]?.id
                : filters.businessUnitIds
            }
            disabled={businessUnits?.length === 1}
            data={businessUnits?.map(item =>
              item.id === null ? { ...item, id: 0 } : item
            )}
            disabledBusinessUnit={businessUnits?.length === 1}
          />
        </ProSidebarItem>
      )}
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
          mode="multiple"
          keys={['label']}
          data={months}
          value={filteredMonths}
          onChange={handleMonthFilter}
        />
        <Checkbox checked={allMonthsSelected} onChange={handleFilterAllMonths}>
          Bütün aylar
        </Checkbox>
      </ProSidebarItem>
    </ProSidebar>
  );
};

export default Sidebar;
