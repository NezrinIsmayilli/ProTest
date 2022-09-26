/* eslint-disable react/display-name */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Input } from 'antd';
import { Can } from 'components/Lib';

import { FaTrash, FaPencilAlt, FaSave, FaWindowClose } from 'react-icons/fa';

import { permissions, accessTypes } from 'config/permissions';

import { useMultiEditable } from 'hooks/useMultiEditable';

import styles from './styles.module.scss';

export const EditablePositionsRow = React.memo(function EditablePositionsRow({
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
              placeholder="Vezifenin adi"
              name="name"
              defaultValue={name}
              onChange={({ target: { value } }) => onChange('name', value)}
              onKeyUp={onEnterKeyUp}
              onKeyDown={onEscKeyDown}

            />
            {errors.name && <span style={{
                        color:'red'
                      }}>Bu dəyər 3 simvoldan az olmamalıdır.</span>}
          </td>
          <td>
            <Input
              type="text"
              style={{
                borderColor: errors.code ? 'red' : '#dedede',
              }}
              placeholder="Kodu"
              name="code"
              onChange={({ target: { value } }) => onChange('code', value)}
              defaultValue={code}
              onKeyUp={onEnterKeyUp}
              onKeyDown={onEscKeyDown}
              maxLength={8}
            />
          </td>
          <td>
            <Input
              type="text"
              style={{
                borderColor: errors.code ? 'red' : '#dedede',
              }}
              placeholder="Abr"
              name="shortName"
              onChange={({ target: { value } }) => onChange('shortName', value)}
              defaultValue={shortName}
              onKeyUp={onEnterKeyUp}
              onKeyDown={onEscKeyDown}
              maxLength={10}
            />
          </td>
          <td className={styles.txtCenter}>
            <a onClick={saveHandle} href="javascript:;" className={styles.edit}>
              <FaSave size={18} />
            </a>
          </td>
          <td className={styles.txtCenter}>
            <a
              onClick={toggleHandle}
              href="javascript:;"
              className={styles.delete}
            >
              <FaWindowClose size={18} />
            </a>
          </td>
        </Fragment>
      ) : (
        <Fragment>
          <td>
            <span>{name}</span>
          </td>
          <td>{code}</td>
          <td>{shortName}</td>
          <td className={styles.txtCenter}>
            <Can I={accessTypes.manage} a={permissions.occupation}>
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
          </td>
          <td className={styles.txtCenter}>
            <Can I={accessTypes.manage} a={permissions.occupation}>
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
          </td>
        </Fragment>
      )}
    </tr>
  );
});

EditablePositionsRow.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
  editHandle: PropTypes.func,
  deleteHandle: PropTypes.func,
  index: PropTypes.number,
};

