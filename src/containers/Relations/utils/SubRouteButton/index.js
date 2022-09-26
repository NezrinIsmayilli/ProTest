import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './styles.module.scss'

const SubRouteButton = ({ path, children, liStyle={}, ...rest }) => {
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

export default SubRouteButton;
