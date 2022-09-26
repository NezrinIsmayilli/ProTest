/* eslint-disable react/display-name */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Input } from 'antd';
import { Can } from 'components/Lib';

import { FaTrash, FaPencilAlt, FaSave, FaWindowClose } from 'react-icons/fa';

import { permissions, accessTypes } from 'config/permissions';

import { useMultiEditable } from 'hooks/useMultiEditable';

import styles from '../index.module.sass';

export const EditableRow = React.memo(function EditableRow({
  id,
  name,
  code,
  shortName,
  editHandle,
  deleteHandle,
  index,
}) {
  const {
    editable,
    onChange,
    firstInputRef,
    errors,
    toggleHandle,
    onEnterKeyUp,
    onEscKeyDown,
    saveHandle,
  } = useMultiEditable({
    values: [
      { name: 'id', value: id },
      { name: 'name', value: name },
      { name: 'code', value: code, required: false },
      { name: 'shortName', value: shortName, required: false },
    ],
    onSubmit: values => {
      editHandle({ data: values });
      toggleHandle();
    },
  });
  return (
    <tr key={`${id}${name}`}>
      <td>{index + 1}</td>
      {editable ? (
        <Fragment>
          <td>
            <Input
              ref={firstInputRef}
              type="text"
              style={{
                borderColor: errors.name ? 'red' : '#dedede',
              }}
              placeholder="Vəzifənin adı"
              name="name"
              defaultValue={name}
              onChange={({ target: { value } }) => onChange('name', value)}
              onKeyUp={onEnterKeyUp}
              onKeyDown={onEscKeyDown}
            />
            <div>
              <a
                onClick={saveHandle}
                href="javascript:;"
                className={styles.edit}
              >
                <FaSave size={18} />
              </a>
              <a
                onClick={toggleHandle}
                href="javascript:;"
                className={styles.delete}
                style={{ marginLeft: '17px' }}
              >
                <FaWindowClose size={18} />
              </a>
            </div>
          </td>
        </Fragment>
      ) : (
        <Fragment>
          <td>
            <span>{name}</span>
            <div>
              <Can I={accessTypes.manage} a={permissions.msk_occupations}>
                {() => (
                  <a
                    onClick={toggleHandle}
                    href="javascript:;"
                    className={styles.edit}
                  >
                    <FaPencilAlt size={18} />
                  </a>
                )}
              </Can>
              <Can I={accessTypes.manage} a={permissions.msk_occupations}>
                {() => (
                  <a
                    onClick={() => deleteHandle(id)}
                    href="javascript:;"
                    className={styles.delete}
                  >
                    <FaTrash size={18} />
                  </a>
                )}
              </Can>
            </div>
          </td>
        </Fragment>
      )}
    </tr>
  );
});

EditableRow.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
  editHandle: PropTypes.func,
  deleteHandle: PropTypes.func,
  index: PropTypes.number,
};
