import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

export const FormInput = forwardRef((props, ref) => {
  const {
    label,
    required = false,
    succes,
    message,
    classNameWrapper = '',
    disabled = false,
    ...rest
  } = props;

  return (
    <div className={`${styles.inputWrapper} ${classNameWrapper}`}>
      <label className={styles.label}>
        {label && (
          <div
            className={`${styles.labelText} ${
              required ? styles.requiredStar : ''
            }`}
          >
            {label}
          </div>
        )}
        <div className={styles.wrap}>
          <input
            ref={ref}
            className={`${styles.input} ${message ? styles.error : ''} ${
              succes ? styles.succes : ''
            }`}
            disabled={disabled}
            style={
              disabled ? { background: ' #eee', cursor: 'not-allowed' } : {}
            }
            {...rest}
          />
        </div>
      </label>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
});

FormInput.displayName = 'FormInput';

FormInput.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  message: PropTypes.string,
  succes: PropTypes.bool,
  required: PropTypes.bool,
};

FormInput.defaultProps = {
  type: 'text',
};
