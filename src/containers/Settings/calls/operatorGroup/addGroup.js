import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import {
  Input,
  Form,
  Upload,
  Row,
  Col,
  Tooltip,
  message,
  Spin,
  Button,
  Radio,
} from 'antd';
import { MdInfo, MdKeyboardVoice } from 'react-icons/md';
import { requiredRule } from 'utils/rules';
import {
  ProSelect,
  ProFormItem,
  ProButton,
  SettingsCollapse,
  SettingsPanel,
} from 'components/Lib';
import { cookies } from 'utils/cookies';
import { toast } from 'react-toastify';
import { fetchNewCallToken } from 'store/actions/profile';
import { fetchCallRoles } from 'store/actions/settings/call-roles';
import { fetchSelectedAttachment } from 'store/actions/settings/ivr';
import {
  createOperatorGroup,
  editOperatorGroup,
  fetchOperatorGroup,
} from 'store/actions/settings/operatorGroup';
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
const AddGroup = props => {
  const {
    form,
    fetchCallRoles,
    fetchNewCallToken,
    fetchSelectedAttachment,
    operators,
    toggleRoleModal,
    createOperatorGroup,
    editOperatorGroup,
    fetchOperatorGroup,
    isLoading,
    selectedOperatorGroup,
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
  const [longList, setLongList] = useState([]);
  const [longAttachment, setLongAttachment] = useState(null);
  const [newSelectedOperators, setNewSelectedOperators] = useState([]);
  const [deletedFiels, setDeletedFiels] = useState([]);
  const handleFileDelete = id =>
    axios.delete(`${url}/attachments/${id}`).then(function(response) {
      setDeletedFiels([]);
    });
  useEffect(() => {
    if (operators.length === 0) fetchCallRoles();
  }, []);
  useEffect(() => {
    if (getFieldValue('callStrategy') === 3) {
      if (selectedOperatorGroup && selectedOperatorGroup.length > 0) {
        setFieldsValue({
          ringProgressivelyDelay:
            selectedOperatorGroup?.[0].ringProgressivelyDelayTime || 10,
        });
      } else {
        setFieldsValue({
          ringProgressivelyDelay: 10,
        });
      }
    }
  }, [getFieldValue('callStrategy')]);

  useEffect(() => {
    setFieldsValue({
      Groupname: null,
      wrapUpTime: 10,
      callTime: 10,
      notAnsweredPause: 10,
      fail: 10,
      callStrategy: 1,
      ringProgressivelyDelay: 10,
      operators: undefined,
    });
    setNewSelectedOperators([]);
  }, []);
  useEffect(() => {
    if (selectedOperatorGroup && selectedOperatorGroup.length > 0) {
      if (selectedOperatorGroup?.[0].mohSoundAttachment !== null) {
        fetchSelectedAttachment({
          id: selectedOperatorGroup?.[0].mohSoundAttachment.id,
          onSuccessCallback: ({ data }) => {
            setLongAttachment([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: {
                    id: selectedOperatorGroup?.[0].mohSoundAttachment.id,
                  },
                },
              },
            ]);
            setFieldsValue({
              longGreet: selectedOperatorGroup?.[0].mohSoundAttachment.id,
            });
            setLongList([
              {
                uid: '-1',
                status: 'done',
                name: data.originalName,
                response: {
                  data: {
                    id: selectedOperatorGroup?.[0].mohSoundAttachment.id,
                  },
                },
              },
            ]);
          },
        });
      } else {
        setLongAttachment(null);
        setLongList([]);
      }
      setFieldsValue({
        Groupname: selectedOperatorGroup?.[0].name,
        wrapUpTime: selectedOperatorGroup?.[0].wrapUpTime,
        callTime: selectedOperatorGroup?.[0].legTimeout,
        notAnsweredPause: selectedOperatorGroup?.[0].noAnswerDelayTime,
        fail: selectedOperatorGroup?.[0].rejectDelayTime,
        callStrategy:
          selectedOperatorGroup?.[0].strategy === 'round-robin'
            ? 1
            : selectedOperatorGroup?.[0].strategy === 'top-down'
            ? 2
            : selectedOperatorGroup?.[0].strategy === 'ring-progressively'
            ? 3
            : 4,
        operators: selectedOperatorGroup?.[0].agents.map(agent => ({
          key: agent?.id,
          label: `${agent?.prospectTenantPerson?.name} ${
            agent?.prospectTenantPerson?.lastName
              ? agent?.prospectTenantPerson?.lastName
              : ''
          } (${agent?.number})`,
        })),
      });
    } else {
      setLongAttachment(null);
      setLongList([]);
      setFieldsValue({
        callStrategy: 1,
        Groupname: null,
        wrapUpTime: 10,
        callTime: 10,
        notAnsweredPause: 10,
        fail: 10,
        ringProgressivelyDelay: 10,
        longGreet: null,
        operators: undefined,
      });
      setNewSelectedOperators([]);
    }
  }, [selectedOperatorGroup]);

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
          Groupname,
          callStrategy,
          ringProgressivelyDelay,
          wrapUpTime,
          callTime,
          notAnsweredPause,
          fail,
          operators,
        } = values;

        const newIvr = {
          name: Groupname,
          strategy:
            callStrategy === 1
              ? 'round-robin'
              : callStrategy === 2
              ? 'top-down'
              : callStrategy === 3
              ? 'ring-progressively'
              : 'ring-all',
          wrapUpTime: Number(wrapUpTime) || 0,
          legTimeout: callStrategy === 3 ? 0 : Number(callTime),
          noAnswerDelayTime: Number(notAnsweredPause) || 0,
          rejectDelayTime: Number(fail) || 0,
          ringProgressivelyDelayTime: Number(ringProgressivelyDelay) || null,
          mohSoundAttachment: longAttachment[0]?.response?.data?.id,
          agents: operators?.map(operator => operator?.key),
        };
        if (selectedOperatorGroup && selectedOperatorGroup.length > 0) {
          editOperatorGroup(
            selectedId,
            newIvr,
            ({ data }) => {
              toggleRoleModal();
              deletedFiels.map(item => {
                handleFileDelete(item);
              });
              fetchOperatorGroup();
              resetFields();
              setLongList([]);
              setFieldsValue({
                callStrategy: 1,
                Groupname: null,
                wrapUpTime: 10,
                callTime: 10,
                notAnsweredPause: 10,
                fail: 10,
                ringProgressivelyDelay: 10,
                operators: undefined,
              });
            },
            ({ error }) => {
              if (
                error?.response?.data?.error?.type ===
                'callcenter.update.duplicate.name'
              ) {
                setFields({
                  Groupname: {
                    value: getFieldValue('Groupname'),
                    errors: [new Error('Bu adl?? qrup art??q m??vcuddur.')],
                  },
                });
              }
              if (
                error?.response?.data?.error?.type ===
                'callcenter.update.required.ringProgressivelyDelayTime'
              ) {
                setFields({
                  ringProgressivelyDelay: {
                    value: getFieldValue('ringProgressivelyDelay'),
                    errors: [new Error('Bu d??y??r 0-dan ??ox olmal??d??r')],
                  },
                });
              }
            }
          );
        } else {
          createOperatorGroup(
            newIvr,
            ({ data }) => {
              toast.success('??m??liyyat u??urla tamamland??.');
              toggleRoleModal();
              deletedFiels.map(item => {
                handleFileDelete(item);
              });
              fetchOperatorGroup();
              resetFields();
              setLongList([]);
              setFieldsValue({
                callStrategy: 1,
                Groupname: null,
                wrapUpTime: 10,
                callTime: 10,
                notAnsweredPause: 10,
                fail: 10,
                ringProgressivelyDelay: 10,
                operators: undefined,
              });
            },
            ({ error }) => {
              if (
                error?.response?.data?.error?.type ===
                'callcenter.create.duplicate.name'
              ) {
                setFields({
                  Groupname: {
                    value: getFieldValue('Groupname'),
                    errors: [new Error('Bu adl?? qrup art??q m??vcuddur.')],
                  },
                });
              }
              if (
                error?.response?.data?.error?.type ===
                'callcenter.create.required.ringProgressivelyDelayTime'
              ) {
                setFields({
                  ringProgressivelyDelay: {
                    value: getFieldValue('ringProgressivelyDelay'),
                    errors: [new Error('Bu d??y??r 0-dan ??ox olmal??d??r')],
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
        {selectedOperatorGroup && selectedOperatorGroup.length > 0
          ? 'D??z??li?? et'
          : 'Yeni qrup ??lav?? et'}
      </h2>
      <Spin spinning={selectedId ? isLoading : false}>
        <Form onSubmit={event => handleExpenseSubmit(event)}>
          <ProFormItem
            label="Qrupun ad??"
            customStyle={styles.formItem}
            help={getFieldError('Groupname')?.[0]}
            style={{ height: '80px' }}
          >
            {getFieldDecorator('Groupname', {
              rules: [requiredRule],
            })(<Input size="large" placeholder="Yaz??n" />)}
          </ProFormItem>
          <ProFormItem
            required
            help={getFieldError('callStrategy')?.[0]}
            label="Z??ng strategiyas??"
          >
            {getFieldDecorator('callStrategy', {
              rules: [],
            })(
              <Radio.Group
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <Radio
                  value={1}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className={styles.labelText}>Dair??vi</p>
                    <Tooltip title="Son z??ng daxil olan operatoru yadda saxlay??r v?? ona z??ng y??nl??ndirilmir amma dig??r operatorlara z??ng daxil olur.">
                      <MdInfo
                        style={{
                          color: '#464A4B',
                        }}
                        size={20}
                      />
                    </Tooltip>
                  </div>
                </Radio>
                <Radio
                  value={2}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className={styles.labelText}>Ard??c??ll??qla</p>
                    <Tooltip title="Operatorlara z??ng ard??c??ll??qla daxil olur.">
                      <MdInfo
                        style={{
                          color: '#464A4B',
                        }}
                        size={20}
                      />
                    </Tooltip>
                  </div>
                </Radio>
                <Radio
                  value={3}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className={styles.labelText}>
                      ??nc??kini yadda saxlamaqla ard??c??ll??qla
                    </p>
                    <Tooltip title="Operatorlara z??ng ard??c??ll??qla daxil olur, amma bu zaman ??nc??ki operatorlara da z??ng daxil olma??a davam edir.">
                      <MdInfo
                        style={{
                          color: '#464A4B',
                        }}
                        size={20}
                      />
                    </Tooltip>
                  </div>
                </Radio>
                <Radio
                  value={4}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className={styles.labelText}>Ham??s??</p>
                    <Tooltip title="B??t??n operatorlara eyni anda z??ng daxil olur.">
                      <MdInfo
                        style={{
                          color: '#464A4B',
                        }}
                        size={20}
                      />
                    </Tooltip>
                  </div>
                </Radio>
              </Radio.Group>
            )}
          </ProFormItem>
          {getFieldValue('callStrategy') === 3 ? (
            <ProFormItem
              label={
                <>
                  <p className={styles.labelText}>
                    ??nc??kini yadda saxlayaraq, ard??c??l z??ngl??r aras??nda fasil??
                  </p>
                  <Tooltip title="Arad??c??l z??ngl??r aras??ndak?? g??zl??nil??c??k saniy?? d??y??ri">
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
              help={getFieldError('ringProgressivelyDelay')?.[0]}
            >
              {getFieldDecorator('ringProgressivelyDelay', {
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
                  return getFieldValue(`ringProgressivelyDelay`);
                },
                rules: [requiredRule],
              })(<Input size="large" placeholder="Yaz??n (san)" />)}
            </ProFormItem>
          ) : null}
          <ProFormItem
            label={
              <>
                <p className={styles.labelText}>G??zl??m?? musiqisi</p>
                <Tooltip title="Operatorlar??n z??ng?? cavab verm??sini g??zl??y??n zaman s??sl??n??c??k musiqi">
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
          <SettingsCollapse
            className={styles.ivrCollapse}
            style={{ margin: 0, padding: 0 }}
            accordion={false}
            defaultActiveKey={['1']}
          >
            <SettingsPanel
              style={{ margin: '0 0 10px 0', padding: 0 }}
              header={
                <p className={styles.ivrHeader}>Operator t??nziml??m??l??ri</p>
              }
              key={1}
            >
              <Row gutter={6}>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>
                          Ard??c??l z??ngl??r aras??ndak?? fasil??
                        </p>
                        <Tooltip title="Arad??c??l z??ngl??r aras??ndak?? g??zl??nil??c??k saniy?? d??y??ri">
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
                    help={getFieldError('wrapUpTime')?.[0]}
                  >
                    {getFieldDecorator('wrapUpTime', {
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
                        return getFieldValue(`wrapUpTime`);
                      },
                      rules: [],
                    })(<Input size="large" placeholder="Yaz??n (san)" />)}
                  </ProFormItem>
                </Col>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>
                          Z??ngin davam etm?? m??dd??ti
                        </p>
                        <Tooltip title="Bir operatora z??ngin daxil olma m??dd??tinin saniy?? d??y??ri">
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
                    help={getFieldError('callTime')?.[0]}
                  >
                    {getFieldDecorator('callTime', {
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
                        return getFieldValue(`callTime`);
                      },
                      rules: [requiredRule],
                    })(
                      <Input
                        disabled={getFieldValue('callStrategy') === 3}
                        size="large"
                        placeholder="Yaz??n (san)"
                      />
                    )}
                  </ProFormItem>
                </Col>
              </Row>
              <Row gutter={6}>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>
                          Cavabland??r??lmam???? z??ngd??n sonra fasil??
                        </p>
                        <Tooltip title="Cavabland??r??lmam???? z??ngd??n sonra g??zl??nil??c??k saniy?? d??y??ri">
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
                    help={getFieldError('notAnsweredPause')?.[0]}
                  >
                    {getFieldDecorator('notAnsweredPause', {
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
                        return getFieldValue(`notAnsweredPause`);
                      },
                      rules: [],
                    })(<Input size="large" placeholder="Yaz??n (san)" />)}
                  </ProFormItem>
                </Col>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>
                          R??dd edil??n z??ngd??n sonra fasil??
                        </p>
                        <Tooltip title="R??dd edilmi?? z??ngd??n sonra g??zl??nil??c??k saniy?? d??y??ri">
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
                      rules: [],
                    })(<Input size="large" placeholder="Yaz??n (san)" />)}
                  </ProFormItem>
                </Col>
              </Row>
              <ProFormItem
                label="Operatorlar"
                customStyle={styles.formItem}
                help={getFieldError('operators')?.[0]}
                style={{ height: '80px' }}
              >
                {getFieldDecorator('operators', {
                  rules: [requiredRule],
                })(
                  <ProSelect
                    mode="multiple"
                    labelInValue
                    // value={newSelectedOperators}
                    data={
                      getFieldValue('operators')?.length > 0
                        ? operators
                            .filter(
                              operator =>
                                !getFieldValue('operators')
                                  .map(
                                    newSelectedOperator =>
                                      newSelectedOperator?.key
                                  )
                                  .includes(operator?.operator?.id)
                            )
                            .map(operators => ({
                              ...operators,
                              id: operators?.operator?.id,
                              name: `${
                                operators?.operator?.prospectTenantPerson?.name
                              } ${
                                operators?.operator?.prospectTenantPerson
                                  ?.lastName
                                  ? operators?.operator?.prospectTenantPerson
                                      ?.lastName
                                  : ''
                              } (${operators.operator?.number})`,
                            }))
                        : [
                            ...operators.map(operator => ({
                              ...operator,
                              id: operator?.operator?.id,
                              name: `${
                                operator?.operator?.prospectTenantPerson?.name
                              } ${
                                operator?.operator?.prospectTenantPerson
                                  ?.lastName
                                  ? operator?.operator?.prospectTenantPerson
                                      ?.lastName
                                  : ''
                              } (${operator?.operator?.number})`,
                            })),
                          ]
                    }
                  />
                )}
              </ProFormItem>
            </SettingsPanel>
          </SettingsCollapse>
          <ProButton
            htmlType="submit"
            type="primary"
            style={{ marginRight: '10px' }}
          >
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
  isLoading: state.loadings.fetchSelectedOperatorGroup,
});

export default connect(
  mapStateToProps,
  {
    fetchCallRoles,
    createOperatorGroup,
    editOperatorGroup,
    fetchOperatorGroup,
    fetchSelectedAttachment,
    fetchNewCallToken,
  }
)(Form.create({ name: 'GroupForm' })(AddGroup));
