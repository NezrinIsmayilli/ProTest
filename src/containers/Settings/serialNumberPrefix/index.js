import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';
import { fetchSerialNumberPrefixes } from 'store/actions/settings/serialNumberPrefix';
import Prefixes from './prefixes';
import Forms from './forms';

function SerialNumberPrefix(props) {
  const { fetchSerialNumberPrefixes, serialNumberPrefixesCount } = props;
  const history = useHistory();
  const { location } = history;

  useEffect(() => {
    if (serialNumberPrefixesCount === 0) {
      fetchSerialNumberPrefixes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <SettingsCollapse
        defaultActiveKey={location?.from === 'document' ? ['2'] : ['1']}
      >
        <SettingsPanel header={<CustomHeader title="Prefikslər" />} key="1">
          <Prefixes />
        </SettingsPanel>
        <SettingsPanel header={<CustomHeader title="Formalar" />} key="2">
          <Forms />
        </SettingsPanel>
      </SettingsCollapse>
    </div>
  );
}

const getSerialNumberPrefixLength = createSelector(
  state => state.serialNumberPrefixReducer.serialNumberPrefixes,
  serialNumberPrefixesCount => serialNumberPrefixesCount.length
);

const mapStateToProps = state => ({
  serialNumberPrefixesCount: getSerialNumberPrefixLength(state),
});

export default connect(
  mapStateToProps,
  {
    fetchSerialNumberPrefixes,
  }
)(SerialNumberPrefix);
