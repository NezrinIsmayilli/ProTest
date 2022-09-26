import React, { useEffect, useState } from 'react';
import {
    Sidebar,
    ProDateRangePicker,
    ProSelect,
    ProSearch,
    ProAsyncSelect
} from 'components/Lib';
import { Select } from 'antd';
import { types } from '../types';
import { connect } from 'react-redux';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import styles from '../../styles.module.scss';

const SalesReportSidebar = props => {
  const { filters, onFilter, profile,handlePaginationChange,thisMonthStart,thisMonthEnd, fetchBusinessUnitList } = props;
  const [StartDate, setStartDate] = useState(filters.dateFrom!=thisMonthStart? filters.dateFrom:null);
  const [EndDate, setEndDate] = useState(filters.dateTo!=thisMonthEnd? filters.dateTo:null);
  const [description, setDescription] = useState(filters.description? filters.description:undefined);
  const handleTypeFilter = type => {
    handlePaginationChange(1);
    onFilter('type', types[type].name);
  };

  const handleDatePicker = (startDate, endDate) => {
    handlePaginationChange(1);
    setStartDate(startDate);
    onFilter(
      'dateFrom',
      startDate ? startDate.format('DD-MM-YYYY') : undefined
    );
    setEndDate(endDate);
    onFilter('dateTo', endDate ? endDate.format('DD-MM-YYYY') : undefined);
  };

  const handleChange = (e, value) => {
    setDescription(e.target.value)
    if (e.target.value === '') {
        onFilter('description', value);
        onFilter('page', 1);
    }
  };

  useEffect(() => {
    handlePaginationChange(filters.page? filters.page:1)
  }, []);

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
    <Sidebar title="Hesabatlar">
      <div className={styles.Sidebar}>
        {businessUnits?.length === 1 &&
        profile.businessUnits.length === 0 ? null : (
          <div className={styles.sidebarItem}>
            <span className={styles.sectionName}>Biznes blok</span>
            <ProAsyncSelect
              mode="multiple"
              selectRequest={ajaxBusinessUnitSelectRequest}
              valueOnChange={values => {
                  handlePaginationChange(1);
                  onFilter('businessUnitIds', values);
              }}
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
              value={
                  filters.businessUnitIds
                      ? filters.businessUnitIds.map(Number)
                      : businessUnitLength === 1
                      ? businessUnits[0]?.id === null
                          ? businessUnits[0]?.name
                          : businessUnits[0]?.id
                      : filters.businessUnitIds
              }
          />
          </div>
        )}
        <div className={styles.sidebarItem}>
          <span className={styles.sectionName}>Tarix</span>
          <ProDateRangePicker
            size="large"
            buttonSize="default"
            buttonStyle={{ width: '31.5%' }}
            rangeButtonsStyle={{ margin: '10px 0 0 0' }}
            className={styles.datePicker}
            onChangeDate={handleDatePicker}
            defaultStartValue={filters.dateFrom ? filters.dateFrom:undefined}
            defaultEndValue={filters.dateTo ? filters.dateTo:undefined}
            style={{ marginTop: '8px' }}
            placeholder="Seçin"
            notRequired={StartDate||EndDate? true:false}
          />
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.sectionName}>Qruplaşdır:</span>
          <Select
            placeholder="Seçin"
            size="large"
            defaultValue={filters.type}
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
        <div className={styles.sidebarItem}>
          <span className={styles.sectionName}>Əlavə məlumat</span>
          <ProSearch
            onSearch={value => {
              handlePaginationChange(1);
              onFilter('description', value)}}
            onChange={(e, value) => handleChange(e, value)}
            value={description}
          />
        </div>
      </div> 
    </Sidebar>
  );
};

const mapStateToProps = state => ({

});

export default connect(
  mapStateToProps,
  {
      fetchBusinessUnitList,
  }
)(SalesReportSidebar);
