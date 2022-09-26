import React from 'react';
import { Button } from 'antd';

export default function LoadMoreButton({ onClick, canLoadMore }) {
  if (!canLoadMore) {
    return null;
  }

  return (
    <Button size="large" block onClick={onClick}>
      Daha Çox
    </Button>
  );
}
