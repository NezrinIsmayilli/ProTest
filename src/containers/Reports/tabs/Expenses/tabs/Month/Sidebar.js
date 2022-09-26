import React, { useState, useEffect } from 'react';
import DatePicker from 'react-multi-date-picker';
import {
  Sidebar as ProSidebar,
  ProSidebarItem,
  ProSelect,
  ProAsyncSelect
} from 'components/Lib';
import { Checkbox, Select } from 'antd';
import { years, months, today } from 'utils';
import { types } from '../types';
import styles from '../../../styles.module.scss';
import { connect } from 'react-redux';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';

const Sidebar = props => {
  const {
    filters,
    onFilter,
    profile,
    setTableDataSub,
    setDefaultExpand,
    fetchBusinessUnitList 
  } = props;

  const [allMonthsSelected, setAllMonthsSelected] = useState(false);
  const { years: filteredYears, months: filteredMonths } = filters;

  const handleYearFilter = newYear => {
    onFilter('years', newYear.toDate());
    setTableDataSub([]);
    setDefaultExpand([]);
  };

  const handleFilterByType = (type, values) => {
    onFilter(type, values);
    setTableDataSub([]);
    setDefaultExpand([]);
  };

  const handleMonthFilter = newMonths => {
    if (newMonths.length === 0 || newMonths.length === 12) {
      setAllMonthsSelected(true);
    } else if (allMonthsSelected) {
      setAllMonthsSelected(false);
    }
    onFilter('months', newMonths);
    setTableDataSub([]);
    setDefaultExpand([]);
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
    setTableDataSub([]);
    setDefaultExpand([]);
  };

  const handleTypeFilter = type => {
    onFilter('groupBy', types[type].name);
    setTableDataSub([]);
    setDefaultExpand([]);
  };

  const handleCheckbox = ({ target: { checked } }) => {
    onFilter('includeProductionExpense', checked ? '1' : undefined);
    setTableDataSub([]);
    setDefaultExpand([]);
  };

  const [businessUnits, setBusinessUnits] = useState([]);
  const [businessUnitLength, setBusinessUnitLength] = useState(2);
  
  const [
    filterSelectedBusinessUnit,
    setFilterSelectedBusinessUnit,
] = useState([]);

useEffect(() => {
  if (filters.businessUnitIds) {
      fetchBusinessUnitList({
          filters: {
              isDeleted: 0,
              businessUnitIds: profile.businessUnits?.map(({ id }) => id),
              ids: filters.businessUnitIds.map(Number),
          },
          onSuccess: data => {
              const appendList = [];
              if (data.data) {
                  data.data.forEach(element => {
                      appendList.push({
                          id: element.id,
                          name: element.name,
                          ...element,
                      });
                  });
              }
              setFilterSelectedBusinessUnit(appendList);
          },
      });
  } else {
    fetchBusinessUnitList({
      filters: {
          limit: 10,
          page: 1,
          isDeleted: 0,
          businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
      onSuccess: data => {
          setBusinessUnitLength(data.data?.length || 0);
      },
  });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



const ajaxBusinessUnitSelectRequest = (
  page = 1,
  limit = 20,
  search = '',
  stateReset = 0,
  onSuccessCallback
) => {
  const filters = {
      limit,
      page,
      name: search,
      isDeleted: 0,
      businessUnitIds: profile.businessUnits?.map(({ id }) => id),
  };
  fetchBusinessUnitList({
      filters,
      onSuccess: data => {
          const appendList = [];
          if (data.data) {
              data.data.forEach(element => {
                  appendList.push({
                      id: element.id,
                      name: element.name,
                      ...element,
                  });
              });
          }
          if (onSuccessCallback !== undefined) {
              onSuccessCallback(!appendList.length);
          }
          if (stateReset) {
              setBusinessUnits(appendList);
          } else {
              setBusinessUnits(businessUnits.concat(appendList));
          }
      },
  });
};



  return (
    <ProSidebar title="Xərclər">
      <div className={styles.Sidebar}>
        {businessUnitLength === 1 &&
        profile.businessUnits.length === 0 ? null : (
          <ProSidebarItem label="Biznes blok">
            <ProAsyncSelect
              mode="multiple"
              selectRequest={ajaxBusinessUnitSelectRequest}
              valueOnChange={values => handleFilterByType('businessUnitIds', values)}
              value={
                filters.businessUnitIds
                ? filters.businessUnitIds.map(Number)
                : businessUnitLength === 1
                ? businessUnits[0]?.id === null
                    ? businessUnits[0]?.name
                    : businessUnits[0]?.id
                : filters.businessUnitIds
              }
              disabled={businessUnitLength === 1}
              data={
                filterSelectedBusinessUnit.length > 0
                    ? [
                      ...filterSelectedBusinessUnit.filter(
                          item => item.id !== null
                      ),
                      ...businessUnits
                          ?.map(item =>
                              item.id === null
                                  ? { ...item, id: 0 }
                                  : item
                          )
                          .filter(
                              item =>
                                  !filterSelectedBusinessUnit
                                      .map(({ id }) => id)
                                      ?.includes(item.id)
                          ),
                      ]
                    : businessUnits?.map(item =>
                          item.id === null
                              ? { ...item, id: 0 }
                              : item
                      )
            }
            disabledBusinessUnit={businessUnitLength === 1}
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
          <Checkbox
            checked={allMonthsSelected}
            onChange={handleFilterAllMonths}
          >
            Bütün aylar
          </Checkbox>
        </ProSidebarItem>

        <div className={styles.sidebarItem}>
          <span className={styles.sectionName}>Qruplaşdır</span>
          <Select
            placeholder="Seçin"
            size="large"
            defaultValue={filters.groupBy}
            className={styles.select}
            onChange={handleTypeFilter}
            showArrow
          >
            {Object.values(types).map(type => (
              <Select.Option
                value={type.name}
                key={type.id}
                className={styles.dropdown}
              >
                {type.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        <ProSidebarItem>
          <Checkbox
            checked={filters.includeProductionExpense === '1'}
            style={{ fontSize: '13px' }}
            onChange={handleCheckbox}
          >
            İstehsalat xərclərini də göstər
          </Checkbox>
        </ProSidebarItem>
      </div>
    </ProSidebar>
  );
};

const mapStateToProps = state => ({

});

export default connect(mapStateToProps,  {
  fetchBusinessUnitList,
})(Sidebar);
