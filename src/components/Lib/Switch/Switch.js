import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import './style.css';

const Switch = forwardRef(function Switch(
    { value, label, getSwitchData },
    ref
) {
    const [state, setState] = useState(value);

    const onChange = e => {
        if (state === e.target.name) {
            setState('true');
        } else {
            setState(e.target.name);
        }
        getSwitchData(state);
    };

    return (
        <>
            <span>{label}</span>
            <label className="switch">
                <input
                    type="checkbox"
                    name={value}
                    checked={state === value}
                    {...{ onChange, ref }}
                />
                <span className="slider round"></span>
            </label>
        </>
    );
});

Switch.displayName = Switch;

Switch.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    getSwitchData: PropTypes.func,
};

export default Switch;
