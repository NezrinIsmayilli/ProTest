import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { ReactComponent as MinusIcon } from 'assets/img/icons/minus.svg';
import { Input, Form, Upload, Row, Col, Tooltip, message, Spin } from 'antd';
import { MdInfo, MdKeyboardVoice } from 'react-icons/md';
import { requiredRule } from 'utils/rules';
import {
  ProSelect,
  ProFormItem,
  ProButton,
  AddButton,
  SettingsCollapse,
  SettingsPanel,
} from 'components/Lib';
import { cookies } from 'utils/cookies';
import { toast } from 'react-toastify';
import { fetchNewCallToken } from 'store/actions/profile';
import { fetchOperatorGroup } from 'store/actions/settings/operatorGroup';
import { fetchCallRoles } from 'store/actions/settings/call-roles';
import {
  createIvr,
  editIvr,
  fetchIvr,
  fetchSelectedAttachment,
} from 'store/actions/settings/ivr';
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
      // Start download
      link.click();
    });

const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
const AddIvr = props => {
  const {
    form,
    fetchNewCallToken,
    fetchCallRoles,
    fetchOperatorGroup,
    operatorGroup,
    fetchSelectedAttachment,
    fetchIvr,
    operators,
    toggleRoleModal,
    editIvr,
    createIvr,
    isLoading,
    selectedIvr,
    selectedId,
  } = props;
  const {
    validateFields,
    getFieldDecorator,
    getFieldError,
    setFieldsValue,
    getFieldValue,
    resetFields,
    setFields,
  } = form;
  const [numbersRow, setNumbersRow] = useState([undefined]);
  const [arrRow, setArrRow] = useState(undefined);
  const [longList, setLongList] = useState([]);
  const [longAttachment, setLongAttachment] = useState(null);
  const [shortList, setShortList] = useState([]);
  const [shortAttachment, setShortAttachment] = useState(null);
  const [invalidList, set??nvalidList] = useState([]);
  const [invalidAttachment, set??nvalidAttachment] = useState(null);
  const [deletedFiels, setDeletedFiels] = useState([]);
  const handleFileDelete = id =>
    axios.delete(`${url}/attachments/${id}`).then(function(response) {
      setDeletedFiels([]);
    });
  const handleAddExpenseClick = (clickType = 'add', selectedIndex) => {
    if (clickType === 'add') {
      if (selectedIvr && selectedIvr.length > 0) {
        setArrRow(prevExpenses => [...getFieldValue('numbers'), null]);
      } else {
        setNumbersRow(prevExpenses => [...prevExpenses, null]);
      }
    }
    if (clickType === 'remove') {
      setFieldsValue({
        [`numbers[${selectedIndex}].button`]: null,
      });
      if (selectedIvr && selectedIvr.length > 0) {
        setArrRow(prevExpenses =>
          getFieldValue('numbers').filter(
            (prevExpense, index) => index !== selectedIndex
          )
        );
        setFieldsValue({
          numbers: getFieldValue('numbers').filter(
            (_, index) => index !== selectedIndex
          ),
        });
      } else {
        setNumbersRow(prevExpenses =>
          prevExpenses.filter((prevExpense, index) => index !== selectedIndex)
        );
        setFieldsValue({
          numbers: getFieldValue('numbers').filter(
            (_, index) => index !== selectedIndex
          ),
        });
      }
    }
  };
  useEffect(() => {
    if (operators.length === 0) fetchCallRoles();
    if (operatorGroup.length === 0) fetchOperatorGroup();
  }, []);

  useEffect(() => {
    if (selectedIvr && selectedIvr.length > 0) {
      if (selectedIvr?.[0].greetLongAttachment !== null) {
        fetchSelectedAttachment({
          id: selectedIvr?.[0].greetLongAttachment.id,
          onSuccessCallback: ({ data }) => {
            setLongAttachment([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: { id: selectedIvr?.[0].greetLongAttachment.id },
                },
              },
            ]);
            setFieldsValue({
              longGreet: selectedIvr?.[0].greetLongAttachment.id,
            });
            setLongList([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: { id: selectedIvr?.[0].greetLongAttachment.id },
                },
              },
            ]);
          },
        });
      } else {
        setLongAttachment(null);
        setLongList([]);
      }
      if (selectedIvr?.[0].greetShortAttachment !== null) {
        fetchSelectedAttachment({
          id: selectedIvr?.[0].greetShortAttachment.id,
          onSuccessCallback: ({ data }) => {
            setShortAttachment([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: { id: selectedIvr?.[0].greetShortAttachment.id },
                },
              },
            ]);
            setShortList([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: { id: selectedIvr?.[0].greetShortAttachment.id },
                },
              },
            ]);
          },
        });
      } else {
        setShortAttachment(null);
        setShortList([]);
      }
      if (selectedIvr?.[0].invalidSoundAttachment !== null) {
        fetchSelectedAttachment({
          id: selectedIvr?.[0].invalidSoundAttachment.id,
          onSuccessCallback: ({ data }) => {
            set??nvalidAttachment([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: { id: selectedIvr?.[0].invalidSoundAttachment.id },
                },
              },
            ]);
            set??nvalidList([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: { id: selectedIvr?.[0].invalidSoundAttachment.id },
                },
              },
            ]);
          },
        });
      } else {
        set??nvalidAttachment(null);
        set??nvalidList([]);
      }
      const arr = [];
      selectedIvr[0].actions.map(item =>
        arr.push({
          button: item.digit,
          action: item.action,
          operator:
            item.action === 'operator'
              ? item?.operator?.id
              : item?.callcenter?.id,
        })
      );
      setArrRow(arr);
      setFieldsValue({
        IVRname: selectedIvr?.[0].name,
        pauseNumber: selectedIvr?.[0].interDigitTimeout,
        pause: selectedIvr?.[0].timeout,
        numberLength: selectedIvr?.[0].digitLength,
        fail: selectedIvr?.[0].maxFailures,
      });
    } else {
      set??nvalidAttachment(null);
      set??nvalidList([]);
      setLongAttachment(null);
      setLongList([]);
      setShortAttachment(null);
      setShortList([]);
      setNumbersRow([undefined]);

      setFieldsValue({
        IVRname: null,
        pauseNumber: 2000,
        pause: 10000,
        numberLength: 4,
        fail: 3,
        longGreet: null,
        numbers: [
          { button: undefined, action: undefined, operator: undefined },
        ],
      });
      setArrRow(undefined);
    }
  }, [selectedIvr]);
  useEffect(() => {
    if (arrRow) {
      setFieldsValue({
        numbers: arrRow,
      });
    } else {
      setFieldsValue({
        numbers: [
          { button: undefined, action: undefined, operator: undefined },
        ],
      });
    }
  }, [arrRow]);

  const digits = [
    { id: '1', name: '1' },
    { id: '2', name: '2' },
    { id: '3', name: '3' },
    { id: '4', name: '4' },
    { id: '5', name: '5' },
    { id: '6', name: '6' },
    { id: '7', name: '7' },
    { id: '8', name: '8' },
    { id: '9', name: '9' },
    { id: '0', name: '0' },
    { id: '*', name: '*' },
  ];
  const uploadLongProps = {
    accept: '.mp3',
    headers: {
      'X-AUTH-PROTOKEN': token,
    },
    action: `${url}/attachments`,
    multiple: false,
    onChange: onLongFileChange,
    onDownload: onFileDownload,
    showUploadList: {
      showDownloadIcon: true,
    },
  };
  function onFileDownload(file) {
    handleFileDownload(file?.response?.data?.id);
  }
  function onLongFileRemove(file) {
    setLongList('');
    setLongAttachment(null);
    setFieldsValue({
      longGreet: undefined,
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
  function onLongFileChange({ file, fileList }) {
    fileList = fileList.slice(-1);
    if (fileList.length === 0) {
      setLongAttachment('');
      setLongList(fileList);
    }
    if (fileList[0] && fileList[0].status === 'error') {
      if (fileList[0] && fileList[0]?.error?.status === 401) {
        setLongList(
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
                setLongAttachment(
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
                setLongList(
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
        setLongList(fileList);
      }
    } else if (fileList[0] && fileList[0].status === 'uploading') {
      setLongList(fileList);
    } else if (fileList[0] && fileList[0].status === 'done') {
      setLongAttachment(fileList);
      setLongList(fileList);
    }
  }
  const uploadShortProps = {
    accept: '.mp3',
    headers: {
      'X-AUTH-PROTOKEN': token,
    },
    action: `${url}/attachments`,
    multiple: false,
    onChange: onShortFileChange,
    onDownload: onFileDownload,
    showUploadList: {
      showDownloadIcon: true,
    },
  };
  function onShortFileRemove(file) {
    setShortList('');
    setShortAttachment(null);
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
  function onShortFileChange({ file, fileList }) {
    fileList = fileList.slice(-1);
    if (fileList.length === 0) {
      setShortList(fileList);
    }
    if (fileList[0] && fileList[0].status === 'error') {
      if (fileList[0] && fileList[0]?.error?.status === 401) {
        setShortList(
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
                setShortAttachment(
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
                setShortList(
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
        setShortList(fileList);
      }
    } else if (fileList[0] && fileList[0].status === 'uploading') {
      setShortList(fileList);
    } else if (fileList[0] && fileList[0].status === 'done') {
      setShortAttachment(fileList);
      setShortList(fileList);
    }
  }
  const upload??nvalidProps = {
    accept: '.mp3',
    headers: {
      'X-AUTH-PROTOKEN': token,
    },
    action: `${url}/attachments`,
    multiple: false,
    onChange: on??nvalidFileChange,
    onDownload: onFileDownload,
    showUploadList: {
      showDownloadIcon: true,
    },
  };
  function on??nvalidFileRemove(file) {
    set??nvalidList('');
    set??nvalidAttachment(null);
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
  function on??nvalidFileChange({ file, fileList }) {
    fileList = fileList.slice(-1);
    if (fileList.length === 0) {
      set??nvalidList(fileList);
    }
    if (fileList[0] && fileList[0].status === 'error') {
      if (fileList[0] && fileList[0]?.error?.status === 401) {
        set??nvalidList(
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
                set??nvalidAttachment(
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
                set??nvalidList(
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
        set??nvalidList(fileList);
      }
    } else if (fileList[0] && fileList[0].status === 'uploading') {
      set??nvalidList(fileList);
    } else if (fileList[0] && fileList[0].status === 'done') {
      set??nvalidAttachment(fileList);
      set??nvalidList(fileList);
    }
  }
  function beforeUpload(file) {
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
      message.error('H??cmi 1MB-dan ??ox olmamal??d??r!');
    }
    return isLt2M;
  }
  const handleExpenseSubmit = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const {
          IVRname,
          pauseNumber,
          pause,
          numberLength,
          fail,
          numbers,
        } = values;
        const newIvr = {
          name: IVRname,
          interDigitTimeout: Number(pauseNumber),
          timeout: Number(pause),
          digitLength: Number(numberLength),
          maxFailures: Number(fail),
          greetLongAttachment: longAttachment[0]?.response?.data?.id,
          greetShortAttachment:
            shortAttachment !== null
              ? shortAttachment[0]?.response?.data?.id
              : null,
          invalidSoundAttachment:
            invalidAttachment !== null
              ? invalidAttachment[0]?.response?.data?.id
              : null,
          actions: numbers.map(({ action, button, operator }) => ({
            digit: button,
            action,
            operator: action === 'operator' ? operator : null,
            callcenter: action === 'callcenter' ? operator : null,
          })),
        };
        if (selectedIvr && selectedIvr.length > 0) {
          editIvr(
            selectedId,
            newIvr,
            () => {
              toggleRoleModal();
              deletedFiels.map(item => {
                handleFileDelete(item);
              });
              fetchIvr();
              resetFields();
              setLongList([]);
              setShortList([]);
              set??nvalidList([]);
            },
            ({ error }) => {
              if (
                error?.response?.data?.error?.type ===
                'ivr.update.duplicate.name'
              ) {
                setFields({
                  IVRname: {
                    value: getFieldValue('IVRname'),
                    errors: [new Error('Bu adl?? IVR art??q m??vcuddur')],
                  },
                });
              }
            }
          );
        } else {
          createIvr(
            newIvr,
            () => {
              toast.success('??m??liyyat u??urla tamamland??.');
              toggleRoleModal();
              deletedFiels.map(item => {
                handleFileDelete(item);
              });
              fetchIvr();
              resetFields();
              setLongList([]);
              setShortList([]);
              set??nvalidList([]);
            },
            ({ error }) => {
              if (
                error?.response?.data?.error?.type ===
                'ivr.create.duplicate.name'
              ) {
                setFields({
                  IVRname: {
                    value: getFieldValue('IVRname'),
                    errors: [new Error('Bu adl?? IVR art??q m??vcuddur')],
                  },
                });
              }
            }
          );
        }
      }
    });
  };
  return (
    <div className={styles.UpdateRole}>
      <h2>
        {selectedIvr && selectedIvr.length > 0
          ? 'D??z??li?? et'
          : 'Yeni IVR ??lav?? et'}
      </h2>
      <Spin spinning={selectedId ? isLoading : false}>
        <Form onSubmit={event => handleExpenseSubmit(event)}>
          <ProFormItem
            label="IVR ad??"
            customStyle={styles.formItem}
            help={getFieldError('IVRname')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('IVRname', {
              rules: [requiredRule],
            })(<Input size="large" placeholder="Yaz??n" />)}
          </ProFormItem>
          <SettingsCollapse
            className={styles.ivrCollapse}
            style={{ margin: 0, padding: 0 }}
            accordion={false}
            defaultActiveKey={['1', '2', '3']}
          >
            <SettingsPanel
              style={{ margin: '0 0 10px 0', padding: 0 }}
              header={<p className={styles.ivrHeader}>T??nziml??m??l??r</p>}
              key={1}
            >
              <Row gutter={6}>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>
                          R??q??ml??r aras?? fasil??
                        </p>
                        <Tooltip title="Bir se??im ??????n g??zl??nil??c??k milisaniy?? d??y??ri">
                          <MdInfo
                            style={{
                              color: '#464A4B',
                            }}
                            size={20}
                          />
                        </Tooltip>
                      </>
                    }
                    customStyle={styles.formItem}
                    help={getFieldError('pauseNumber')?.[0]}
                  >
                    {getFieldDecorator('pauseNumber', {
                      getValueFromEvent: event => {
                        if (
                          re.test(event.target.value) &&
                          event.target.value <= 10000000
                        ) {
                          return event.target.value;
                        }
                        if (event.target.value === '') {
                          return null;
                        }
                        return getFieldValue(`pauseNumber`);
                      },
                      rules: [requiredRule],
                    })(<Input size="large" placeholder="Yaz??n (ms)" />)}
                  </ProFormItem>
                </Col>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>Fasil??</p>
                        <Tooltip title="S??s yaz??s?? bitdikd??n sonra g??zl??nil??c??k milisaniy?? d??y??ri">
                          <MdInfo
                            style={{
                              color: '#464A4B',
                            }}
                            size={20}
                          />
                        </Tooltip>
                      </>
                    }
                    customStyle={styles.formItem}
                    help={getFieldError('pause')?.[0]}
                  >
                    {getFieldDecorator('pause', {
                      getValueFromEvent: event => {
                        if (
                          re.test(event.target.value) &&
                          event.target.value <= 10000000
                        ) {
                          return event.target.value;
                        }
                        if (event.target.value === '') {
                          return null;
                        }
                        return getFieldValue(`pause`);
                      },
                      rules: [requiredRule],
                    })(<Input size="large" placeholder="Yaz??n (ms)" />)}
                  </ProFormItem>
                </Col>
              </Row>
              <Row gutter={6}>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>R??q??m uzunlu??u</p>
                        <Tooltip title="Uy??un bir menyu giri??ini axtarmadan ??vv??l daxil edilm??li olan maksimum r??q??m say??">
                          <MdInfo
                            style={{
                              color: '#464A4B',
                            }}
                            size={20}
                          />
                        </Tooltip>
                      </>
                    }
                    customStyle={styles.formItem}
                    help={getFieldError('numberLength')?.[0]}
                  >
                    {getFieldDecorator('numberLength', {
                      getValueFromEvent: event => {
                        if (
                          re.test(event.target.value) &&
                          event.target.value <= 10000000
                        ) {
                          return event.target.value;
                        }
                        if (event.target.value === '') {
                          return null;
                        }
                        return getFieldValue(`numberLength`);
                      },
                      rules: [requiredRule],
                    })(<Input size="large" placeholder="Yaz??n" />)}
                  </ProFormItem>
                </Col>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>
                          Maksimum u??ursuz c??hd say??
                        </p>
                        <Tooltip title="Menyunu bitirm??d??n ??nc?? daxil edil?? bil??c??k maksimum u??ursuz c??hd say??">
                          <MdInfo
                            style={{
                              color: '#464A4B',
                            }}
                            size={20}
                          />
                        </Tooltip>
                      </>
                    }
                    customStyle={styles.formItem}
                    help={getFieldError('fail')?.[0]}
                  >
                    {getFieldDecorator('fail', {
                      getValueFromEvent: event => {
                        if (
                          re.test(event.target.value) &&
                          event.target.value <= 10000000
                        ) {
                          return event.target.value;
                        }
                        if (event.target.value === '') {
                          return null;
                        }
                        return getFieldValue(`fail`);
                      },
                      rules: [requiredRule],
                    })(<Input size="large" placeholder="Yaz??n" />)}
                  </ProFormItem>
                </Col>
              </Row>
            </SettingsPanel>
            <SettingsPanel
              style={{ margin: '0 0 10px 0', padding: 0 }}
              header={<p className={styles.ivrHeader}>S??s yaz??lar??</p>}
              key={2}
            >
              <ProFormItem
                label={
                  <>
                    <p className={styles.labelText}>Uzun salamlama</p>
                    <Tooltip title="Menyuya ilk d??f?? daxil olduqda s??sl??n??c??k s??s yaz??s??">
                      <MdInfo
                        style={{
                          color: '#464A4B',
                        }}
                        size={20}
                      />
                    </Tooltip>
                  </>
                }
                customStyle={styles.formItem}
                help={getFieldError('longGreet')?.[0]}
                style={{ height: '80px' }}
              >
                {getFieldDecorator('longGreet', {
                  rules: [requiredRule],
                })(
                  <div className={styles.customUpload}>
                    <Upload
                      {...uploadLongProps}
                      onRemove={onLongFileRemove}
                      beforeUpload={beforeUpload}
                      fileList={longList}
                    >
                      <ProButton style={{ margin: '0 10px' }}>
                        Fayl ??lav?? et
                      </ProButton>{' '}
                      {/* v?? ya{' '}
                      <MdKeyboardVoice
                        style={{ fontSize: '26px', marginLeft: '10px' }}
                      /> */}
                    </Upload>
                  </div>
                )}
              </ProFormItem>
              <ProFormItem
                label={
                  <>
                    <p className={styles.labelText}>Q??sa salamlama</p>
                    <Tooltip title="Menyu d??vr etdikd??, ilk s??sl??n??n s??sin daha q??sa hal??">
                      <MdInfo
                        style={{
                          color: '#464A4B',
                        }}
                        size={20}
                      />
                    </Tooltip>
                  </>
                }
                customStyle={styles.formItem}
                help={getFieldError('shortGreet')?.[0]}
                style={{ height: '80px' }}
              >
                {getFieldDecorator('shortGreet', {
                  rules: [],
                })(
                  <div className={styles.customUpload}>
                    <Upload
                      {...uploadShortProps}
                      onRemove={onShortFileRemove}
                      beforeUpload={beforeUpload}
                      fileList={shortList}
                    >
                      <ProButton style={{ margin: '0 10px' }}>
                        Fayl ??lav?? et
                      </ProButton>{' '}
                      {/* v?? ya{' '}
                      <MdKeyboardVoice
                        style={{ fontSize: '26px', marginLeft: '10px' }}
                      /> */}
                    </Upload>
                  </div>
                )}
              </ProFormItem>
              <ProFormItem
                label={
                  <>
                    <p className={styles.labelText}>Yanl????</p>
                    <Tooltip title="Giri?? edilm??dikd?? v?? ya etibars??z giri?? edildikd?? s??sl??n??c??k s??s yaz??s??">
                      <MdInfo
                        style={{
                          color: '#464A4B',
                        }}
                        size={20}
                      />
                    </Tooltip>
                  </>
                }
                customStyle={styles.formItem}
                help={getFieldError('invalid')?.[0]}
                style={{ height: '80px' }}
              >
                {getFieldDecorator('invalid', {
                  rules: [],
                })(
                  <div className={styles.customUpload}>
                    <Upload
                      {...upload??nvalidProps}
                      onRemove={on??nvalidFileRemove}
                      beforeUpload={beforeUpload}
                      fileList={invalidList}
                    >
                      <ProButton style={{ margin: '0 10px' }}>
                        Fayl ??lav?? et
                      </ProButton>{' '}
                      {/* v?? ya{' '}
                      <MdKeyboardVoice
                        style={{ fontSize: '26px', marginLeft: '10px' }}
                      /> */}
                    </Upload>
                  </div>
                )}
              </ProFormItem>
            </SettingsPanel>
            <SettingsPanel
              className={styles.lastRow}
              style={{ margin: '0 0 10px 0', padding: 0 }}
              header={
                <p className={styles.ivrHeader}>D??ym??l??rin t??nziml??m??si</p>
              }
              key={3}
            >
              {selectedIvr && selectedIvr.length > 0
                ? arrRow?.map((numbers, index) => (
                    <Row>
                      <Col style={{ padding: '2px' }} span={6}>
                        <ProFormItem
                          label="D??ym??"
                          customStyle={styles.formItem}
                          help={getFieldError(`numbers[${index}].button`)?.[0]}
                        >
                          {getFieldDecorator(`numbers[${index}].button`, {
                            rules: [requiredRule],
                          })(
                            <ProSelect
                              data={
                                getFieldValue('numbers').length > 0
                                  ? digits.filter(
                                      ({ id }) =>
                                        !getFieldValue('numbers')
                                          ?.map(({ button }) => button)
                                          .includes(id)
                                    )
                                  : digits
                              }
                            />
                          )}
                        </ProFormItem>
                      </Col>
                      <Col style={{ padding: '2px' }} span={6}>
                        <ProFormItem
                          label="??stiqam??t"
                          customStyle={styles.formItem}
                          help={getFieldError(`numbers[${index}].action`)?.[0]}
                        >
                          {getFieldDecorator(`numbers[${index}].action`, {
                            getValueFromEvent: category => {
                              setFieldsValue({
                                numbers: getFieldValue('numbers').map(
                                  (number, numberIndex) =>
                                    numberIndex === index
                                      ? { ...number, operator: undefined }
                                      : number
                                ),
                              });
                              return category;
                            },
                            rules: [requiredRule],
                          })(
                            <ProSelect
                              style={{ padding: 0 }}
                              data={[
                                { id: 'operator', name: 'Operator' },
                                {
                                  id: 'callcenter',
                                  name: 'Operator qrupu',
                                },
                              ]}
                            />
                          )}
                        </ProFormItem>
                      </Col>
                      <Col style={{ padding: '2px' }} span={10}>
                        <ProFormItem
                          label="Q??bul ed??n"
                          customStyle={styles.formItem}
                          help={
                            getFieldError(`numbers[${index}].operator`)?.[0]
                          }
                        >
                          {getFieldDecorator(`numbers[${index}].operator`, {
                            rules: [requiredRule],
                          })(
                            <ProSelect
                              data={
                                getFieldValue(`numbers[${index}].action`) ===
                                'operator'
                                  ? [
                                      ...operators.map(operator => ({
                                        ...operator,
                                        id: operator.operator?.id,
                                        name: `${
                                          operator.operator
                                            ?.prospectTenantPerson?.name
                                        } ${
                                          operator.operator
                                            ?.prospectTenantPerson?.lastName
                                            ? operator.operator
                                                ?.prospectTenantPerson?.lastName
                                            : ''
                                        } (${operator.operator?.number})`,
                                      })),
                                    ]
                                  : getFieldValue(
                                      `numbers[${index}].action`
                                    ) === 'callcenter'
                                  ? operatorGroup
                                  : []
                              }
                            />
                          )}
                        </ProFormItem>
                      </Col>
                      <Col span={2}>
                        <ProFormItem label=" ">
                          <div
                            style={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {index === 0 ? (
                              <PlusIcon
                                color="#FF716A"
                                style={{ cursor: 'pointer' }}
                                onClick={() =>
                                  handleAddExpenseClick('add', index)
                                }
                              />
                            ) : (
                              <MinusIcon
                                color="#FF716A"
                                style={{ cursor: 'pointer' }}
                                onClick={async v => {
                                  handleAddExpenseClick('remove', index);
                                }}
                              />
                            )}
                          </div>
                        </ProFormItem>
                      </Col>
                    </Row>
                  ))
                : numbersRow.map((numbers, index) => (
                    <Row>
                      <Col style={{ padding: '2px' }} span={6}>
                        <ProFormItem
                          label="D??ym??"
                          customStyle={styles.formItem}
                          help={getFieldError(`numbers[${index}].button`)?.[0]}
                        >
                          {getFieldDecorator(`numbers[${index}].button`, {
                            rules: [requiredRule],
                          })(
                            <ProSelect
                              data={
                                getFieldValue('numbers').length > 0
                                  ? digits.filter(
                                      ({ id }) =>
                                        !getFieldValue('numbers')
                                          ?.map(({ button }) => button)
                                          .includes(id)
                                    )
                                  : digits
                              }
                            />
                          )}
                        </ProFormItem>
                      </Col>
                      <Col style={{ padding: '2px' }} span={6}>
                        <ProFormItem
                          label="??stiqam??t"
                          customStyle={styles.formItem}
                          help={getFieldError(`numbers[${index}].action`)?.[0]}
                        >
                          {getFieldDecorator(`numbers[${index}].action`, {
                            getValueFromEvent: category => {
                              setFieldsValue({
                                numbers: getFieldValue('numbers').map(
                                  (number, numberIndex) =>
                                    numberIndex === index
                                      ? { ...number, operator: undefined }
                                      : number
                                ),
                              });
                              return category;
                            },
                            rules: [requiredRule],
                          })(
                            <ProSelect
                              style={{ padding: 0 }}
                              data={[
                                { id: 'operator', name: 'Operator' },
                                {
                                  id: 'callcenter',
                                  name: 'Operator qrupu',
                                },
                              ]}
                            />
                          )}
                        </ProFormItem>
                      </Col>
                      <Col style={{ padding: '2px' }} span={10}>
                        <ProFormItem
                          label="Q??bul ed??n"
                          customStyle={styles.formItem}
                          help={
                            getFieldError(`numbers[${index}].operator`)?.[0]
                          }
                        >
                          {getFieldDecorator(`numbers[${index}].operator`, {
                            rules: [requiredRule],
                          })(
                            <ProSelect
                              data={
                                getFieldValue(`numbers[${index}].action`) ===
                                'operator'
                                  ? [
                                      ...operators.map(operator => ({
                                        ...operator,
                                        id: operator.operator?.id,
                                        name: `${
                                          operator.operator
                                            ?.prospectTenantPerson?.name
                                        } ${
                                          operator.operator
                                            ?.prospectTenantPerson?.lastName
                                            ? operator.operator
                                                ?.prospectTenantPerson?.lastName
                                            : ''
                                        } (${operator.operator?.number})`,
                                      })),
                                    ]
                                  : getFieldValue(
                                      `numbers[${index}].action`
                                    ) === 'callcenter'
                                  ? operatorGroup
                                  : []
                              }
                            />
                          )}
                        </ProFormItem>
                      </Col>
                      <Col span={2}>
                        <ProFormItem label=" ">
                          <div
                            style={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {index === 0 ? (
                              <PlusIcon
                                color="#FF716A"
                                style={{ cursor: 'pointer' }}
                                onClick={() =>
                                  handleAddExpenseClick('add', index)
                                }
                              />
                            ) : (
                              <MinusIcon
                                color="#FF716A"
                                style={{ cursor: 'pointer' }}
                                onClick={async v => {
                                  handleAddExpenseClick('remove', index);
                                }}
                              />
                            )}
                          </div>
                        </ProFormItem>
                      </Col>
                    </Row>
                  ))}
            </SettingsPanel>
          </SettingsCollapse>
          {/* <AddButton
            // loading={creatingExpenseCatalog}
            htmlType="submit"
            label="T??sdiq et"
          /> */}
          <ProButton htmlType="submit" style={{ marginRight: '10px' }}>
            T??sdiq et
          </ProButton>
          <ProButton onClick={toggleRoleModal} type="danger">
            L????v et
          </ProButton>
        </Form>
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  operators: state.callRolesReducer.operators,
  isLoading: state.loadings.fetchSelectedIvr,
  operatorGroup: state.OperatorGroupReducer.operatorGroup,
});

export default connect(
  mapStateToProps,
  {
    fetchCallRoles,
    createIvr,
    fetchIvr,
    editIvr,
    fetchSelectedAttachment,
    fetchOperatorGroup,
    fetchNewCallToken,
  }
)(Form.create({ name: 'IvrForm' })(AddIvr));
