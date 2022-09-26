import React from 'react';

import {
  FaCheck,
  //  FaTimes
} from 'react-icons/fa';

import styles from '../styles.module.scss';

function Package({
  selected,
  setSelected,
  priceType,
  pack,
  infoArray,
  editMode,
}) {
  const { id, name, priceMonthly, priceYearly } = pack;

  return (
    <div
      className={`${styles.planCol} ${
        selected.id === id ? styles.selectedPlan : ''
      }`}
      style={editMode ? {} : { pointerEvents: 'none' }}
      onClick={setSelected}
      role="button"
      tabIndex={0}
    >
      <div className={styles.planHeadCell}>
        <div className={styles.planType}>{name}</div>
        <div className={styles.planPrice}>
          {priceType === 'priceMonthly' ? priceMonthly : priceYearly} AZN
        </div>
      </div>

      {infoArray.map(item => (
        <span key={item}>
          <FaCheck fill="#219653" />
        </span>
      ))}
    </div>
  );
}

export default Package;
