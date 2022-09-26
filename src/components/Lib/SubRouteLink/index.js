import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './styles.module.scss';

export function SubRouteLink({ path, children, liStyle = {}, ...rest }) {
  return (
    <li className={styles.item} style={liStyle}>
      <NavLink
        to={path}
        className={styles.link}
        activeClassName={styles.active}
        {...rest}
      >
        {children}
      </NavLink>
    </li>
  );
}

SubRouteLink.propTypes = {
  path: PropTypes.string.isRequired,
  children: PropTypes.string.isRequired,
};
