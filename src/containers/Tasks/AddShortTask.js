import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ProButton, ProSelect, ProInput } from 'components/Lib';
import { AiOutlinePlus, AiOutlineClose } from 'react-icons/ai';

export default function AddShortTask({
  index,
  creatingTask,
  users,
  profile,
  list,
  shortTaskSubmitHandle,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState(undefined);
  const [member, setMember] = useState(undefined);
  const inputRef = useRef();

  const onMemberChange = id => {
    setMember(id);
  };
  const onChange = event => {
    setTask(event.target.value);
  };
  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const onSubmit = () => {
    shortTaskSubmitHandle(index, task, member, list, () => {
      setIsOpen(false);
      setTask(undefined);
    });
  };

  const { t } = useTranslation();
  return (
    <div>
      {isOpen ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ProSelect
            size="middle"
            style={{ marginTop: '5px' }}
            data={users.filter(user => user.id !== profile.id)}
            value={member}
            onChange={onMemberChange}
            keys={['name', 'lastName']}
          />
          <ProInput
            ref={inputRef}
            style={{ marginLeft: '2px' }}
            size="middle"
            value={task}
            onChange={onChange}
          />
          <ProButton
            onClick={onSubmit}
            disabled={!task || task?.length <= 0}
            loading={creatingTask}
            style={{
              margin: '0px 2px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AiOutlinePlus />
          </ProButton>
          <ProButton
            onClick={onClose}
            style={{
              margin: '0px 2px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AiOutlineClose />
          </ProButton>
        </div>
      ) : (
        <ProButton type="block" style={{ width: '100%' }} onClick={onOpen}>
          Yeni tapşırıq
        </ProButton>
      )}
    </div>
  );
}

AddShortTask.propTypes = {
  index: PropTypes.number,
  shortTaskSubmitHandle: PropTypes.func,
};
