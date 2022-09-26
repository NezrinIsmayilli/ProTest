import React from 'react';
import { Affix, Tabs as AntdTabs } from 'antd';
import TabsWrapper from '../../Shared/TabsWrapper';

// Announcment tabs
import AnnouncementDetailsTab from './AnnouncementDetailsTab';
import PersonTabApplicantsFavorites from './PersonDetailsTab';

const { TabPane } = AntdTabs;

export default function Tabs(props) {
  const { openInterviewCalendar } = props;
  return (
    <Affix
      offsetTop={10}
      target={() => document.getElementById('announcementsArea')}
    >
      <div
        className="infoContainer"
        id="appealsCalendar"
        style={{ overflow: 'hidden' }}
      >
        <TabsWrapper>
          <TabPane tab="Elan" key="1">
            <AnnouncementDetailsTab
              openInterviewCalendar={openInterviewCalendar}
            />
          </TabPane>
          <TabPane tab="Namizəd" key="2">
            <PersonTabApplicantsFavorites />
          </TabPane>
        </TabsWrapper>
        {/* <InterviewCalendar
      {...{ isInterviewCalendarOpen, closeInterviewCalendar }}
    /> */}
      </div>
    </Affix>
  );
}
