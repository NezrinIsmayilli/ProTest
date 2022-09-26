import React from 'react';
import './style.css';

export const RoundCheckbox = () => {
  return (
    <div className="round">
      <input type="checkbox" id="checkbox" />
      <label htmlFor="checkbox"></label>
    </div>
  );
};
