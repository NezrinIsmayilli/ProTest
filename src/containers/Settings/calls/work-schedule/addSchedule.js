import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { fetchWorkSchedules } from 'store/actions/hrm/attendance/workSchedules';
import {
  fetchWorkSchedulesCall,
  editWorkSchedule,
} from 'store/actions/settings/work-schedule';
import { fetchSelectedAttachment } from 'store/actions/settings/ivr';
import { Upload, Form, message, Button, Spin } from 'antd';
import { fetchNewCallToken } from 'store/actions/profile';
import { MdKeyboardVoice } from 'react-icons/md';
import { ProSelect, ProFormItem, ProButton } from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { cookies } from 'utils/cookies';
import styles from './styles.module.scss';

const token = cookies.get('_TKN_CALL_');
const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
export const handleFileDownload = id =>
  fetch(`${url}/attachments/${id}/download`, {
    method: 'GET',
    headers: {
      'X-AUTH-PROTOKEN': token,
    },
  })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `record`);
      link.click();
    });
const AddSchedule = props => {
  const {
    form,
    setData,
    toggleRoleModal,
    workSchedules,
    fetchNewCallToken,
    fetchWorkSchedules,
    workScheduleCall,
    fetchWorkSchedulesCall,
    selectedSchedule,
    editWorkSchedule,
    fetchSelectedAttachment,
    selectedId,
    isLoading,
  } = props;
  const {
    validateFields,
    getFieldDecorator,
    getFieldError,
    setFieldsValue,
    resetFields,
  } = form;
  useEffect(() => {
    fetchWorkSchedules();
  }, []);

  const [nonWorkList, setNonWorkList] = useState([]);
  const [nonWorkAttachment, setNonWorkAttachment] = useState(null);
  const [deletedFiels, setDeletedFiels] = useState([]);
  const handleFileDelete = id =>
    axios.delete(`${url}/attachments/${id}`).then(function(response) {
      setDeletedFiels([]);
    });
  useEffect(() => {
    if (selectedSchedule.length > 0) {
      if (selectedSchedule?.[0].nonWorkingTimeAttachment !== null) {
        fetchSelectedAttachment({
          id: selectedSchedule?.[0].nonWorkingTimeAttachment.id,
          onSuccessCallback: ({ data }) => {
            setNonWorkAttachment([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: {
                    id: selectedSchedule?.[0].nonWorkingTimeAttachment.id,
                  },
                },
              },
            ]);
            setFieldsValue({
              nonWork: selectedSchedule?.[0].nonWorkingTimeAttachment.id,
            });
            setNonWorkList([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: {
                    id: selectedSchedule?.[0].nonWorkingTimeAttachment.id,
                  },
                },
              },
            ]);
          },
        });
      } else {
        setNonWorkAttachment(null);
        setNonWorkList([]);
      }
      setFieldsValue({
        workSchedule: workScheduleCall?.[0]?.prospectWorkSchedule.id,
      });
    } else {
      setNonWorkAttachment(null);
      setNonWorkList([]);
      setFieldsValue({
        workSchedule: null,
      });
    }
  }, [selectedSchedule]);
  const uploadNonWorkProps = {
    accept: '.mp3',
    headers: {
      'X-AUTH-PROTOKEN': token,
    },
    action: `${url}/attachments`,
    multiple: false,
    onChange: onNonWorkFileChange,
    onDownload: onFileDownload,
    showUploadList: {
      showDownloadIcon: true,
    },
  };
  function onFileDownload(file) {
    handleFileDownload(file?.response?.data?.id);
  }
  function beforeUpload(file) {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Həcmi 2MB-dan çox olmamalıdır!');
    }
    return isLt2M;
  }
  function onNonWorkFileRemove(file) {
    setNonWorkList('');
    setNonWorkAttachment(null);
    setFieldsValue({
      nonWork: undefined,
    });
    if (file.response) {
      setDeletedFiels(prevDocuments => [
        ...prevDocuments,
        file.response.data.id,
      ]);
    }
    if (file.status === 'edited') {
      setDeletedFiels(prevDocuments => [...prevDocuments, file.id]);
    }
  }
  function onNonWorkFileChange({ file, fileList }) {
    fileList = fileList.slice(-1);
    if (fileList.length === 0) {
      setNonWorkAttachment('');
      setNonWorkList(fileList);
    }
    if (fileList[0] && fileList[0].status === 'error') {
      if (fileList[0] && fileList[0]?.error?.status === 401) {
        setNonWorkList(
          fileList.map(list => ({
            ...list,
            percent: 90,
            status: 'uploading',
          }))
        );
        fetchNewCallToken({
          onSuccessCallback: () => {
            const fmData = new FormData();
            fmData.append('file', fileList[0].originFileObj);
            axios
              .post(file?.error?.url, fmData, {
                headers: {
                  'X-AUTH-PROTOKEN': token,
                },
              })
              .then(response => {
                setNonWorkAttachment(
                  fileList.map(list => ({
                    ...list,
                    error: null,
                    status: 'done',
                    response: {
                      data: {
                        id: response?.data?.data?.id,
                      },
                    },
                  }))
                );
                setNonWorkList(
                  fileList.map(list => ({
                    ...list,
                    error: null,
                    status: 'done',
                    response: {
                      data: {
                        id: response?.data?.data?.id,
                      },
                    },
                  }))
                );
              });
          },
        });
      } else if (fileList[0] && fileList[0]?.error?.status !== 401) {
        setNonWorkList(fileList);
      }
    } else if (fileList[0] && fileList[0].status === 'uploading') {
      setNonWorkList(fileList);
    } else if (fileList[0] && fileList[0].status === 'done') {
      setNonWorkAttachment(fileList);
      setNonWorkList(fileList);
    }
  }
  const handleExpenseSubmit = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { workSchedule } = values;

        const newSchedule = {
          nonWorkingTimeAttachment: nonWorkAttachment[0]?.response?.data?.id,
          prospectWorkSchedule: workSchedule,
        };
        editWorkSchedule(newSchedule, () => {
          fetchWorkSchedulesCall({
            onSuccessCallback: response => {
              [response?.data].map(index =>
                index.nonWorkingTimeAttachment !== null
                  ? fetch(
                      `${url}/attachments/${index.nonWorkingTimeAttachment?.id}/download`,
                      {
                        method: 'GET',
                        headers: {
                          'X-AUTH-PROTOKEN': token,
                        },
                      }
                    )
                      .then(response => response.blob())
                      .then(blob => {
                        const objectUrl = window.URL.createObjectURL(blob);
                        setData(prevState => [
                          ...prevState,
                          {
                            id: index.nonWorkingTimeAttachment?.id,
                            record: objectUrl,
                          },
                        ]);
                      })
                  : null
              );
            },
          });
          toggleRoleModal();
          deletedFiels.map(item => {
            handleFileDelete(item);
          });
          resetFields();
          setNonWorkList([]);
        });
      }
    });
  };
  return (
    <div className={styles.UpdateRole}>
      <h2>{selectedId ? 'Düzəliş et' : 'Əlavə et'}</h2>
      <Spin spinning={selectedId ? isLoading : false}>
        <Form onSubmit={event => handleExpenseSubmit(event)}>
          <ProFormItem
            label="İş rejimi"
            customStyle={styles.formItem}
            help={getFieldError('workSchedule')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('workSchedule', {
              rules: [requiredRule],
            })(<ProSelect className={styles.selectBox} data={workSchedules} />)}
          </ProFormItem>
          <ProFormItem
            label="Qeyri-iş vaxtı səslənəcək səs yazısı"
            customStyle={styles.formItem}
            help={getFieldError('nonWork')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('nonWork', {
              rules: [requiredRule],
            })(
              <div className={styles.customUpload}>
                <Upload
                  {...uploadNonWorkProps}
                  onRemove={onNonWorkFileRemove}
                  beforeUpload={beforeUpload}
                  fileList={nonWorkList}
                >
                  <ProButton style={{ margin: '0 10px' }}>
                    Fayl əlavə et
                  </ProButton>{' '}
                  {/* və ya{' '}
                <MdKeyboardVoice
                  style={{ fontSize: '26px', marginLeft: '10px' }}
                /> */}
                </Upload>
              </div>
            )}
          </ProFormItem>
          <ProButton htmlType="submit" type="primary">
            Təsdiq et
          </ProButton>
        </Form>
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  workSchedules: state.workSchedulesReducer.workSchedules,
  isLoading: state.loadings.fetchWorkSchedulesCall,
});

export default connect(
  mapStateToProps,
  {
    fetchWorkSchedules,
    fetchWorkSchedulesCall,
    editWorkSchedule,
    fetchSelectedAttachment,
    fetchNewCallToken,
  }
)(Form.create({ name: 'ScheduleCallForm' })(AddSchedule));
