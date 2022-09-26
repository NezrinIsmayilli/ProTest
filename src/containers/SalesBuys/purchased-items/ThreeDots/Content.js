import React from 'react';
import { IconButton } from 'components/Lib';
import styles from './styles.module.scss';

const Content = ({ row, handleDetailClick, handleDeleteClick }) => {
  const onDetailClick = row => {
    handleDetailClick(row);
  };

  const onDeleteClick = () => {
    handleDeleteClick(row);
  };
  return (
    <div
      style={{
        backgroundColor: '#F9F9F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'column',
        border: 'none',
      }}
    >
      <IconButton
        buttonStyle={{
          padding: '0 10px',
          borderBottom: '1px solid #E9E9E9',
        }}
        className={styles.editButton}
        label="Ətraflı"
        icon="info"
        iconWidth={16}
        iconHeight={16}
        onClick={() => onDetailClick(row)}
      />
      <IconButton
        buttonStyle={{ padding: '0 10px', justifyContent: 'space-between' }}
        className={styles.editButton}
        label="Geri qaytar"
        icon="arrow-down-2"
        iconWidth={16}
        iconHeight={16}
        onClick={onDeleteClick}
      />
    </div>
  );
};

export default Content;
