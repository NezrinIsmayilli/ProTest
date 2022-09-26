import React from 'react';
import PropTypes from 'prop-types';
import styles from './ButtonGreen.module.css';

export default function ButtonGreen({ title, onClick, icon, styleAddOns }) {
  return (
    <button
      className={styles.btn}
      style={styleAddOns}
      type="button"
      {...{ onClick }}
    >
      {icon}
      {title}
    </button>
  );
}

ButtonGreen.propTypes = {
  styleAddOns: PropTypes.object,
  icon: PropTypes.object,
  title: PropTypes.string,
  onClick: PropTypes.func,
};
