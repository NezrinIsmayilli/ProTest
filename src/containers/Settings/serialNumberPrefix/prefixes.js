import React from 'react';
import { connect } from 'react-redux';
import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';
import VacationSerialNumberPrefixes from './vacationSerialNumberPrefixes';
import BusinessTripSerialNumberPrefixes from './businessTripSerialNumberPrefixes';
import FireReasonSerialNumberPrefixes from './fireReasonSerialNumberPrefixes';
import TimeOffReasonSerialNumberPrefixes from './timeOffReasonSerialNumberPrefixes';

function Prefixes(props) {
  const {} = props;

  return (
    <SettingsCollapse>
      <SettingsPanel header={<CustomHeader title="Məzuniyyət" />} key="1">
        <VacationSerialNumberPrefixes />
      </SettingsPanel>
      <SettingsPanel header={<CustomHeader title="Ezamiyyət" />} key="2">
        <BusinessTripSerialNumberPrefixes />
      </SettingsPanel>
      <SettingsPanel header={<CustomHeader title="İcazə" />} key="3">
        <TimeOffReasonSerialNumberPrefixes />
      </SettingsPanel>
      <SettingsPanel header={<CustomHeader title="Xitam" />} key="4">
        <FireReasonSerialNumberPrefixes />
      </SettingsPanel>
    </SettingsCollapse>
  );
}

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {}
)(Prefixes);
