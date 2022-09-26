import React from 'react';
import { Row, Col } from 'antd';

// main components
import ExpenseReportTable from './ExpenseReportTable';
import ExpenseReportSidebar from './Sidebar';
import Details from './Details';

import styles from './styles.module.scss';

function ExpenseReport() {
  return (
    <>
      <ExpenseReportSidebar />
      <section
        id="container-area"
        className="aside scrollbar"
        style={{ paddingBottom: 100 }}
      >
        <Row>
          <Col span={16} className={styles.tableWrap}>
            <ExpenseReportTable />
          </Col>
          <Col span={8} style={{ maxWidth: 350 }}>
            <Details />
          </Col>
        </Row>
      </section>
    </>
  );
}

export default ExpenseReport;
