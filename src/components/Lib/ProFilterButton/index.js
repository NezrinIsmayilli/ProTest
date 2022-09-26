import React from 'react';
import PropTypes from 'prop-types';
import styles from './proFilter.module.scss';

export function ProFilterButton(props) {
  const { children, count = 0, active, ...rest } = props;

  return (
    <button
      type="button"
      {...rest}
      className={`${styles.button} ${active ? styles.active : ''}`}
    >
      {children}
      {count > 0 ? <span className={styles.buttonCounter}>{count}</span> : null}
    </button>
  );
}

ProFilterButton.propTypes = {
  children: PropTypes.any,
  active: PropTypes.bool,
  count: PropTypes.number,
};
