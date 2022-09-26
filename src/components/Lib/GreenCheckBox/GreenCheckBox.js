import React, { useState, forwardRef } from 'react';
import './style.css';
import PropTypes from 'prop-types';

const GreenCheckBox = forwardRef(function GreenCheckBox(
  { value, label, getCheckBoxData },
  ref
) {
  const [state, setState] = useState(value);

  const onChange = e => {
    if (state === e.target.name) {
      setState('true');
    } else {
      setState(e.target.name);
    }
    getCheckBoxData(state);
  };

  return (
    <div className="checkbox checkbox-success">
      <input
        type="checkbox"
        name={value}
        checked={state === value}
        {...{ onChange, ref }}
      />
      <label>{label}</label>
    </div>
  );
});

GreenCheckBox.displayName = GreenCheckBox;

GreenCheckBox.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  getCheckBoxData: PropTypes.func,
};

export default GreenCheckBox;
