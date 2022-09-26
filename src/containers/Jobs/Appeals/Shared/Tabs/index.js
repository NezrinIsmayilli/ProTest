import React from 'react';
import { connect } from 'react-redux';
import { Tabs, Spin } from 'antd';

// tab components
import DetailsTab from './DetailsTab';
import OriginTab from './OriginTab';
import HistoryTab from './HistoryTab';

import TabsWrapper from '../../../Shared/TabsWrapper';

const { TabPane } = Tabs;

// tabs container
function SharedTabs(props) {
  const {
    type,
    openInterviewCalendar = () => {},
    openInterviewRejectDrawer = () => {},
    openInterviewResultDrawer = () => {},
    interviewLoading,
  } = props;

  return (
    <Spin spinning={interviewLoading}>
      <TabsWrapper>
        <TabPane tab="Ətraflı" key="1">
          <DetailsTab
            {...{
              openInterviewCalendar,
              openInterviewRejectDrawer,
              openInterviewResultDrawer,
              type,
            }}
          />
        </TabPane>

        <TabPane tab="Mənbə" key="2">
          <OriginTab />
        </TabPane>

        <TabPane tab="Tarİxcə" key="3">
          <HistoryTab />
        </TabPane>
      </TabsWrapper>
    </Spin>
  );
}

const mapStateToProps = state => ({
  selectedVacancy: state.vacanciesReducer.selectedVacancy,
  vacancy: state.vacanciesReducer.vacancy,
  vacancyLoading: !!state.loadings.fetchVacancyById,
  interviewLoading: !!state.loadings.fetchInterviewById,
});

export default connect(
  mapStateToProps,
  {
    // fetchVacancyById,
    // setSelectedVacancy,
  }
)(SharedTabs);
