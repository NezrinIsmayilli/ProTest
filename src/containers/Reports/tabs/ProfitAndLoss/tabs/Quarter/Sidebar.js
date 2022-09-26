import React from 'react';
import DatePicker from 'react-multi-date-picker';
import {
  Sidebar as ProSidebar,
  ProSidebarItem,
  ProSelect,
} from 'components/Lib';

const Sidebar = props => {
  const { filters, onFilter, businessUnits, profile } = props;

  const { years: filteredYears } = filters;
  const handleYearFilter = newYear => {
    onFilter('years', newYear.toDate());
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
    </ProSidebar>
  );
};

export default Sidebar;
