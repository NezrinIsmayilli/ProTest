/* eslint-disable react/display-name */
import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Tooltip, Icon } from 'antd';
import { Can } from 'components/Lib';

import { FaTrash, FaPencilAlt, FaSave } from 'react-icons/fa';

import { useEditableInput } from 'hooks/useEditableInput';

import styles from './styles.module.sass';

export const EditableRow = React.memo(function EditableRow({
  id,
  name,
  placeholder,
  maxLength,
  editHandle,
  deleteHandle,
  index,
  hideDeleteIcon,
  // hideEditIcon,
  permission = false,
  infoButton,
}) {
  // editable input
  const {
    inputValue,
    editableRef,
    inputChangeHandle,
    changeEditableHandle,
    editable,
    setInputValue,
  } = useEditableInput(name);

  function onKeyUp(event) {
    if (event.keyCode === 13) {
      changeEditableHandle();
      if (editable && inputValue) {
        editHandle(id, inputValue);
      } else {
        setInputValue(name);
      }
    }
    if (event && event.keyCode === 27) changeEditableHandle();
  }

  function saveHandle() {
    changeEditableHandle();
    if (editable && inputValue) {
      editHandle(id, inputValue);
    } else {
      setInputValue(name);
    }
  }

  return (
    <tr>
      <td>{index + 1}</td>
      <td className={styles.row}>
        {editable ? (
          <Tooltip mouseEnterDelay={0.5} title="Press ESC to cancel">
            <Input
              placeholder={placeholder}
              maxLength={maxLength}
              name="name"
              value={inputValue}
              autoComplete="off"
              onChange={inputChangeHandle}
              ref={editableRef}
              style={{
                borderColor: !inputValue ? 'red' : '#dedede',
              }}
              onKeyUp={onKeyUp}
            />
          </Tooltip>
        ) : (
          <span>{name}</span>
        )}
        <div>
          {permission ? (
            <Can I="manage" a={permission}>
              {infoButton}

              {!hideDeleteIcon && (
                <Button
                  type="link"
                  onClick={() => deleteHandle(id)}
                  className={styles.delete}
                >
                  <Icon component={FaTrash} />
                </Button>
              )}

              <Button type="link" onClick={saveHandle} className={styles.edit}>
                {editable ? (
                  <Icon component={FaSave} />
                ) : (
                  <Icon component={FaPencilAlt} />
                )}
              </Button>
            </Can>
          ) : (
            <>
              {infoButton}
              {!hideDeleteIcon && (
                <Button
                  type="link"
                  onClick={() => deleteHandle(id)}
                  className={styles.delete}
                >
                  <Icon component={FaTrash} />
                </Button>
              )}

              <Button type="link" onClick={saveHandle} className={styles.edit}>
                {editable ? (
                  <Icon component={FaSave} />
                ) : (
                  <Icon component={FaPencilAlt} />
                )}
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

EditableRow.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
  editHandle: PropTypes.func,
  deleteHandle: PropTypes.func,
  index: PropTypes.number,
  placeholder: PropTypes.string,
  infoButton: PropTypes.element,
};
