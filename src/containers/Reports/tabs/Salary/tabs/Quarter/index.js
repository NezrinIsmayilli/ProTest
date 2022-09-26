/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import { filterQueryResolver } from 'utils';
import { fetchSalesReports } from 'store/actions/reports/sales-report';
import { fetchSalaryByQuarter } from 'store/actions/reports/salary';
import Navigation from '../../Navigation';
import Table from './Table';
import Sidebar from './Sidebar';

const QuarterSalary = props => {
    const {
        fetchSalaryByQuarter,
        fetchMainCurrency,
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
            years: new Date(),
            groupByPeriod: 'quarter',
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
                years: [filters.years.getFullYear()],
            });
            if (typeof filters['history'] == 'undefined') {
                history.push({
                    search: query,
                });
            }
            fetchSalesReports(filters.type, filters);
            fetchSalaryByQuarter({
                filters: { ...filters, years: [filters.years.getFullYear()] },
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

    useEffect(() => {
        fetchMainCurrency();
    }, []);

    const collapseRowClick = id => {
        // eslint-disable-next-line no-unused-expressions
        if (filters.groupBy === 'employee') {
            fetchSalaryByQuarter({
                filters: {
                    employee: id,
                    years: [filters?.years.getFullYear()],
                    groupByPeriod: 'quarter',
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
            fetchSalaryByQuarter({
                filters: {
                    occupation: id,
                    years: [filters?.years.getFullYear()],
                    groupByPeriod: 'quarter',
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
            fetchSalaryByQuarter({
                filters: {
                    structure: id,
                    years: [filters?.years.getFullYear()],
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
                    filters={filters}
                    defaultExpand={defaultExpand}
                    setDefaultExpand={setDefaultExpand}
                    tableData={tableData}
                    tableDataSub={tableDataSub}
                    collapseClick={collapseClick}
                />
            </section>
        </>
    );
};

const mapStateToProps = state => ({
    mainCurrency: state.kassaReducer.mainCurrency,
    businessUnits: state.businessUnitReducer.businessUnits,
    profile: state.profileReducer.profile,
});

export const Quarter = connect(
    mapStateToProps,
    {
        fetchMainCurrency,
        fetchSalaryByQuarter,
    }
)(QuarterSalary);
