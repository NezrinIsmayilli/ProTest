import React, { Component } from 'react';
import { Result, Button } from 'antd';

const centerStyle = {
  position: 'fixed',
  top: '50%',
  left: ' 50%',
  transform: ' translate(-50%,-50%)',
};

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;

    const { children } = this.props;

    if (hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="Please reload page"
          style={centerStyle}
          extra={
            <Button onClick={() => window.location.reload()}>Reload</Button>
          }
        />
      );
    }

    return children;
  }
}
