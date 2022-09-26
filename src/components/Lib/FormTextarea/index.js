import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

export const FormTextarea = forwardRef((props, ref) => {
  const { label, succes, message, ...rest } = props;

  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>
        {label && <div className={styles.labelText}>{label}</div>}
        <div className={styles.wrap}>
          <textarea
            ref={ref}
            className={`${styles.input} ${message ? styles.error : ''} ${
              succes ? styles.succes : ''
            }`}
            {...rest}
          />
        </div>
      </label>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';

FormTextarea.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  message: PropTypes.string,
  succes: PropTypes.bool,
};

FormTextarea.defaultProps = {
  type: 'text',
};
