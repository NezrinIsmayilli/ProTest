/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { resetInterview } from 'store/actions/jobs/interview';
import { resetAppealsData } from 'store/actions/jobs/appeals';

// components
import { Row, Col, Affix } from 'antd';
import Table from './Table';
import Tabs from '../Shared/Tabs';

export default function Result() {
  const type = 'result';

  const dispatch = useDispatch();
  const CalendarDrawer = useRef(null);

  function openInterviewCalendar() {
    CalendarDrawer.current.open();
  }

  useEffect(
    () => () => {
      dispatch(resetInterview());
      dispatch(resetAppealsData());
    },
    []
  );
  return (
    <Row gutter={16} type="flex">
      <Col span={16} className="paddingBottom70" style={{ flex: 1 }}>
        <Table type={type} />
      </Col>
      {/* <Col span={8} style={{ width: 350, marginLeft: 'auto' }}>
        <Affix
          offsetTop={10}
          target={() => document.getElementById('appealsArea')}
        >
          <div
            className="infoContainer"
            id="appealsCalendar"
            style={{ overflow: 'hidden' }}
          >
            <Tabs openInterviewCalendar={openInterviewCalendar} type={type} />
          </div>
        </Affix>
      </Col> */}
    </Row>
  );
}
