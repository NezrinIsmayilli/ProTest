/**
 * Routes Suspense FallBack Loading
 */
import React from 'react';
import { Spin } from 'antd';

const style = {
  position: 'fixed',
  zIndex: 999,
  top: '50%',
  left: '50%',
  transform: ' translate(-50%, -50%)',
};

export function Loading() {
  return <Spin spinning size="large" style={style} />;
}
