/*
 *  input validation helpers
 */

// email validation
export const checkEmailisValid = value =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/g.test(value);

// max & min length check
export const checkLengthisValid = (value, min = 6, max = 250) =>
  value.length >= min && value.length <= max;

// space check helper
export const checkSpaceinValue = value => /\s/g.test(value);

// check start with space ex.: "__some word"
export const checkStartWithSpace = value => /^\s+/g.test(value);

export const checkDateIsValid = value =>
  /^[0-3]?[0-9]\/[01]?[0-9]\/[12][90][0-9][0-9]$/.test(value);

// max 8 caracters, max one dot, max 2 float section are allowed for price inputs
export const checkPriceAmountIsValid = value =>
  /^(\d){0,6}(\.){0,1}?(\d){0,2}$/.test(value);

export const checkValueIsOnlyCharacters = value =>
  /^[A-Za-züöıəöğşçiZÜÖIƏÖĞŞÇİ]+$/.test(value);

export const checkValueIsOnlyNumbers = value => {
  if (value === 'Backspace' || value === '.') {
    return true;
  }
  return /^[0-9]{1,9}\.?$/.test(value);
};

export const isValidNumber = value => {
  const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
  if (
    (!Number.isNaN(value) && reg.test(value)) ||
    value === '' ||
    value === '-'
  ) {
    return true;
  }
  return false;
};
