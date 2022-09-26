/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchEmployeeActivities } from 'store/actions/employeeActivity/employeeActivity';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { useFilterHandle } from 'hooks';
// components
import Sidebar from './Sidebar';
import OperationsTable from './OperationsTable';

import { NavigationButtons } from '../Shared/NavigationButtons';

import styles from './styles.module.scss';

function Operations(props) {
  const {
    fetchEmployeeActivities,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;
  const initialFilters = {
    name: undefined,
    types: [],
    structureId: undefined,
    occupationId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  };
  const [filters, onFilter] = useFilterHandle(
    {
      initialFilters,
      orderBy: undefined,
      order: undefined,
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    fetchEmployeeActivities
  );
  useEffect(() => {
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
        initialFilters={initialFilters}
        filters={filters}
        onFilter={onFilter}
        businessUnits={businessUnits}
        profile={profile}
      />

      <section className="scrollbar aside" id="hrmArea">
        {/* operations filter */}
        <div className="container">
          <div className={styles.rowBox}>
            <NavigationButtons />
          </div>
          <OperationsTable filters={filters} onFilter={onFilter} />
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
    fetchEmployeeActivities,
    fetchBusinessUnitList,
  }
)(Operations);
