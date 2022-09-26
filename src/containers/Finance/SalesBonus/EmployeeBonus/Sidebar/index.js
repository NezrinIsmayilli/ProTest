/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Checkbox } from 'antd';
import {
    Sidebar,
    ProSidebarItem,
    ProSelect,
    ProAsyncSelect,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { optionsYear, optionsMonth } from 'utils';

// actions
import { fetchPositions } from 'store/actions/settings/vezifeler';
import { fetchStructures } from 'store/actions/structure';
import styles from '../../styles.module.scss';

function EmploeyeeBonusSidebar(props) {
    const {
        // data
        positions,
        positionsLoading,
        structures,
        structuresLoading,
        // actions
        fetchPositions,
        fetchStructures,
        setselectedYearandMonth,
        selectedYearandMonth,
        bonusConfiguration,
        filters,
        onFilter,
        businessUnits,
        ajaxBusinessUnitSelectRequest,
        profile,
        fetchBusinessUnitList,
    } = props;

    const [businessUnitLength, setBusinessUnitLength] = useState(2);

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        if (positions.length === 0) {
            fetchPositions();
        }
    }, []);
    useEffect(() => {
        if (filters?.businessUnitIds) {
            fetchStructures({ businessUnitIds: filters?.businessUnitIds });
        } else {
            fetchStructures();
        }
    }, [filters.businessUnitIds]);
    const handleFilter = (type, value) => {
        setselectedYearandMonth(prevFilters => ({
            ...prevFilters,
            [type]: value,
        }));
    };
    return (
        <Sidebar title="Əməkdaşlar üzrə bonus">
            {businessUnitLength === 1 &&
            profile.businessUnits.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxBusinessUnitSelectRequest}
                        valueOnChange={values => {
                            onFilter('businessUnitIds', values);
                        }}
                        disabled={businessUnitLength === 1}
                        data={businessUnits?.map(item =>
                            item.id === null ? { ...item, id: 0 } : item
                        )}
                        disabledBusinessUnit={businessUnitLength === 1}
                        value={
                            businessUnitLength === 1
                                ? businessUnits[0]?.id === null
                                    ? businessUnits[0]?.name
                                    : businessUnits[0]?.id
                                : filters.businessUnitIds
                        }
                    />
                </ProSidebarItem>
            )}
            <div className={styles.customWrap}>
                <div>
                    <div className={styles.customLabel}>İl</div>
                    <ProSelect
                        style={{ width: '120px' }}
                        value={selectedYearandMonth?.selectedYear}
                        allowClear={false}
                        data={optionsYear}
                        onChange={value => {
                            handleFilter('selectedYear', value);
                        }}
                    />
                </div>
                <div>
                    <div className={styles.customLabel}>Ay</div>
                    <ProSelect
                        style={{ width: '120px' }}
                        value={selectedYearandMonth?.selectedMonth}
                        allowClear={false}
                        data={optionsMonth}
                        onChange={value => {
                            handleFilter('selectedMonth', value);
                        }}
                    />
                </div>
            </div>

            <ProSidebarItem label="Bölmə">
                <ProSelect
                    mode="multiple"
                    onChange={value => onFilter('structures', value)}
                    allowClear
                    loading={structuresLoading}
                    disabled={structuresLoading}
                    data={structures}
                />
            </ProSidebarItem>

            <ProSidebarItem label="Vəzifə">
                <ProSelect
                    mode="multiple"
                    onChange={value => onFilter('occupations', value)}
                    allowClear
                    loading={positionsLoading}
                    disabled={positionsLoading}
                    data={positions}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Bölmə rəhbəri">
                <Checkbox
                    checked={filters.isChief === '1'}
                    style={{ fontSize: '13px' }}
                    onChange={({ target: { checked } }) =>
                        onFilter('isChief', checked ? '1' : undefined)
                    }
                >
                    Bölmə rəhbəri
                </Checkbox>
                <Checkbox
                    checked={filters.isChief === '0'}
                    style={{ fontSize: '13px' }}
                    onChange={({ target: { checked } }) =>
                        onFilter('isChief', checked ? '0' : undefined)
                    }
                >
                    Digər
                </Checkbox>
            </ProSidebarItem>
            <ProSidebarItem label="Satış dövriyyəsi">
                <ProSelect
                    mode="multiple"
                    onChange={value => onFilter('turnovers', value)}
                    allowClear
                    data={[
                        { id: 1, name: 'Öz satışları' },
                        { id: 2, name: 'Bütün satışlar' },
                    ]}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Bonus növü">
                <ProSelect
                    mode="multiple"
                    onChange={value => onFilter('configurations', value)}
                    allowClear
                    // loading={positionsLoading}
                    data={bonusConfiguration}
                />
            </ProSidebarItem>
        </Sidebar>
    );
}

const mapStateToProps = state => ({
    bonusConfiguration: state.bonusConfigurationReducer.bonusConfiguration,
    positions: state.vezifelerReducer.data,
    positionsLoading: state.vezifelerReducer.isLoading,
    structures: state.structureReducer.structures,
    structuresLoading: state.structureReducer.isLoading,
});

export default connect(
    mapStateToProps,
    {
        fetchPositions,
        fetchStructures,
        fetchBusinessUnitList,
    }
)(EmploeyeeBonusSidebar);
