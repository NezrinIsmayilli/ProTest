import React from 'react';

// content
import styles from './styles.module.scss';

function RecievablesTableFooter(props) {
  return (
    <table className={styles.tableFooter}>
      <tr>
        <td width={60}>Total</td>
        <td width={200} />
        <td width={175} align="right">
          300 000,00
        </td>
        <td width={140} align="right">
          224 500,00
        </td>
        <td width={140} align="center">
          74,83%
        </td>
        <td width={130} align="right">
          75 500,00
        </td>
        <td width={175} align="right" />
        <td width={155} align="right" />
        <td width={175} align="right" />
        <td width={60} align="right" />
      </tr>
    </table>
  );
}

export default RecievablesTableFooter;
