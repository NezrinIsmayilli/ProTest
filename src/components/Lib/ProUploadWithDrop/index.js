import React, { useState } from 'react';
import { uploadAttachment, deleteAttachment } from 'store/actions/attachment';
import { Upload, Spin } from 'antd';
import { connect } from 'react-redux';
import { MdCloudUpload } from 'react-icons/md';
import { createForms } from 'store/actions/settings/serialNumberPrefix';
import xslVector from 'assets/img/icons/fileXsl.PNG';
import docVector from 'assets/img/icons/fileWord.png';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

const { Dragger } = Upload;
const formData = new FormData();

const UploadComponent = ({
  uploadAttachment,
  documents,
  setDocuments,
  downloadLoading,
  deleteLoading,
  uploadLoading,
  formType,
  createForms,
}) => {
  const supportedFileTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const uploadFile = ({ file, onSuccess }) => {
    formData.delete('file');
    const isExactFileType = supportedFileTypes.includes(file.type);
    const isExactSize = file.size / 1024 / 1024 < 2;

    if (!isExactFileType) {
      return toast.error('Fayl tipi düzgün deyil.');
    }
    if (!isExactSize) {
      return toast.error('Faylın ölçüsü 2MB-dan çox ola bilməz.');
    }
    if (documents.length >= 5) {
      return toast.error('5-dən çox fayl əlavə edilə bilməz.');
    }

    if (documents.filter(document => document.uid === file.uid).length > 0) {
      return toast.error('Bu fayl artıq əlavə edilib.');
    }

    const tmp = {
      uid: file.uid,
      type: file.type,
      name: file.name,
      thumbUrl: getFileAvatar(file),
    };

    setDocuments(prevDocuments => [
      ...prevDocuments,
      { ...tmp, status: 'wait' },
    ]);

    formData.append('file', file);

    uploadAttachment(formData, data => {
      setDocuments(prevDocuments =>
        prevDocuments.map(document => {
          if (document.name === data.data.originalName)
            return {
              ...document,
              id: data.data.id,
              attachmentId: data.data.id,
              status: 'done',
              invoiceType: formType,
            };
          return document;
        })
      );
      onSuccess(null, file);
      const form = {
        name: data.data.originalName,
        type: formType,
        attachment: data.data.id,
      };
      createForms(form, res => {
        setDocuments(prevDocuments =>
          prevDocuments.map(document => {
            if (document.name === data.data.originalName)
              return {
                ...document,
                id: res.data.id,
              };
            return document;
          })
        );
      });
    });
  };

  function getFileAvatar(file) {
    if (file.type === 'application/zip') {
      if (file.name.split('.').pop() === 'xlsx') {
        return xslVector;
      } else if (file.name.split('.').pop() === 'docx') {
        return docVector;
      }
    }
    if (
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    )
      return docVector;
    return '';
  }

  return (
    <div
      className={styles.uploadParent}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 30,
        marginTop: 30,
      }}
    >
      <Spin spinning={downloadLoading || deleteLoading || uploadLoading}>
        <Dragger
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          listType="picture"
          fileList={null}
          customRequest={uploadFile}
          onDrop={e => {
            console.log('Dropped files', e.dataTransfer.files);
          }}
          className={styles.uploadArea}
          multiple
        >
          <p
            className="ant-upload-hint"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}
            >
              <div className={styles.uploadButton}>
                <MdCloudUpload size={20} color="#313131" />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <p style={{ fontSize: '14px' }}>
                  Faylları buradan yükləyin (limit - 2MB / 5 ədəd)
                </p>
                <p style={{ fontSize: '12px' }}>
                  Qəbul edilən fayl növləri: .doc, .docx
                </p>
              </div>
            </div>
          </p>
        </Dragger>
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  downloadLoading: !!state.loadings.attachments,
  deleteLoading: !!state.loadings.attachment,
  uploadLoading: !!state.loadings.uploadAttachment,
});

export const ProUploadWithDrop = connect(
  mapStateToProps,
  { uploadAttachment, deleteAttachment, createForms }
)(UploadComponent);
