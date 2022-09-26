import React, { useState } from 'react';
import { Input } from 'antd';
import { FaSave, FaPen } from 'react-icons/all';
import { formatNumberToLocale, defaultNumberFormat, re_amount } from 'utils';

export default function EditableInput({
  row,
  value = null,
  type,
  saveClick,
  ...rest
}) {
  const [inputValue, setInputValue] = useState();
  const [isEditible, setIsEditible] = useState(false);
  console.log(row);
  const handleInputChange = event => {
    if (
      re_amount.test(event.target.value) &&
      Number(event.target.value) <= 10000
    ) {
      setInputValue(event.target.value);
    }
    if (event.target.value === '') setInputValue(null);
  };

  const handleSaveButton = (inputValue, type) => {
    saveClick(row, inputValue, type);
    setIsEditible(false);
    setInputValue();
  };
  return !isEditible ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {row
        ? type === 'quantity'
          ? formatNumberToLocale(defaultNumberFormat(row.quantity))
          : formatNumberToLocale(defaultNumberFormat(row.pricePerUnit))
        : 0}
      <FaPen
        style={{ width: '40%' }}
        size="16px"
        onClick={() => setIsEditible(true)}
      />
    </div>
  ) : (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Input
        type="number"
        style={{ width: '50%', fontSize: '14px' }}
        defaultValue={type === 'quantity' ? row.quantity : row.pricePerUnit}
        value={inputValue}
        onChange={handleInputChange}
        min={0}
        {...rest}
      />
      <FaSave
        style={{ width: '40%' }}
        size="16px"
        onClick={() => handleSaveButton(inputValue, type)}
      />
    </div>
  );
}
