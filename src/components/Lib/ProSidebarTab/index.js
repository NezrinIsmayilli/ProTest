import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

export function ProSidebarTab({ time, address, name, selected, ...rest }) {
  return (
    <div className={`${styles.tab} ${selected && styles.selected}`} {...rest}>
      <time>{time}</time>
      <address>{address}</address>
      <p>{name}</p>
    </div>
  );
}

ProSidebarTab.displayName = 'ProSidebarTab';
ProSidebarTab.propTypes = {
  time: PropTypes.string,
  address: PropTypes.string,
  name: PropTypes.string,
  selected: PropTypes.bool,
};
