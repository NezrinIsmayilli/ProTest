import React from 'react';
import { MdAddCircle, MdRemoveCircle } from 'react-icons/all';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';

export default function CollapseSecondary(props) {
  const { currency, value, collapse = false } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>
        {formatNumberToLocale(defaultNumberFormat(value || 0))} {currency}
      </span>
      {collapse ? (
        <MdRemoveCircle size={18} style={{ marginLeft: 6 }} />
      ) : (
        <MdAddCircle size={18} style={{ marginLeft: 6 }} />
      )}
    </div>
  );
}
