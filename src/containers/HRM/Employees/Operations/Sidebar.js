/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Checkbox } from 'antd';
import moment from 'moment';

import {
  Sidebar as LayoutSidebar,
  ProSelect,
  ProDateRangePicker,
  ProSidebarItem,
} from 'components/Lib';
import { fetchEmployeeActivities } from 'store/actions/employeeActivity/employeeActivity';
import { fetchStructures } from 'store/actions/structure';
import { fetchPositions } from 'store/actions/settings/vezifeler';
import { onChangeDateHandle } from 'utils';

import styles from './styles.module.scss';

const operationType = [
  { name: 'İşə qəbul', type: 1 },
  { name: 'İşə xitam', type: 2 },
  { name: 'İcazə', type: 3 },
  { name: 'Məzuniyyət', type: 4 },
  { name: 'Ezamiyyət', type: 5 },
  { name: 'Xəstəlik', type: 6 },
  { name: 'İş görüşü', type: 7 },
];
function Sidebar(props) {
  const {
    fetchStructures,
    structureList,
    structuresCount,
    fetchPositions,
    positionList,
    positionsCount,
    filters,
    onFilter,
    businessUnits,
    profile,
  } = props;

  useEffect(() => {
    Promise.all([positionsCount === 0 && fetchPositions()]);
  }, []);
  useEffect(() => {
    if (filters?.businessUnitIds) {
      fetchStructures({ businessUnitIds: filters?.businessUnitIds });
    } else {
      fetchStructures();
    }
  }, [filters.businessUnitIds]);
  function handleCheckboxGroup(checkedValues) {
    onFilter('types', checkedValues);
  }
  const onChangeDate = (startValue, endValue) => {
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
    <LayoutSidebar title="Əməkdaşlar">
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
      <ProSidebarItem label="Tarix üzrə axtarış">
        <ProDateRangePicker
          getCalendarContainer={trigger => trigger.parentNode.parentNode}
          onChangeDate={onChangeDate}
        />
      </ProSidebarItem>

      <ProSidebarItem label="Əməliyyatın növü">
        <Checkbox.Group onChange={handleCheckboxGroup}>
          {operationType.map(item => (
            <div key={item.name}>
              <Checkbox className={styles.noMargin} value={item.type}>
                {item.name}
              </Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      </ProSidebarItem>

      <ProSidebarItem label="Bölmə">
        <ProSelect
          data={structureList}
          onChange={value => onFilter('structureId', value)}
        />
      </ProSidebarItem>

      <ProSidebarItem label="Vəzifə">
        <ProSelect
          data={positionList}
          onChange={value => onFilter('occupationId', value)}
        />
      </ProSidebarItem>
    </LayoutSidebar>
  );
}

const mapStateToProps = state => ({
  structuresCount: state.structureReducer.structureList.length,
  structureList: state.structureReducer.structures,
  positionsCount: state.vezifelerReducer.data.length,
  positionList: state.vezifelerReducer.data,
  isLoading: !!state.loadings.fetchEmployeeActivities,
  employeeActivitiesCount:
    state.employeeActivitiesReducer.employeeActivities.length,
});

export default connect(
  mapStateToProps,
  {
    fetchStructures,
    fetchPositions,
    fetchEmployeeActivities,
  }
)(Sidebar);
