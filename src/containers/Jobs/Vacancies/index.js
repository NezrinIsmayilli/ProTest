import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Row, Col } from 'antd';
import { ProFilterButton } from 'components/Lib';

// import JobsPermissionControl from 'containers/Jobs/Shared/JobsPermissionControl';

// actions
import { fetchVacancyCounts } from 'store/actions/jobs/vacancies';

// main components
import VacanciesTable from './VacanciesTable';
import Sidebar from './Sidebar';
// import VacanciesDetails from './VacanciesDetails';
// context
import {
  VacanciesFiltersContextProvider,
  useVacanciesFilters,
} from './Sidebar/FiltersContext';

import styles from './vacancies.module.scss';

const getVacancyCounts = createSelector(
  state => state.vacancyCountsReducer,
  vacancyCountsReducer => vacancyCountsReducer.counts
);

const MainFilterButtons = () => {
  const { filters, onFilter } = useVacanciesFilters();

  const { status } = filters;

  const dispatch = useDispatch();
  const { waiting = 0, active = 0, disabled = 0 } = useSelector(
    getVacancyCounts
  );

  useEffect(() => {
    dispatch(fetchVacancyCounts());
  }, [dispatch]);

  return (
    <div className={styles.buttonsBox}>
      <div>
        <ProFilterButton
          active={status === 3}
          count={waiting}
          onClick={() => onFilter('status', 3)}
        >
          Gözləmədə
        </ProFilterButton>

        <ProFilterButton
          active={status === 1}
          count={active}
          onClick={() => onFilter('status', 1)}
        >
          Açıq
        </ProFilterButton>

        <ProFilterButton
          active={status === 2}
          count={disabled}
          onClick={() => onFilter('status', 2)}
        >
          Bağlı
        </ProFilterButton>
      </div>
    </div>
  );
};

function Vacancies() {
  return (
    <VacanciesFiltersContextProvider>
      <Sidebar />
      <section className="aside scrollbar" id="vacanciescontainer-area">
        <div className="container">
          <div className={styles.rowBox}>
            <Row gutter={32} type="flex" align="middle">
              <Col span={18}>
                <MainFilterButtons />
              </Col>
            </Row>
          </div>

          <Row gutter={16}>
            {/* Table */}
            <Col xl={18} xxl={24} className="paddingBottom70">
              <VacanciesTable />
            </Col>
            {/* right side info box */}
            {/* <Col xl={8} xxl={6} style={{ maxWidth: 350 }}>
              <VacanciesDetails />
            </Col> */}
          </Row>

          {/* create-vacancy + button */}
          {/* <JobsPermissionControl>
            <Link to="/recruitment/vacancies/create" className={styles.fabWrap}>
              <Button
                type="primary"
                shape="circle"
                icon="plus"
                size="large"
                className={styles.fabButton}
              />
            </Link>
          </JobsPermissionControl> */}
        </div>
      </section>
    </VacanciesFiltersContextProvider>
  );
}

export default Vacancies;
