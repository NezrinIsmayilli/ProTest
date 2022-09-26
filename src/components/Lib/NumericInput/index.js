import React, { forwardRef } from 'react';
import { Input } from 'antd';

export const NumericInput = forwardRef((props, ref) => {
  const { maxLength = 25, ...rest } = props;

  const onChange = e => {
    const { value } = e.target;
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if (
      (!Number.isNaN(value) && reg.test(value)) ||
      value === '' ||
      value === '-'
    ) {
      props.onChange(value);
    }
  };
  return (
    <Input {...rest} ref={ref} onChange={onChange} maxLength={maxLength} />
  );
});
