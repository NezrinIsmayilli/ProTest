import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { FiSave } from 'react-icons/fi';
import { FaPencilAlt } from 'react-icons/fa';
import styles from './CurrencyBlock.module.css';
import GreenCheckBox from '../GreenCheckBox/GreenCheckBox';
import Switch from '../Switch/Switch';

export default function CurrencyRow({ row, rowIndex, handleSelectChange }) {
  const [visible, setVisible] = useState(false);

  function getCheckBoxData(data) {
    console.log(data);
  }

  function getSwitchData(data) {
    console.log(data);
  }

  useEffect(() => {
    console.log(row);
  }, [row]);

  const options = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'CAD', label: 'CAD' },
  ];

  return (
    <tr className={styles.cr_row_tr}>
      <td className={styles.cr_row_td}>{rowIndex}</td>
      <td className={styles.cr_row_td}>
        <GreenCheckBox value="false" {...{ getCheckBoxData }} />
      </td>
      <td className={styles.cr_row_td}>
        <label className="switch">
          <Switch value="false" {...{ getSwitchData }} />
        </label>
      </td>
      <td className={styles.cr_row_td}>
        {visible ? (
          <Select
            {...{ options }}
            onChange={handleSelectChange(rowIndex)}
            value={{ value: row.currency.value, label: row.currency.label }}
          />
        ) : (
          <span>Azerbaijani Manat</span>
        )}
      </td>
      <td className={styles.cr_row_td}>
        {!visible && (
          <>
            <span className={styles.unused_span}>-</span>
            <button
              type="button"
              onClick={() => setVisible(true)}
              className={styles.pencil_btn}
            >
              <FaPencilAlt />
            </button>
          </>
        )}
        {visible && (
          <div className={styles.last_child_td_flex}>
            <input
              type="text"
              className={styles.rates_input}
              name="value"
              value="-"
            />
            <div className={styles.close_edit_btns}>
              <button type="button" className={styles.edit}>
                <FiSave />
              </button>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className={styles.close}
              >
                <IoMdCloseCircleOutline />
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

CurrencyRow.propTypes = {
  handleSelectChange: PropTypes.func,
  row: PropTypes.object,
  rowIndex: PropTypes.number,
};
