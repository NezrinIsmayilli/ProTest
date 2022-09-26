import React from 'react';
import { Link } from 'react-router-dom';

export function CustomLink({ to, children, ...rest }) {
  if (/^https?:\/\//.test(to))
    return (
      <a href={to} {...rest}>
        {children}
      </a>
    );

  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}
