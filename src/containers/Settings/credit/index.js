import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';
import { fetchCreditTypes } from 'store/actions/settings/credit';
import CreditTypes from './creditTypes';

function Credit(props) {
  const { fetchCreditTypes, creditTypes } = props;

  useEffect(() => {
    Promise.all([fetchCreditTypes()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <SettingsCollapse>
        <SettingsPanel
          header={
            <CustomHeader
              title={`Kredit növləri (${
                creditTypes?.length > 0 ? creditTypes.length + 1 : 1
              })`}
            />
          }
          key="1"
        >
          <CreditTypes />
        </SettingsPanel>
      </SettingsCollapse>
    </div>
  );
}

const mapStateToProps = state => ({
  creditTypes: state.creditReducer.creditTypes,
});

export default connect(
  mapStateToProps,
  {
    fetchCreditTypes,
  }
)(Credit);
