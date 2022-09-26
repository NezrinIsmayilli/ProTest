const roundTo = require('round-to');
const commaNumber = require('comma-number');

// Get Number with comma
export const formatNumberToLocale = number => commaNumber(number);

// Check leading zeroes
export const defaultNumberFormat = number => {
  if (roundTo.down(Number(number), 1) === Number(number)) {
    return roundTo.down(Number(number), 2).toFixed(2);
  }
  return roundToDown(number);
};

export const roundToDown = number => roundTo.down(Number(number), 4);
export const roundToUp = number => roundTo.up(Number(number), 4);
export const round = number => roundTo.up(Number(number), 2);
export const getPriceValue = number => roundTo(Number(number), 4);

export const customRound = (amount, rate = 1, floatPoint = 4) =>
  roundTo.down(Number(rate) * Number(amount), floatPoint) <
  Number(rate) * Number(amount)
    ? roundTo.down(Number(rate) * Number(amount) + 0.01, floatPoint)
    : roundToDown(Number(rate) * Number(amount));

export const getDifference = (debt, amount, rate) =>
  (Number(amount) * 10000 - (Number(debt) / Number(rate)) * 10000) / 10000;
