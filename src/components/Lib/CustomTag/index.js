import React from 'react';
import styles from './styles.module.scss';

export const CustomTag = ({ label, tagStyle, ...rest }) => {
  let style = {};

  // eslint-disable-next-line default-case
  switch (label) {
    case 'Delivery':
      break;
    case 'New':
      break;
    case 'Approved':
      style = { backgroundColor: '#EAF3FB', color: '#4E9CDF' };
      break;
    case 'active':
      style = { backgroundColor: '#FDF7EA', color: '#F3B753' };
      break;
    case 'Aktiv':
      style = { backgroundColor: '#FDF7EA', color: '#F3B753' };
      break;
    case 'In progress':
      style = { backgroundColor: '#FDF7EA', color: '#F3B753' };
      break;
    case 'deactive':
      style = { backgroundColor: '#FFEEED', color: '#FF716A' };
      break;
    case 'Passiv':
      style = { backgroundColor: '#FFEEED', color: '#FF716A' };
      break;
    case 'Reject':
      style = { backgroundColor: '#FFEEED', color: '#FF716A' };
      break;
    case 'Done':
      style = { backgroundColor: '#EBF5F0', color: '#55AB80' };
      break;
    case 'Draft':
      style = { backgroundColor: '#F6EEFC', color: '#B16FE4' };
      break;
    case 'Ödənilib':
      style = { backgroundColor: '#EBF5F0', color: '#55AB80' };

      break;
    case 'Qismən ödənilib':
      style = { backgroundColor: '#EBF5F0', color: '#55AB80' };
      break;
    case 'Açıq':
      style = { backgroundColor: '#EAF3FB', color: '#4E9CDF' };
      break;
  }
  return (
    <span className={styles.tag} style={{ ...style, ...tagStyle }} {...rest}>
      {label}
    </span>
  );
};
