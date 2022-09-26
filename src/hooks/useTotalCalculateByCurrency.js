import { useMemo } from 'react';
import { toFixedNumber } from 'utils';

const groupByCurrencyCode = data => {
  const currencyCodes = {};

  for (const item of data) {
    const { currencyCode } = item;

    if (!currencyCodes[currencyCode]) {
      currencyCodes[currencyCode] = [];
    }

    currencyCodes[currencyCode].push(item.amount);
  }

  /**
   * generate object with currencyCode keys
   * currencyCodes = {
   *  AZN: [12, 3, ...],
   *  RUB: [6, 78, ...]
   *  ...
   * };
   */
  return currencyCodes;
};

const calculateTotal = currencyCodes => {
  const copyCurrencyCodes = {};

  Object.keys(currencyCodes).forEach(code => {
    const total = currencyCodes[code].reduce((a, b) => a + Number(b), 0);

    copyCurrencyCodes[code] = toFixedNumber(total).toLocaleString('en-EN');
  });

  /**
   * summate array items
   * copyCurrencyCodes = {
   *  AZN: 323,
   *  RUB: 454,
   *  ...
   * };
   */
  return copyCurrencyCodes;
};

function formatTotalTextByCurrency(currencies) {
  const formattedResult = [];

  Object.keys(currencies).forEach(currency => {
    const text = `${currencies[currency]} ${currency}`;
    formattedResult.push(text);
  });

  return formattedResult.join(', ');
}

export function useExcelTotalCalculateByCurrency(data = []) {
  const result = useMemo(() => {
    if (data.length!= 0) {
    const groupedByCurrencyCode = groupByCurrencyCode(data.filter(item=>item.currencyCode!=undefined));
    const result = calculateTotal(groupedByCurrencyCode);
    const formattedExcelResult = formatTotalTextByCurrency(result);

    return formattedExcelResult;}
  }, [data]);

  return result;
}

export function useTotalCalculateByCurrency(data = []) {
  const result = useMemo(() => {
    if (data.length === 0) {
      return 0;
    }

    const groupedByCurrencyCode = groupByCurrencyCode(data);
    const result = calculateTotal(groupedByCurrencyCode);
    const formattedResult = formatTotalTextByCurrency(result);

    return formattedResult;
  }, [data]);

  return result;
}
