/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';

// actions
import {
  fetchVacationTypes,
  fetchBusinessTripReasons,
  fetchTimeOffReasons,
  fetchFireReasons,
} from 'store/actions/settings/hr';

// panels
import VacationTypes from './vacationTypes';
import BusinessTripReasons from './businessTripReasons';
import TimeOffReasons from './timeOffReasons';
import FireReasons from './fireReasons';

function HR(props) {
  const {
    fetchVacationTypes,
    fetchBusinessTripReasons,
    fetchTimeOffReasons,
    fetchFireReasons,
    vacationTypesCount,
    businessTripReasonsCount,
    timeOffReasonsCount,
    fireReasonsCount,
  } = props;

  useEffect(() => {
    Promise.all([
      fetchVacationTypes(),
      fetchBusinessTripReasons(),
      fetchTimeOffReasons(),
      fetchFireReasons(),
    ]);
  }, []);

  return (
    <div>
      <SettingsCollapse>
        <SettingsPanel
          header={
            <CustomHeader
              title={`Məzuniyyət növləri (${vacationTypesCount})`}
            />
          }
          key="1"
        >
          <VacationTypes />
        </SettingsPanel>
        <SettingsPanel
          header={
            <CustomHeader
              title={`Ezamiyyət səbəbləri (${businessTripReasonsCount})`}
            />
          }
          key="2"
        >
          <BusinessTripReasons />
        </SettingsPanel>
        <SettingsPanel
          header={
            <CustomHeader title={`İcazə səbəbləri (${timeOffReasonsCount})`} />
          }
          key="3"
        >
          <TimeOffReasons />
        </SettingsPanel>
        <SettingsPanel
          header={
            <CustomHeader title={`Xitam əsasları (${fireReasonsCount})`} />
          }
          key="4"
        >
          <FireReasons />
        </SettingsPanel>
      </SettingsCollapse>
    </div>
  );
}

const getVacationTypeLength = createSelector(
  state => state.hrReducer.vacationTypes,
  vacationTypesCount => vacationTypesCount.length
);

const getBusinessTripReasonsLength = createSelector(
  state => state.hrReducer.businessTripReasons,
  businessTripReasonsCount => businessTripReasonsCount.length
);

const getTimeOffReasonsLength = createSelector(
  state => state.hrReducer.timeOffReasons,
  timeOffReasonsCount => timeOffReasonsCount.length
);

const getFireReasonsLength = createSelector(
  state => state.hrReducer.fireReasons,
  fireReasonsCount => fireReasonsCount.length
);

const mapStateToProps = state => ({
  vacationTypesCount: getVacationTypeLength(state),
  businessTripReasonsCount: getBusinessTripReasonsLength(state),
  timeOffReasonsCount: getTimeOffReasonsLength(state),
  fireReasonsCount: getFireReasonsLength(state),
});

export default connect(
  mapStateToProps,
  {
    fetchVacationTypes,
    fetchBusinessTripReasons,
    fetchTimeOffReasons,
    fetchFireReasons,
  }
)(HR);
