import React, { useState } from 'react';
import { Button } from 'antd';
import swal from '@sweetalert/with-react';

import styles from './styles.module.scss';

export default function SidebarListItem(props) {
  const {
    data,
    onDelete,
    onSelect,
    employee,
    showDeleteButton = true,
    isSelected = false,
    mainTitle,
    secondTitle,
  } = props;

  const [isLoading, setLoading] = useState(false);

  function handleClick(e) {
    e.stopPropagation();

    swal({
      title: employee === 'employee' ? 'Diqqət!' : `${data.name} silinsin?`,
      icon: employee === 'employee' ? null : 'warning',
      text:
        employee === 'employee'
          ? 'Seçilmiş bonus növünü silmək istədiyinizə əminsiniz?'
          : null,
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        setLoading(true);
        onDelete(stopLoading);
      }
    });
  }

  function stopLoading() {
    setLoading(false);
  }

  return (
    <li
      className={`${styles.item} ${
        isLoading || isSelected ? styles.active : ''
      }`}
      onClick={() => onSelect(data)}
    >
      <div className={styles.textWrap}>
        <div className={styles.mainTitle}> {mainTitle} </div>
        <div className={styles.secondTitle}> {secondTitle}</div>
      </div>
      {showDeleteButton && (
        <Button
          type="link"
          icon="delete"
          className={styles.button}
          onClick={handleClick}
          loading={isLoading}
        />
      )}
    </li>
  );
}
