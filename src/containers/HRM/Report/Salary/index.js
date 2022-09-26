/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';

import { connect } from 'react-redux';
import { fetchFilteredReports } from 'store/actions/hrm/report';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { useFilterHandle } from 'hooks';
import moment from 'moment';
import { today, dateFormat } from 'utils';
import { NavigationButtons } from '../#shared';
import Sidebar from './Sidebar';
import SalaryTable from './SalaryTable';

function Salary(props) {
  const {
    fetchFilteredReports,
    fetchMainCurrency,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;
  const [selectedYearandMonth, setselectedYearandMonth] = useState({
    selectedYear: Number(moment(today, dateFormat).format('YYYY')),
    selectedMonth: Number(moment(today, dateFormat).format('M')),
  });
  const [filters, onFilter] = useFilterHandle(
    {
      name: undefined,
      structures: [],
      occupations: [],
      hireMinDate: undefined,
      hireMaxDate: undefined,
      employmentTypes: [],
      salaryMin: undefined,
      salaryMax: undefined,
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
      orderBy: undefined,
      order: undefined,
    },
    ({ filters }) =>
      selectedYearandMonth.selectedYear
        ? fetchFilteredReports(
            selectedYearandMonth.selectedYear,
            selectedYearandMonth.selectedMonth,
            { filters }
          )
        : null
  );
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
    <section>
      <Sidebar
        filters={filters}
        onFilter={onFilter}
        selectedYearandMonth={selectedYearandMonth}
        setselectedYearandMonth={setselectedYearandMonth}
        businessUnits={businessUnits}
        profile={profile}
      />
      <section className="scrollbar aside">
        <div className="container">
          <NavigationButtons />

          <SalaryTable
            selectedYearandMonth={selectedYearandMonth}
            setselectedYearandMonth={setselectedYearandMonth}
            filters={filters}
            onFilter={onFilter}
          />
        </div>
      </section>
    </section>
  );
}
const mapStateToProps = state => ({
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
  mapStateToProps,
  {
    fetchFilteredReports,
    fetchMainCurrency,
    fetchBusinessUnitList,
  }
)(Salary);
