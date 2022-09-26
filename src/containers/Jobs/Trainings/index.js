import React from 'react';
import { Row, Col } from 'antd';
import { ProFilterButton } from 'components/Lib';

// // main components
import TrainingsTable from './TrainingsTable';
import Sidebar from './Sidebar';
// // context
import {
  TrainingsFiltersContextProvider,
  useTrainingsFilters,
} from './Sidebar/FiltersContext';

import styles from './trainings.module.scss';

const MainFilterButtons = () => {
  const { filters, onFilter } = useTrainingsFilters();

  const { status } = filters;

  return (
    <div className={styles.buttonsBox}>
      <div>
        <ProFilterButton
          active={status === 3}
          //   count={waiting}
          onClick={() => onFilter('status', 3)}
        >
          Gözləmədə
        </ProFilterButton>

        <ProFilterButton
          active={status === 1}
          //   count={active}
          onClick={() => onFilter('status', 1)}
        >
          Açıq
        </ProFilterButton>

        <ProFilterButton
          active={status === 2}
          //   count={disabled}
          onClick={() => onFilter('status', 2)}
        >
          Bağlı
        </ProFilterButton>
      </div>
    </div>
  );
};

function Trainings() {
  return (
    <TrainingsFiltersContextProvider>
      <Sidebar />
      <section className="aside scrollbar" id="Trainingscontainer-area">
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
              <TrainingsTable />
            </Col>
          </Row>
        </div>
      </section>
    </TrainingsFiltersContextProvider>
  );
}

export default Trainings;
