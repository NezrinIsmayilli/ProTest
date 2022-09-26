import React from 'react';
// import PropTypes from 'prop-types';

import styles from './styles.module.scss';

export function SubNavigation({ fullWidth = false, children }) {
  return (
    <ul
      className={`${styles.navHeader} ${fullWidth ? styles.fullWidth : null}`}
    >
      {children}
    </ul>
  );
}

// SubNavigation.propTypes = {};
