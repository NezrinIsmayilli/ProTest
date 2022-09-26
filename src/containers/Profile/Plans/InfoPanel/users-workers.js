import React, { Fragment } from 'react';

import { InputNumber } from 'antd';

// import { MdInfo } from 'react-icons/md';

import { usePlansContext } from '../plans-context';

import styles from '../styles.module.scss';

function UsersWorkers() {
  const {
    limits,
    limitsPrice,
    editMode,
    limitsUpdateHandle,
  } = usePlansContext();

  const { users, employees } = limits;

  return (
    <Fragment>
      <h3 className={styles.infoSecondTitle}>
        <strong>İstifadəçi və işçilər </strong>
        {/* <MdInfo fill="#BDBDBD" /> */}
      </h3>

      {/* user and employees counts */}
      <ul className={`${styles.modules} ${styles.userCounts}`}>
        <li>
          <span className={styles.label}>İstifadəçi (3+)</span>
          {editMode ? (
            <InputNumber
              value={users}
              min={0}
              max={1000}
              className={styles.countInput}
              onChange={value =>
                limitsUpdateHandle({ limitKey: 'users', value })
              }
            />
          ) : (
            <span className={styles.count}>{users}</span>
          )}
          <span className={styles.price}>{limitsPrice.users} AZN</span>
        </li>

        <li>
          <span className={styles.label}>İşçilər (20+)</span>
          {editMode ? (
            <InputNumber
              value={employees}
              min={0}
              max={1000}
              className={styles.countInput}
              onChange={value =>
                limitsUpdateHandle({ limitKey: 'employees', value })
              }
            />
          ) : (
            <span className={styles.count}>{employees}</span>
          )}
          <span className={styles.price}>{limitsPrice.employees} AZN</span>
        </li>
      </ul>
      <div style={{ fontSize: '14px', color: '#EB5757', margin: '-10px 7px 5px 7px' }}>
        * Seçilmiş paketdən aslı olmayaraq 3 istifadəçi və 20 işçi pulsuz olaraq
        təqdim edilir
      </div>
    </Fragment>
  );
}

export default UsersWorkers;
