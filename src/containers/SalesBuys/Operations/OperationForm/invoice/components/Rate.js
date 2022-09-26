import React, { useState } from 'react';
import { Tooltip, Input, Button } from 'antd';
import { re_amount } from 'utils';

const RateInput = ({ value, type, updatePaymentDetails }) => {
  const [editable, setEditable] = useState(false);

  const handleRateChange = event => {
    if (re_amount.test(event.target.value) && event.target.value <= 1000) {
      updatePaymentDetails({ rate: event.target.value }, type);
    }
    if (event.target.value === '') {
      updatePaymentDetails({ rate: undefined }, type);
    }
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {editable ? (
        <Tooltip placement="topLeft" title="Tap enter to save or click away">
          <Input
            autoFocus
            onBlur={() => setEditable(false)}
            onChange={handleRateChange}
            value={value}
            onKeyDown={e => {
              if (e.keyCode === 13 || e.keyCode === 27) {
                setEditable(false);
              }
            }}
          />
        </Tooltip>
      ) : (
        <>
          {value || 1}
          <Button
            onClick={() => setEditable(true)}
            type="link"
            style={{ marginLeft: 6 }}
            icon="edit"
            shape="circle"
          />
        </>
      )}
    </div>
  );
};

export const Rate = RateInput;
