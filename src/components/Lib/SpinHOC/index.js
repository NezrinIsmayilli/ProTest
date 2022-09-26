import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';

function SpinWithoutConnect(props) {
  const { children, isLoading } = props;
  return (
    <Spin size="large" spinning={isLoading}>
      {children}
    </Spin>
  );
}

const mapStateToProps = state => ({
  isLoading: state.loadingReducer.isLoading,
});

export const SpinHOC = connect(mapStateToProps)(SpinWithoutConnect);
