import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CustomTag = ({ data = {}, tagStyle = {}, ...rest }) => {
  const { name = 'new', label = 'Yeni' } = data;
  return (
    <div className={`${styles.tag} ${styles[name]}`} style={tagStyle} {...rest}>
      {label}
    </div>
  );
};

CustomTag.propTypes = {
  data: PropTypes.object,
  tagStyle: PropTypes.object,
};

export default CustomTag;
