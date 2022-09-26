import React from 'react';
import { Button } from 'antd';
import { Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';

import { FaRegTrashAlt, FaPencilAlt } from 'react-icons/fa';

import styles from './styles.module.scss';

export function ActionButtons({ setIsOpenDeleteModal, setEditInfo }) {
  return (
    <Can I={accessTypes.manage} a={permissions.hrm_activities}>
      {() => (
        <div className={styles.flexCenter}>
          <Button
            className={styles.deleteBtn}
            size="large"
            onClick={setIsOpenDeleteModal}
          >
            <FaRegTrashAlt /> <span>Sil</span>
          </Button>
          <Button size="large" className={styles.editBtn} onClick={setEditInfo}>
            <FaPencilAlt /> <span>Düzəliş</span>
          </Button>
        </div>
      )}
    </Can>
  );
}
