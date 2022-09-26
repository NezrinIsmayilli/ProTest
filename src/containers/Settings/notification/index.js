/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';

// actions
import { fetchNotifications } from 'store/actions/settings/notification';

// panels
import Telegram from './telegram';

function Notification(props) {
  const { fetchNotifications } = props;

  useEffect(() => {
    Promise.all([fetchNotifications()]);
  }, []);

  return (
    <div>
      <SettingsCollapse>
        <SettingsPanel header={<CustomHeader title="Telegram" />} key="1">
          <Telegram />
        </SettingsPanel>
      </SettingsCollapse>
    </div>
  );
}

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {
    fetchNotifications,
  }
)(Notification);
