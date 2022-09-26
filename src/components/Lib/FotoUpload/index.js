import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import 'react-medium-image-zoom/dist/styles.css';
import { Upload, Tooltip, Modal } from 'antd';
import swal from '@sweetalert/with-react';
import { MdPhotoCamera } from 'react-icons/md';
import { cookies } from 'utils/cookies';
import styles from './styles.module.scss';

const token = cookies.get('_TKN_');
const tenantId = cookies.get('__TNT__');

const baseURL =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_DEV_API_URL;

export function PhotoUpload(props) {
    const {
        setAttachment,
        attachment,
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
        onChange: onFileChange,
        onPreview: () => setPreviewVisible(true),
        listType: 'picture-card',
    };
    const [file, setFile] = useState('');
    const [fileList, setFileList] = useState([]);
    const [error, setError] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    const handleFileDelete = id =>
        axios.delete(`/attachments/${id}`).then(function(response) {
            setFile('');
            setFileList([]);
            setAttachment(null);
        });

    const onRemoveFile = selectedFile => {
        swal({
            title: 'Silmək istədiyinizə əminsinizmi?',
            icon: 'warning',
            buttons: ['İmtina', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                handleFileDelete(selectedFile.response.data.id);
            }
        });
    };

    function onFileChange({ file, fileList }) {
        const isLt2M = file.size / 1024 / 1024 < 3;
        if (isLt2M) {
            if (fileList[0] && fileList[0].status === 'done') {
                setAttachment([
                    {
                        ...fileList[0],
                        thumbUrl: URL.createObjectURL(file.originFileObj),
                    },
                ]);
            } else {
                setFile([
                    {
                        ...file,
                        thumbUrl: URL.createObjectURL(file.originFileObj),
                    },
                ]);
            }
            if (file.status !== 'removed') {
                setFileList(fileList);
            }
        }
    }

    function beforeUpload(file) {
        const isLt2M = file.size / 1024 / 1024 < 3;
        if (!isLt2M) {
            setError(true);
        } else {
            setError(false);
        }
        return isLt2M;
    }
    useEffect(() => {
        if (attachment !== null) {
            setFileList(attachment);
            setFile(attachment);
        }
        // if (
        //     attachment === null &&
        //     attachmentUrl &&
        //     attachmentId
        // ) {
        //     setFileList([
        //         {
        //             uid: '-1',
        //             status: 'edited',
        //             url: attachmentUrl,
        //             id: attachmentId,
        //         },
        //     ]);
        //     setFile({
        //         id: attachmentId,
        //         uid: '-1',
        //         status: 'edited',
        //         url: attachmentUrl,
        //     });
        // }
    }, [attachment, attachmentUrl, attachmentId]);

    useEffect(() => {
        if (clearState === true) {
            setFile('');
            setFileList('');
            setAttachment(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clearState]);

    return (
        <div className={styles.uploadCard}>
            <div
                className={`${styles.upload} ${
                    error ? styles.uploadError : ''
                }`}
            >
                <Tooltip
                    visible={error}
                    placement="top"
                    title="Fotoşəkilin ölçüsü 3 mb-dan çox olmamalıdır."
                >
                    <Upload
                        {...uploadProps}
                        beforeUpload={beforeUpload}
                        fileList={fileList}
                        showUploadList={{ showDownloadIcon: false }}
                        onRemove={onRemoveFile}
                    >
                        {fileList.length >= 1 ? null : (
                            <div className={styles.uploadBtn}>
                                <p className="ant-upload-drag-icon">
                                    <MdPhotoCamera fontSize={26} />
                                </p>
                                <p className="ant-upload-text">
                                    Fotoşəkil əlavə edin
                                </p>
                            </div>
                        )}
                    </Upload>
                </Tooltip>
                <Modal
                    closable={false}
                    visible={previewVisible}
                    // title={previewTitle}
                    footer={null}
                    onCancel={() => setPreviewVisible(false)}
                >
                    <img
                        alt="example"
                        style={{ width: '100%' }}
                        src={file?.[0]?.thumbUrl}
                    />
                </Modal>
            </div>
        </div>
    );
}

PhotoUpload.propTypes = {
    imageFieldChange: PropTypes.func,
};
