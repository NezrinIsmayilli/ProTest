import React from 'react';
import {
  uploadAttachment,
  deleteAttachment,
  downloadFileUrl,
} from 'store/actions/attachment';
import { Upload, Spin } from 'antd';
import { connect } from 'react-redux';
import { MdCloudUpload } from 'react-icons/md';
import pdfVector from 'assets/img/icons/filePdf.PNG';
import xslVector from 'assets/img/icons/fileXsl.PNG';
import imgVector from 'assets/img/icons/fileImg.PNG';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

const { Dragger } = Upload;
const formData = new FormData();

const UploadComponent = ({
  uploadAttachment,
  deleteAttachment,
  downloadFileUrl,
  documents,
  setDocuments,
}) => {
  const supportedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
              status: 'done',
            };
          return document;
        })
      );
      onSuccess(null, file);
    });
  };

  function getFileAvatar(file) {
    if (
      file.type === 'image/png' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/svg'
    )
      return imgVector;
    if (
      file.type === 'application/vnd.ms-excel' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
      return xslVector;
    if (file.type === 'application/pdf') return pdfVector;
    return '';
  }

  const onRemoveFile = selectedFile => {
    deleteAttachment(selectedFile.id, () => {
      setDocuments(prevDocuments =>
        prevDocuments.filter(document => document.uid !== selectedFile.uid)
      );
    });
  };
  const onDownloadFile = file => {
    downloadFileUrl(file.id, data => {
      window.open(data.url);
    });
  };

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
      <Spin
        spinning={
          documents.filter(({ status }) => status === 'wait').length > 0
        }
      >
        <Dragger
          listType="picture"
          fileList={documents}
          onDownload={onDownloadFile}
          customRequest={uploadFile}
          onRemove={onRemoveFile}
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
                  Qəbul edilən fayl növləri: .jpg, .jpeg, .pdf, .doc, .xlsx
                </p>
              </div>
            </div>
          </p>
        </Dragger>
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({});

export const ProUpload = connect(
  mapStateToProps,
  { uploadAttachment, deleteAttachment, downloadFileUrl }
)(UploadComponent);
