import React from 'react';
import { ReactComponent as TrashIcon } from 'assets/img/icons/trash-main.svg';
import styles from '../../styles.module.scss';

const TrashComponent = props => {
  const { value, handleProductRemove } = props;

  const onClick = () => {
    handleProductRemove(value);
  };

  return <TrashIcon className={styles.trashIcon} onClick={onClick} />;
};

export const Trash = TrashComponent;
