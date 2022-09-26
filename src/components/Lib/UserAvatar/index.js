import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Icon } from 'antd';
import { toast } from 'react-toastify';

import { messages } from 'utils';

import styles from './styles.module.scss';

const defaultImagePath = '/img/profile/default.jpg';

const isLargerthan5M = fileSize => fileSize / 1024 / 1024 > 5;

const formData = new FormData();

function UserAvatarWithoutRef(props, ref) {
  const {
    type = 'person',
    src,
    name,
    setFieldsValue,
    attachment,
    loading,
  } = props;

  const [innerSrc, setInnerSrc] = useState(() =>
    type === 'person' ? src || defaultImagePath : ''
  );

  const inputRef = useRef(null);

  function onClick() {
    if (!loading) {
      if (!inputRef?.current?.value) {
        inputRef.current.click();
      } else {
        inputRef.current.value = '';
        formData.delete('file');
        setInnerSrc(src || defaultImagePath);
        setFieldsValue({ attachment: attachment?.id });
      }
    }
  }

  function onFileSelect(event) {
    event.preventDefault();
    if (event?.target?.files?.length > 0) {
      const file = event.target.files[0];
      if (isLargerthan5M(file.size)) {
        toast.warn(messages.fileSizeError);
        inputRef.current.value = '';
      } else {
        setInnerSrc(window.URL.createObjectURL(file));
        formData.append('file', file);
      }
    }
  }

  useImperativeHandle(ref, () => ({
    getFormData() {
      inputRef.current.value = '';
      return formData.has('file') ? formData : null;
    },
  }));

  // reset
  useEffect(() => {
    const inputReff = inputRef;

    return () => {
      formData.delete('file');
      inputReff.current.value = '';
    };
  }, []);

  const iconType = inputRef?.current?.value ? 'delete' : 'camera';

  return (
    <div className={styles.userCard}>
      <div>
        <Avatar className={styles.avatar} src={innerSrc} alt={name} />
        <button onClick={onClick} type="button" className={styles.image}>
          <Icon type={iconType} className={styles.uploadButton} />
          <input
            ref={inputRef}
            className={styles.fileUpload}
            type="file"
            accept=".png, .jpeg, .jpg"
            onChange={onFileSelect}
          />
        </button>
      </div>
      <div>
        <span className={styles.name}>{name}</span>
      </div>
    </div>
  );
}

export const UserAvatar = React.forwardRef(UserAvatarWithoutRef);

UserAvatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
};
