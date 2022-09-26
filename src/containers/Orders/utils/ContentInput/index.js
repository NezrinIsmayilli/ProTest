import React, { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/all';
import { ProInput } from 'components/Lib';
import { ReactComponent as Pen } from 'assets/img/icons/order-pen.svg';
import { defaultNumberFormat, formatNumberToLocale, re_amount } from 'utils';

const ContentInput = ({
  row,
  value,
  saveClick,
  canEdit = true,
  type,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState(undefined);
  const [isEditible, setIsEditible] = useState(false);

  const handleInputChange = value => {
    if (re_amount.test(value) && Number(value) <= 100000) {
      setInputValue(value);
    }
    if (value === '') setInputValue(null);
  };

  const handleSaveButton = () => {
    saveClick(row, inputValue, type);
    setIsEditible(false);
    setInputValue(undefined);
  };

  useEffect(() => {
    setInputValue(Number(value));
  }, [value]);
  return !isEditible ? (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: type === 'quantity' ? 'flex-start' : 'flex-end',
        width: '100%',
      }}
    >
      {formatNumberToLocale(defaultNumberFormat(value || 0))}
      {canEdit && (
        <Pen
          fill="#464A4B"
          style={{ marginLeft: '10px', cursor: 'pointer' }}
          size="16px"
          onClick={() => setIsEditible(true)}
        />
      )}
    </div>
  ) : (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
      }}
    >
      <ProInput
        value={inputValue}
        onChange={event => handleInputChange(event.target.value)}
        size="small"
        {...rest}
      />
      <FaSave
        style={{ marginLeft: '10px', cursor: 'pointer' }}
        size="16px"
        onClick={handleSaveButton}
      />
    </div>
  );
};

export default ContentInput;
