import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';
import { fetchSalesBuysForms } from 'store/actions/settings/serialNumberPrefix';
// shared components
import { SalesBuysForm } from './allForms/salesBuysForm';
import { ContractsForm } from './allForms/contractsForm';

function Forms(props) {
  const { fetchSalesBuysForms } = props;
  useEffect(() => {
    fetchSalesBuysForms();
  }, []);
  return (
    <div>
      <SettingsCollapse accordion={false}>
        <SettingsPanel header={<CustomHeader title="Ticarət (8)" />} key="1">
          <SalesBuysForm />
        </SettingsPanel>
        <SettingsPanel
          header={<CustomHeader title="Müqavilələr (1)" />}
          key="2"
        >
          <ContractsForm />
        </SettingsPanel>
      </SettingsCollapse>
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.serialNumberPrefixReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { fetchSalesBuysForms }
)(Forms);
