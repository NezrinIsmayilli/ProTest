import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProJobsSelect, JobsSidebarItemWrapper } from 'components/Lib';

// actions
import { fetchCurrencies } from 'store/actions/jobs/parameters';

import { defaultFormItemSize } from 'utils';

function CurrencyFilter(props) {
  const {
    // currency,
    onFilter = () => {},
    // actions
    fetchCurrencies,
    // data
    currencies,
    currenciesLoading,
  } = props;

  useEffect(() => {
    if (!currencies.length) {
      fetchCurrencies();
    }
  }, [fetchCurrencies, currencies.length]);

  return (
    <JobsSidebarItemWrapper label="Valyuta">
      <ProJobsSelect
        allowClear
        mode="multiple"
        loading={currenciesLoading}
        disabled={currenciesLoading}
        // value={currency}
        onChange={value => onFilter('currency', value)}
        placeholder="Seçin"
        data={currencies}
        size={defaultFormItemSize}
      />
    </JobsSidebarItemWrapper>
  );
}

const mapStateToProps = state => ({
  currencies: state.parametersReducer.currencies,
  currenciesLoading: !!state.loadings.currencies,
});

export default connect(
  mapStateToProps,
  { fetchCurrencies }
)(CurrencyFilter);
