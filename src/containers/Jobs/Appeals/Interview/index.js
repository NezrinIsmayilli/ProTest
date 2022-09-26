/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// actions
import { resetInterview } from 'store/actions/jobs/interview';
import { resetAppealsData } from 'store/actions/jobs/appeals';

// components
import { Row, Col, Affix } from 'antd';
import Tabs from '../Shared/Tabs';
import InterviewCalendar from '../Shared/InterviewCalendar';
import RejectReason from '../Shared/RejectReason';

import InterviewResult from './InterviewResult';
import Table from './Table';

const type = 'interview';

const tabsColStyle = {
  width: 350,
  marginLeft: 'auto',
};

export default function Interview() {
  const CalendarDrawer = useRef(null);
  const ResultDrawer = useRef(null);
  const RejectDrawer = useRef(null);

  const dispatch = useDispatch();

  function openInterviewCalendar() {
    CalendarDrawer.current.open();
  }

  function openInterviewResultDrawer() {
    ResultDrawer.current.open();
  }

  function openInterviewRejectDrawer() {
    RejectDrawer.current.open();
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
        <Table
          type={type}
          openInterviewResultDrawer={openInterviewResultDrawer}
        />
      </Col>
      {/* <Col span={8} style={tabsColStyle}>
        <Affix
          offsetTop={10}
          target={() => document.getElementById('appealsArea')}
        >
          <div
            className="infoContainer"
            id="appealsCalendar"
            style={{ overflow: 'hidden' }}
          >
            <Tabs
              {...{
                openInterviewCalendar,
                openInterviewRejectDrawer,
                openInterviewResultDrawer,
                type,
              }}
            />

         
            <InterviewCalendar
              type={type}
              wrappedComponentRef={CalendarDrawer}
            />
            <RejectReason type={type} ref={RejectDrawer} />
            <InterviewResult ref={ResultDrawer} />
          </div>
        </Affix>
      </Col> */}
    </Row>
  );
}
