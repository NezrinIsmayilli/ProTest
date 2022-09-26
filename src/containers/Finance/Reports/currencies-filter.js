/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Spin } from 'antd';
import { fetchReportCurrencies } from 'store/actions/finance/reports';
import styles from './styles.module.scss';

function CurrenciesOption(props) {
  const {
    type = 'advance',
    currency,
    currencies,
    currenciesLoading,
    setCurrency,
    fetchReportCurrencies,
  } = props;

  useEffect(() => {
    if (currencies?.length > 0) {
      setCurrency(currencies[0]);
    } else {
      setCurrency(undefined);
    }
  }, [currencies]);

  useEffect(() => {
    fetchReportCurrencies({
      type,
    });
  }, []);

  const handleGetCurrency = value => {
    const selectedCurrency = currencies?.find(({ id }) => value === id);
    setCurrency(selectedCurrency);
  };
  return (
    <div className={styles.currenciesOption}>
      <Spin spinning={currenciesLoading}>
        {currencies.length > 1
          ? currencies?.map(val => (
              <Button
                onClick={() => handleGetCurrency(val.id)}
                type={currency?.id === val.id ? 'primary' : ''}
              >
                {val.code}
              </Button>
            ))
          : null}
      </Spin>
    </div>
  );
}

const mapStateToProps = state => ({
  currencies: state.financeReportsReducer.currencies,
  currenciesLoading: state.loadings.fetchReportCurrencies,
});

export default connect(
  mapStateToProps,
  {
    fetchReportCurrencies,
  }
)(CurrenciesOption);
