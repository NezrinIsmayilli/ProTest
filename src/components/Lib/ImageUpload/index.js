import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Upload, message, Icon } from 'antd';
import { cookies } from 'utils/cookies';
import styles from './styles.module.scss';

const token = cookies.get('_TKN_');
const tenantId = cookies.get('__TNT__');

const baseURL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL
    : process.env.REACT_APP_DEV_API_URL;

export const handleFileDelete = id => axios.delete(`/attachments/${id}`);

export function ImageUpload(props) {
  const {
    imageFieldChange = () => {},
    imageBeforeChange = () => {},
    attachmentUrl = '',
    attachmentId = '',
    clearState = false,
  } = props;

  const uploadProps = {
    accept: 'image/*',
    headers: {
      'X-AUTH-PROTOKEN': token,
      'X-TENANT-ID': tenantId,
    },
    action: `${baseURL}/attachments`,
    multiple: false,
    onChange: onFileChange,
    listType: 'picture',
    className: 'upload-list-image',
  };
  const [file, setFile] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isEditProcess, setIsEditProcess] = useState(false);

  function onFileRemove(file) {
    setFile('');
    setFileList('');
    setAttachment(null);
    imageFieldChange({ target: { name: 'attachment', value: null } });
    if (file.response) {
      setIsEditProcess(true);
      return handleFileDelete(file.response.data.id);
    }
    if (file.status === 'edited') {
      setIsEditProcess(true);
      return handleFileDelete(file.id);
    }
  }

  function onFileChange({ file, fileList }) {
    if (fileList.length === 0) {
      setFile('');
    } else if (fileList[0] && fileList[0].status === 'done') {
      imageFieldChange({
        target: { name: 'attachment', value: fileList[0].response.data.id },
      });
      setAttachment(fileList);
    } else {
      setFile(file);
    }
    setFileList(fileList);
  }

  function beforeUpload(file) {
    imageBeforeChange();
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Həcmi 2MB-dan çox olmamalıdır!');
    }
    return isLt2M;
  }
  useEffect(() => {
    if (attachment !== null) {
      setFileList(attachment);
    }
    if (
      attachment === null &&
      isEditProcess === false &&
      attachmentUrl &&
      attachmentId
    ) {
      setFileList([
        {
          uid: '-1',
          status: 'edited',
          url: attachmentUrl,
          id: attachmentId,
        },
      ]);
      setFile({
        id: attachmentId,
        uid: '-1',
        status: 'edited',
        url: attachmentUrl,
      });
    }
  }, [attachment, attachmentUrl, attachmentId, isEditProcess]);

  useEffect(() => {
    if (clearState === true) {
      setFile('');
      setFileList('');
      setAttachment(null);
      imageFieldChange({ target: { name: 'attachment', value: null } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearState]);
  return (
    <div className={styles.uploadCard}>
      <label>Şəkil</label>
      <div className={styles.upload}>
        <Upload
          {...uploadProps}
          onRemove={onFileRemove}
          beforeUpload={beforeUpload}
          fileList={fileList}
        >
          {!file && (
            <div className={styles.uploadBtn}>
              <p className="ant-upload-drag-icon">
                <Icon type="upload" />
              </p>
              <p className="ant-upload-text">Faylı seçin</p>
            </div>
          )}
        </Upload>
      </div>
    </div>
  );
}

ImageUpload.propTypes = {
  imageFieldChange: PropTypes.func,
};
