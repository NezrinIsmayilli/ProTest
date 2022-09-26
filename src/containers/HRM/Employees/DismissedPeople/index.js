import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Col } from 'antd';
import { ExcelButton, Can } from 'components/Lib';
import { exportFileDownloadHandle } from 'utils';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchDismissedWorkers } from 'store/actions/hrm/workers';
import { useFilterHandle } from 'hooks';
import { accessTypes, permissions } from 'config/permissions';
import { NavigationButtons } from '../Shared/NavigationButtons';
import WorkerSearchForm from '../Shared/SearchForm';
import DismissedPeopleTable from './DismissedPeopleTable';
import styles from './styles.module.scss';

function DismissedPeople(props) {
  const {
    isLoadingDismissedPeopleExport,
    fetchDismissedWorkers,
    exportFileDownloadHandle,
    workerRequestQuery,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;

  const [filters, onFilter] = useFilterHandle(
    {
      isFired: 1,
      filterData: false,
      structureId: false,
      gender: false,
      occupationId: false,
      hireMinDate: undefined,
      hireMaxDate: undefined,
      isInBlackList: undefined,
      employmentType: false,
      minAge: undefined,
      maxAge: undefined,
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => fetchDismissedWorkers(filters)
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
      <WorkerSearchForm
        onFilter={onFilter}
        filters={filters}
        businessUnits={businessUnits}
      />
      <section className="scrollbar aside" id="hrmArea">
        <div className="container">
          <div className={styles.rowBox}>
            <NavigationButtons>
              <Col span={6} className={styles.txtRight}>
                <Can I={accessTypes.manage} a={permissions.hrm_fired_employees}>
                  <ExcelButton
                    loading={isLoadingDismissedPeopleExport}
                    onClick={() =>
                      exportFileDownloadHandle(
                        'exportDismissedPeopleReport',
                        `/hrm/employees/export?${workerRequestQuery}`
                      )
                    }
                  />
                </Can>
              </Col>
            </NavigationButtons>
          </div>
          <DismissedPeopleTable />
        </div>
      </section>
    </section>
  );
}

const mapStateToProps = state => ({
  isLoadingDismissedPeopleExport: !!state.loadings.exportDismissedPeopleReport,
  workerRequestQuery: state.workersReducer.workerRequestQuery,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
  mapStateToProps,
  {
    exportFileDownloadHandle,
    fetchDismissedWorkers,
    fetchBusinessUnitList,
  }
)(DismissedPeople);
