/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { ExcelButton, Can, NewButton } from 'components/Lib';
import { Link } from 'react-router-dom';
import { exportFileDownloadHandle } from 'utils';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchFilteredWorkers } from 'store/actions/hrm/workers';
import { useFilterHandle } from 'hooks';
import { accessTypes, permissions } from 'config/permissions';
import { NavigationButtons } from '../Shared/NavigationButtons';
import WorkerSearchForm from '../Shared/SearchForm';
import WorkersTable from './WorkersTable';

import styles from './styles.module.scss';

function Workers(props) {
  const {
    isLoadingWorkersExport,
    fetchFilteredWorkers,
    exportFileDownloadHandle,
    workerRequestQuery,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;
  const [operationType, setOperationType] = useState(null);
  const [filters, onFilter] = useFilterHandle(
    {
      lastEmployeeActivityType: 1,
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
    ({ filters }) => fetchFilteredWorkers({ filters })
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
        workers
        filters={filters}
        onFilter={onFilter}
        businessUnits={businessUnits}
      />
      <section className="scrollbar aside" id="hrmArea">
        <div className="container">
          <div className={styles.rowBox}>
            <NavigationButtons />
            <Row gutter={32} type="flex" align="middle">
              <Col
                span={18}
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Can
                  I={accessTypes.manage}
                  a={permissions.hrm_working_employees}
                >
                  <ExcelButton
                    loading={isLoadingWorkersExport}
                    onClick={() =>
                      exportFileDownloadHandle(
                        'exportWorkersReport',
                        `/hrm/employees/export?${workerRequestQuery}`
                      )
                    }
                  />
                  <div
                    style={{
                      display: operationType ? 'none' : 'block',
                    }}
                  >
                    <Link to="/hrm/employees/workers/add">
                      <NewButton
                        label="Yeni əməkdaş"
                        style={{ marginLeft: '15px' }}
                      />
                    </Link>
                  </div>
                </Can>
              </Col>
            </Row>
          </div>

          <WorkersTable
            operationType={operationType}
            setOperationType={setOperationType}
          />
        </div>
      </section>
    </section>
  );
}

const mapStateToProps = state => ({
  isLoadingWorkersExport: !!state.loadings.exportWorkersReport,
  workerRequestQuery: state.workersReducer.workerRequestQuery,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
  mapStateToProps,
  {
    fetchFilteredWorkers,
    exportFileDownloadHandle,
    fetchBusinessUnitList,
  }
)(Workers);
