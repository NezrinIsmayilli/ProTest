import React from 'react';
import { Link } from 'react-router-dom';
export const ReturnButton = props => {
  const { path, label } = props;
  return (
    <Link to={path} style={{ fontSize: '12px', fontWeight: 500 }}>
      <img
        width={8}
        height={13}
        src="/img/icons/left-arrow.svg"
        alt="trash"
        style={{ marginRight: '12px' }}
      />
      {label}
    </Link>
  );
};
