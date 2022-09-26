import React from 'react';
import PropTypes from 'prop-types';

import { messages } from 'utils';

import styles from './styles.module.scss';

const { notDefined } = messages;

export function InfoBoxItem({ label = '', text, children }) {
  return (
    <div className={styles.viewOption}>
      <div className={styles.label}>{label}</div>
      {typeof text !== 'function' && (
        <div className={styles.valueText}>
          {text === undefined || text === null || text === ''
            ? notDefined
            : text}
        </div>
      )}

      {typeof text === 'function' && <div>{text()}</div>}

      {children && <div>{children}</div>}
    </div>
  );
}

export function InfoBox({ title, children }) {
  return (
    <div className={styles.infoBox}>
      <div className={styles.content}>
        <div className={styles.header}>{title}</div>
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </div>
  );
}

InfoBox.propTypes = {
  title: PropTypes.string,
  children(props, propName, componentName) {
    const prop = props[propName];
    let error = null;
    React.Children.forEach(prop, function(child) {
      if (!child && child !== null && child !== undefined) {
        error = new Error(
          `${componentName} children should be of type InfoBoxItem.`
        );
      }
    });
    return error;
  },
};

InfoBoxItem.propTypes = {
  label: PropTypes.string,
  text: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.func,
  ]),
  children: PropTypes.any,
};

InfoBoxItem.defaultProps = {
  text: notDefined,
};
