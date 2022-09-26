import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { FaDownload, FaPlus } from 'react-icons/fa';
import styles from './CurrencyBlock.module.css';
import ButtonGreen from '../Buttons/ButtonGreen/ButtonGreen';
import CurrencyHeader from './CurrencyHeader';
import CurrencyRow from './CurrencyRow';

export default function CurrencyBlock() {
  const [rowState, setRowState] = useState({
    rows: [
      {
        main: false,
        active: false,
        currency: { value: '', label: '' },
        rate: '',
      },
    ],
  });

  const handleSelectChange = useCallback(
    rowIndex => value => {
      const rows = rowState.rows.map((row, rowSindex) => {
        if (rowIndex !== rowSindex) return row;
        return { ...row, currency: { value: value.value, label: value.label } };
      });

      setRowState({
        ...rowState,
        rows,
      });

      // console.log(value);
    },
    [rowState]
  );

  const handleAddRow = useCallback(() => {
    setRowState({
      rows: rowState.rows.concat([
        {
          main: true,
          active: true,
          currency: { value: 'USD', label: 'USD' },
          rate: '',
        },
      ]),
    });
  }, [rowState.rows]);

  // useEffect(() => {
  //   console.log(rowState);
  // }, [rowState]);

  return (
    <div className={styles.body}>
      <div className={styles.btn_container}>
        <ButtonGreen
          title="Yenilə"
          styleAddOns={{ marginRight: '10px' }}
          icon={
            <FiRefreshCw
              style={{ width: '10px', height: '10px', marginRight: '5px' }}
            />
          }
        />
        <ButtonGreen
          title="Məzənnədən götür (Mərkəzi Bank)"
          styleAddOns={{ marginRight: '10px' }}
          icon={
            <FaDownload
              style={{ width: '10px', height: '10px', marginRight: '5px' }}
            />
          }
        />
        <ButtonGreen
          onClick={handleAddRow}
          title="Yeni valyuta"
          icon={
            <FaPlus
              style={{ width: '10px', height: '10px', marginRight: '5px' }}
            />
          }
        />
      </div>
      <>
        <table className={styles.table_msk_valyuta}>
          <CurrencyHeader />
          <tbody>
            {rowState.rows.map((row, rowIndex) => (
              <CurrencyRow
                {...{ row, rowIndex, handleSelectChange }}
                key={rowIndex}
              />
            ))}
          </tbody>
        </table>
      </>
    </div>
  );
}
