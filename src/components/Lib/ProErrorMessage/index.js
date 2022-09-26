import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

export const ProErrorMessage = ({ errors, inputName }) => {
  const error = errors[inputName];

  const message = error && error.message ? error.message : error;

  return (
    <span className={styles.helpBlock} style={{ opacity: error ? 1 : 0 }}>
      {message}
    </span>
  );
};

ProErrorMessage.propTypes = {
  errors: PropTypes.object.isRequired,
  inputName: PropTypes.string.isRequired,
};
