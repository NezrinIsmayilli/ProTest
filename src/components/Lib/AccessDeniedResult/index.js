import React from 'react';
import { Result } from 'antd';

// todo: add props
export function AccessDeniedResult() {
  return (
    <Result
      style={{ paddingTop: 230 }}
      status="403"
      title="403"
      subTitle="Üzr istəyirik, bu səhifəyə daxil olmaq icazəniz yoxdur."
    />
  );
}
