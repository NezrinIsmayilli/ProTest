/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import swal from '@sweetalert/with-react';

// components
import { Popover } from 'antd';
import { Can } from 'components/Lib';

// actions
import { deleteTransaction } from 'store/actions/finance/operations';

// utils
import { accessTypes } from 'config/permissions';
import { toFixedNumber } from 'utils';

// icons
import { FaPen, FaTrash } from 'react-icons/fa';
import { GoKebabVertical } from 'react-icons/go';

import styles, { popover } from '../styles.module.scss';
import { financePermissionsHelper, tabUrls } from './FinanceTabs';

const { manage } = accessTypes;

const PopContent = ({ id, tab, filters }) => {
  const dispatch = useDispatch();

  const operationsDeleteHandle = () => {
    swal({
      title: 'Silmək istədiyinizə əminsinizmi?',
      icon: 'warning',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        dispatch(deleteTransaction(id, filters));
      }
    });
  };

  return (
    <div className={styles.popContent}>
      <Link to={`${tabUrls[tab]}${id}`}>
        <span>
          <FaPen />
        </span>
        Redaktə et
      </Link>
      <div
        role="button"
        tabIndex={0}
        onClick={e => {
          e.stopPropagation();
          operationsDeleteHandle();
        }}
      >
        <span>
          <FaTrash />
        </span>
        Sil
      </div>
    </div>
  );
};

export function TablePopover({ value, row, tab, filters }) {
  return (
    <div className={popover}>
      <div className={styles.popoverText}>{`${toFixedNumber(
        value
      ).toLocaleString('en-EN')} ${row.currencyCode}`}</div>
      <Can I={manage} a={financePermissionsHelper[tab]}>
        {() => (
          <Popover
            placement="leftTop"
            content={<PopContent id={row.id} tab={tab} filters={filters} />}
            trigger="click"
          >
            <span
              role="button"
              tabIndex={0}
              className={styles.dots}
              onClick={e => e.stopPropagation()}
            >
              <GoKebabVertical />
            </span>
          </Popover>
        )}
      </Can>
    </div>
  );
}
