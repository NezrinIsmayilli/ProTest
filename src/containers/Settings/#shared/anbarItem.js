import React from 'react';
import { Input, Button, Tooltip, Icon } from 'antd';
import { Can } from 'components/Lib';

import { FaTrash, FaPencilAlt, FaSave } from 'react-icons/fa';

import { useEditableInput } from 'hooks/useEditableInput';

import styles from './styles.module.scss';

export const AnbarItem = React.memo(function AnbarItem({
                                                         id,
                                                         name,
                                                         placeholder,
                                                         toggleAddAnbar,
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
        <span>{name}</span>
        <div>
          <Button
            type="link"
            onClick={() => deleteHandle(id)}
            className={styles.delete}
          >
            <Icon component={FaTrash}/>
          </Button>

          <Button type="link" onClick={toggleAddAnbar} className={styles.edit}>
              <Icon component={FaPencilAlt}/>
          </Button>
        </div>
      </td>
    </tr>
  );
});
