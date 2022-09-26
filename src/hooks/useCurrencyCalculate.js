/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchCurrencies } from 'store/actions/settings/kassa';

/**
 * main currency
 * data
 * active cuurencies rate
 *
 */

const getAllCurrencies = createSelector(
  state => state.kassaReducer.currencies,
  currencies => currencies
);

const getAllActiveFormattedCurrencies = createSelector(
  state => state.kassaReducer.currencies,
  currencies =>
    currencies.reduce((acc, item) => {
      acc[item.code] = item.rate;
      return acc;
    }, {})
);

export const getMainCurrencyCode = createSelector(
  getAllCurrencies,
  allCurrencies => allCurrencies.find(item => item.isMain)
);

const getCurrencyCode = id =>
  createSelector(
    getAllCurrencies,
    allCurrencies => allCurrencies.find(item => item.id === id)
  );

// amount = 100;
// rateDollar = 1.7;
// rateEuro = 2;
// rateManat = 1;

export function calculateOverAll(
  items,
  key = 'amount',
  currencies,
  currencyKey = 'currencyId'
) {
  const result = items.reduce((sum, item) => {
    const itemAmount = item[key] || 0;

    if (key === 'amount') {
      const itemCurrencyRate = currencies[item.currencyCode] || 1;

      sum += Number(itemAmount) * Number(itemCurrencyRate);
      return sum;
    }
    const itemCurrencyId = item[currencyKey];

    const itemCurrency = currencies.find(
      currency => currency.id === itemCurrencyId
    );

    const itemCurrencyRate = (itemCurrency && itemCurrency.rate) || 1;

    sum += Number(itemAmount) * Number(itemCurrencyRate);
    return sum;
  }, 0);

  return result.toFixed(2);
}

export function useCurrencyCalculate(items, key, currencyKey) {
  const dispatch = useDispatch();

  const activeCurrencies = useSelector(getAllCurrencies);

  const allActiveFormattedCurrencies = useSelector(
    getAllActiveFormattedCurrencies
  );

  const mainCurrencyCode = useSelector(getMainCurrencyCode);

  useEffect(() => {
    if (activeCurrencies.length === 0) {
      dispatch(fetchCurrencies());
    }
  }, [activeCurrencies.length, dispatch]);

  const overAll = useMemo(
    () =>
      calculateOverAll(
        items,
        key,
        key ? activeCurrencies : allActiveFormattedCurrencies,
        currencyKey
      ),
    [items, allActiveFormattedCurrencies, mainCurrencyCode]
  );

  return `${overAll} ${mainCurrencyCode ? mainCurrencyCode.code : ''}`;
}

export function calculateAndConvert(
  amount,
  rate,
  willConvertCurrencyId,
  currencies,
  turn
) {
  const willConvertCurrency = currencies.find(
    currency => currency.id === willConvertCurrencyId
  );

  const willConvertCurrencyRate =
    (willConvertCurrency && willConvertCurrency.rate) || 1;

  return (
    +amount *
    (turn
      ? parseFloat(willConvertCurrencyRate) / parseFloat(rate)
      : parseFloat(rate) / parseFloat(willConvertCurrencyRate))
  );
}

export function useCurrencyConverter(
  amount,
  rate,
  willConvertCurrencyId,
  turn
) {
  const dispatch = useDispatch();

  const activeCurrencies = useSelector(getAllCurrencies);

  const currencyCode = useSelector(() =>
    getCurrencyCode(willConvertCurrencyId)
  );

  useEffect(() => {
    if (activeCurrencies.length === 0) {
      dispatch(fetchCurrencies());
    }
  }, [activeCurrencies.length, dispatch]);

  const overAll = useMemo(
    () =>
      calculateAndConvert(
        amount,
        rate,
        willConvertCurrencyId,
        activeCurrencies,
        turn
      ),
    [amount, activeCurrencies.length, currencyCode]
  );

  return overAll;
}
