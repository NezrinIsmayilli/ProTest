/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// actions
import { resetInterview } from 'store/actions/jobs/interview';
import { resetAppealsData } from 'store/actions/jobs/appeals';

// components
import { Row, Col } from 'antd';
import Table from './Table';
import Tabs from './Tabs';
import InterviewCalendar from './InterviewCalendar';
import RejectReason from './RejectReason';

// Shared Appeals Container for new and waiting appeals
export default function SharedAppealsContainer(props) {
  const { type } = props;

  const CalendarDrawer = useRef(null);
  const RejectDrawer = useRef(null);

  const dispatch = useDispatch();

  function openInterviewCalendar() {
    CalendarDrawer.current.open();
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
      <Col xl={18} xxl={24} className="paddingBottom70">
        <Table type={type} />
      </Col>
      {/* <Col xl={9} xxl={6}>
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
                type,
              }}
            />
            <InterviewCalendar
              type={type}
              wrappedComponentRef={CalendarDrawer}
            />
            <RejectReason type={type} ref={RejectDrawer} />
          </div>
        </Affix>
      </Col> */}
    </Row>
  );
}
