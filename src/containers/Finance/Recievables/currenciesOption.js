/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { useFilterHandle } from 'hooks';
import styles from './styles.module.scss';

function CurrenciesOption(props) {
  const {filters,setChangedCurrency, currency, setCurrency, fetchCurrencies, type } = props;

  const [currencies, setCurrencies] = useState([]);
  const [, onFilter] = useFilterHandle(
    {
      invoiceType: null,
      usedInInvoice: 1,
    },
    ({ filters }) => {
      if (filters.invoiceType)
        fetchCurrencies(filters, ({ data }) => {
          setCurrencies(data);
        });
    }
  );
  useEffect(() => {
    if (type === 'recievables') onFilter('invoiceType', [2, 4, 13]);
    else onFilter('invoiceType', [1, 3, 12]);
  }, []);

  useEffect(() => {
    if (currencies.length > 0 && !filters?.currencyId) {
      setCurrency(currencies[0].id);
    }
  }, [currencies]);
  const handleGetCurrency = value => {
    setCurrency(value);
    setChangedCurrency(value)
  };
  return (
    <div className={styles.currenciesOption}>
      {currencies.length > 1
        ? currencies.map(val => (
            <Button
              onClick={() => {
                handleGetCurrency(val.id)}}
              type={currency === val.id ? 'primary' : ''}
            >
              {val.code}
            </Button>
          ))
        : null}
    </div>
  );
}

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  {
    fetchCurrencies,
  }
)(CurrenciesOption);
