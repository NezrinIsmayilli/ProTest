import React, { useRef, useCallback } from 'react';
import { Row, Col } from 'antd';

import { NavigationButtons } from '../Shared';
import SettingsPanel from './SettingsPanel';
import ProductionCalendarSidebar from './Sidebar';
import OperationsBox from './OperationsBox';
import ProductionCalendar from './Calendar';
import NonWorkingDays from './NonWorkingDays';

import { calendarWrapper, row, maxWidth } from './styles.module.scss';

export default function ProductionCalendarMain() {
  const drawerRef = useRef(null);

  const openNonWorkingDaysDrawer = useCallback(
    () => drawerRef.current.openDrawer(),
    []
  );

  return (
    <section>
      <ProductionCalendarSidebar />

      <NonWorkingDays ref={drawerRef} />

      <section className="scrollbar aside" id="ProductionCalendarMainArea">
        <div className="container">
          <NavigationButtons />

          <SettingsPanel {...{ openNonWorkingDaysDrawer }} />

          <Row gutter={16} type="flex" className={row}>
            <Col span={17} className={calendarWrapper}>
              <ProductionCalendar />
            </Col>

            <Col span={7} className={maxWidth}>
              <OperationsBox />
            </Col>
          </Row>
        </div>
      </section>
    </section>
  );
}
