import React from 'react';
import { Button, Icon } from 'antd';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

import styles from '../index.module.sass';

export function AnbarListItem(props) {
  const {
    index,
    name,
    handleDelete,
    handleEdit
  } = props;

  return (
    <tr>
      <td>{index + 1}</td>
      <td className={styles.row}>
        {name}
        <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Button type="link" onClick={handleDelete} className={styles.delete} style={{marginRight: 8}}>
            <Icon component={FaTrash} />
          </Button>
          <Button type="link" onClick={handleEdit} className={styles.edit}>
            <Icon component={FaPencilAlt} />
          </Button>
        </div>
      </td>

    </tr>
  );
}
