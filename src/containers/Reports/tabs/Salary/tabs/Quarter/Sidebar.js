import React, { useEffect, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import {
    Sidebar as ProSidebar,
    ProSidebarItem,
    ProSelect,
    ProAsyncSelect,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { types } from '../types';
import styles from '../../../styles.module.scss';

const Sidebar = props => {
    const {
        filters,
        onFilter,
        profile,
        setTableDataSub,
        setDefaultExpand,
        fetchBusinessUnitList,
    } = props;

    const { years: filteredYears } = filters;
    const [businessUnits, setBusinessUnits] = useState([]);
    const [businessUnitLength, setBusinessUnitLength] = useState(2);
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);

    const handleFilterByType = (type, values) => {
        onFilter(type, values);
        setTableDataSub([]);
        setDefaultExpand([]);
    };
    const handleYearFilter = newYear => {
        onFilter('years', newYear.toDate());
        setTableDataSub([]);
        setDefaultExpand([]);
    };

    const handleTypeFilter = type => {
        onFilter('groupBy', types[type].name);
        setTableDataSub([]);
        setDefaultExpand([]);
    };
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
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }
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
        <ProSidebar title="Əməkhaqqı hesabatı">
            <div className={styles.Sidebar}>
                {businessUnitLength === 1 &&
                profile.businessUnits.length === 0 ? null : (
                    <ProSidebarItem label="Biznes blok">
                        <ProAsyncSelect
                            mode="multiple"
                            selectRequest={ajaxBusinessUnitSelectRequest}
                            valueOnChange={values => {
                                handleFilterByType('businessUnitIds', values);
                            }}
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
            </div>
        </ProSidebar>
    );
};

const mapStateToProps = state => ({});
export default connect(
    mapStateToProps,
    { fetchBusinessUnitList }
)(Sidebar);
