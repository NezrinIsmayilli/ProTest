import React, { useRef } from 'react';
import { Row, Col } from 'antd';

// context
import { FiltersContextProvider } from './FiltersContext';

// main components
import Sidebar from './Sidebar';
import Table from './Table';
import Tabs from './Tabs';
import InterviewCalendar from './InterviewCalendar';

const tabsColStyle = {
  width: 350,
  marginLeft: 'auto',
};

// Announcments / Bookmarked Announcments
export default function Announcements(props) {
  const { bookmarked } = props;

  const CalendarDrawer = useRef(null);

  function openInterviewCalendar() {
    CalendarDrawer.current.open();
  }

  return (
    <FiltersContextProvider bookmarked={bookmarked}>
      <Sidebar title={bookmarked ? 'Seçilmiş elanlar' : 'İş axtaranlar'} />

      <section className="scrollbar aside" id="announcementsArea">
        <div className="container">
          <Row gutter={16} type="flex">
            <Col span={16} className="paddingBottom70" style={{ flex: 1 }}>
              <Table />
            </Col>
            {/* <Col span={8} style={tabsColStyle}>
              <Tabs openInterviewCalendar={openInterviewCalendar} />
              <InterviewCalendar wrappedComponentRef={CalendarDrawer} />
            </Col> */}
          </Row>
        </div>
      </section>
    </FiltersContextProvider>
  );
}
