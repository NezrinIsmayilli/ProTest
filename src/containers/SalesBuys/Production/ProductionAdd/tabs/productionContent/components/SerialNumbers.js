import React from 'react';
import { Tooltip } from 'antd';
import styles from '../../../styles.module.scss';

const SerialNumbersBox = props => {
  const { serialNumbers } = props;
  return (
    <>
      {serialNumbers.length > 0 ? (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          {serialNumbers[0]}
          <Tooltip
            title={
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {serialNumbers.map(serialNumber => (
                  <span>{serialNumber}</span>
                ))}
              </div>
            }
          >
            <span className={styles.serialNumberCount}>
              {serialNumbers.length}
            </span>
          </Tooltip>
        </div>
      ) : (
        '-'
      )}
    </>
  );
};

export const SerialNumbers = SerialNumbersBox;
