/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { fetchSalaryByYear } from 'store/actions/reports/salary';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import { filterQueryResolver } from 'utils';
import { fetchSalesReports } from 'store/actions/reports/sales-report';
import Sidebar from './Sidebar';
import Table from './Table';
import Navigation from '../../Navigation';

const YearSalary = props => {
    const {
        fetchSalaryByYear,
        fetchMainCurrency,
        fetchBusinessUnitList,
        businessUnits,
        profile,
    } = props;
    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });

    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );
    const [tableData, setTableData] = useState([]);
    const [tableDataSub, setTableDataSub] = useState([]);

    const [defaultExpand, setDefaultExpand] = useState([]);

    const [filters, onFilter] = useFilterHandle(
        {
            years: [new Date()],
            groupByPeriod: 'year',
            groupBy: 'employee',
            page: currentPage,
            limit: pageSize,
            isDeleted: params.isDeleted ? params.isDeleted : 0,
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : businessUnits?.length === 1
                ? businessUnits[0]?.id !== null
                    ? [businessUnits[0]?.id]
                    : undefined
                : undefined,
        },
        ({ filters }) => {
            const query = filterQueryResolver({
                ...filters,
                years: filters.years?.map(item => item.getFullYear()),
            });
            if (typeof filters['history'] == 'undefined') {
                history.push({
                    search: query,
                });
            }
            fetchSalesReports(filters.type, filters);
            fetchSalaryByYear({
                filters: {
                    ...filters,
                    years: filters.years?.map(item => item.getFullYear()),
                },
                onSuccessCallback: response => {
                    setTableData(
                        response?.data.map(item =>
                            item.id ? { ...item, children: [] } : item
                        )
                    );
                },
            });
        }
    );

    const collapseRowClick = id => {
        // eslint-disable-next-line no-unused-expressions
        if (filters.groupBy === 'employee') {
            fetchSalaryByYear({
                filters: {
                    employee: id,
                    years: filters.years?.map(item => item.getFullYear()),
                    groupByPeriod: 'year',
                    groupBy: 'employee',
                    limit: 10000,
                    businessUnitIds: filters.businessUnitIds,
                    includeProductionExpense: filters.includeProductionExpense
                        ? filters.includeProductionExpense
                        : undefined,
                },
                onSuccessCallback: response => {
                    setTableDataSub(
                        tableData.map(item =>
                            item.id === id
                                ? { ...item, children: response.data }
                                : item
                        )
                    );
                },
            });
        } else if (filters.groupBy === 'occupation') {
            fetchSalaryByYear({
                filters: {
                    occupation: id,
                    years: filters.years?.map(item => item.getFullYear()),
                    groupByPeriod: 'year',
                    groupBy: 'occupation',
                    limit: 10000,
                    businessUnitIds: filters.businessUnitIds,
                    includeProductionExpense: filters.includeProductionExpense
                        ? filters.includeProductionExpense
                        : undefined,
                },
                onSuccessCallback: response => {
                    setTableDataSub(
                        tableData.map(item =>
                            item.id === id
                                ? { ...item, children: response.data }
                                : item
                        )
                    );
                },
            });
        } else if (filters.groupBy === 'structure') {
            fetchSalaryByYear({
                filters: {
                    structure: id,
                    years: filters.years?.map(item => item.getFullYear()),
                    groupByPeriod: 'quarter',
                    groupBy: 'structure',
                    limit: 10000,
                    businessUnitIds: filters.businessUnitIds,
                    includeProductionExpense: filters.includeProductionExpense
                        ? filters.includeProductionExpense
                        : undefined,
                },
                onSuccessCallback: response => {
                    setTableDataSub(
                        tableData.map(item =>
                            item.id === id
                                ? { ...item, children: response.data }
                                : item
                        )
                    );
                },
            });
        }
    };

    const collapseClick = row => {
        const { id } = row;
        if (id) {
            collapseRowClick(id);
        }
    };

    useEffect(() => {
        fetchMainCurrency();
        fetchBusinessUnitList({
            filters: {
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
        });
    }, []);

    return (
        <>
            <Sidebar
                onFilter={onFilter}
                filters={filters}
                businessUnits={businessUnits}
                setDefaultExpand={setDefaultExpand}
                setTableDataSub={setTableDataSub}
                profile={profile}
            />
            <section
                id="container-area"
                className="aside scrollbar"
                style={{
                    paddingBottom: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: 24,
                    paddingRight: 32,
                    paddingLeft: 32,
                }}
            >
                <Navigation />
                <Table
                    defaultExpand={defaultExpand}
                    setDefaultExpand={setDefaultExpand}
                    tableData={tableData}
                    tableDataSub={tableDataSub}
                    filters={filters}
                    collapseClick={collapseClick}
                />
            </section>
        </>
    );
};

const mapStateToProps = state => ({
    mainCurrency: state.kassaReducer.mainCurrency,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
});

export const Year = connect(
    mapStateToProps,
    {
        fetchSalaryByYear,
        fetchMainCurrency,
        fetchBusinessUnitList,
    }
)(YearSalary);
