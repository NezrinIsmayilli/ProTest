import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import MaskedInput from 'react-text-mask';
import { maskedInput, disable } from './maskedStyles.module.scss';

// mask types
const masks = {
  homePhoneMask: [
    '(',
    '+',
    /[0-9]/,
    /\d/,
    /\d/,
    ')',
    ' ',
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  mobilePhoneMask: [
    '(',
    '+',
    /[0-9]/,
    /\d/,
    /\d/,
    ')',
    ' ',
    /\d/,
    /\d/,
    ' ',
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
  ],
};

export const ProMaskedInput = forwardRef((props, ref) => {
  const { name, label, id, disabled, mask = 'homePhoneMask', ...rest } = props;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <MaskedInput
        className={`${maskedInput} ${disabled ? disable : ''} maskedInput`}
        name={name}
        mask={masks[mask]}
        ref={ref}
        autoComplete="off"
        // autoComplete="new-password" // new-lastname both didnt work
        {...rest}
        // showMask
      />
    </div>
  );
});

ProMaskedInput.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  id: PropTypes.string,
  mask: PropTypes.oneOf(['homePhoneMask', 'mobilePhoneMask']).isRequired,
};
