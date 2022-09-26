import React, { Fragment } from 'react';

import { Icon } from 'antd';

import { usePlansContext } from '../plans-context';

import styles from '../styles.module.scss';

// const packageNamesByKeys = {
//   task: 'Tapşırıqlar',
//   sales: 'Ticarət',
//   hrm: 'Əməkdaşlar',
//   projobs: 'İşçi axtarışı',
// };

function SelectedModules() {
  const {
    selectedPacks,
    priceType,
    editMode,
    packSelectHandle,
  } = usePlansContext();

  return (
    <Fragment>
      <h2>
        <strong>Seçilmiş modullar</strong>
      </h2>

      {/* modules */}
      <ul className={styles.modules}>
        {Object.keys(selectedPacks).map(key => {
          const { id, name, priceMonthly, priceYearly, isPurchased } =
            selectedPacks[key] || {};

          if (id === undefined) {
            return null;
          }

          const price =
            priceType === 'priceMonthly' ? priceMonthly : priceYearly;


          return (
            <li key={id}>
              {/* <span>{packageNamesByKeys[key]}</span> */}
              <span>{name}</span>
              <span>
                {price} AZN
                {editMode && price !== '0.00' ? (
                  <Icon
                    type="delete"
                    theme="filled"
                    className={styles.deleteIcon}
                    disabled={isPurchased}
                    onClick={() => packSelectHandle(key, undefined)}
                  />
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </Fragment>
  );
}

export default SelectedModules;
