import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Form, Checkbox, Row, Col, Tooltip, Spin } from 'antd';
import { MdInfo } from 'react-icons/md';
import { requiredRule, dinamicMaxLengthRule } from 'utils/rules';
import { ProSelect, ProFormItem, ProButton } from 'components/Lib';
import { toast } from 'react-toastify';
import { fetchIvr } from 'store/actions/settings/ivr';
import {
    fetchGateways,
    createGateways,
    editGateways,
} from 'store/actions/settings/gateways';

import { checkSpaceinValue } from 'utils/inputValidations';
import { messages } from 'utils';

import styles from './styles.module.scss';

const { noWhitespaceMessage } = messages;

const whitespaceRule = {
    whitespace: true,
    message: noWhitespaceMessage,
    validator: (rule, value, callback) => {
        if (checkSpaceinValue(value)) {
            callback(true);
        } else {
            callback();
        }
    },
};

const nums = new RegExp('^[0-9]*$');

const AddSip = props => {
    const {
        form,
        fetchIvr,
        fetchGateways,
        ivr,
        editGateways,
        createGateways,
        actionLoading,
        selectedGateway,
        selectedId,
        toggleRoleModal,
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

    useEffect(() => {
        if (ivr.length === 0) fetchIvr();
    }, [fetchIvr, ivr.length]);

    useEffect(() => {
        if (selectedGateway && selectedGateway.length > 0) {
            setFieldsValue({
                name: selectedGateway[0]?.name,
                proxy: selectedGateway[0]?.proxy,
                username: selectedGateway[0]?.username,
                password: selectedGateway[0]?.password,
                register: selectedGateway[0]?.register,
                callerIdInFrom: selectedGateway[0]?.callerIdInFrom,
                realm: selectedGateway[0]?.realm,
                fromUser: selectedGateway[0]?.fromUser,
                fromDomain: selectedGateway[0]?.fromDomain,
                extension: selectedGateway[0]?.extension,
                outboundProxy: selectedGateway[0]?.outboundProxy,
                registerProxy: selectedGateway[0]?.registerProxy,
                expireSeconds: selectedGateway[0]?.expireSeconds,
                registerTransport:
                    selectedGateway[0]?.registerTransport || 'udp',
                retrySeconds: selectedGateway[0]?.retrySeconds,
                contactParams: selectedGateway[0]?.contactParams,
                ping: selectedGateway[0]?.ping,
                variables: selectedGateway[0]?.variables[0]?.name || undefined,
                direction:
                    selectedGateway[0]?.variables[0]?.direction || undefined,
                value: selectedGateway[0]?.variables[0]?.value || null,
                ivr: selectedGateway[0]?.ivr?.id || undefined,
            });
        } else {
            setFieldsValue({
                name: null,
                proxy: null,
                username: null,
                password: null,
                register: true,
                callerIdInFrom: true,
                realm: null,
                fromUser: null,
                fromDomain: null,
                extension: null,
                outboundProxy: null,
                registerProxy: null,
                expireSeconds: null,
                registerTransport: 'udp',
                retrySeconds: null,
                contactParams: null,
                ping: null,
                variables: undefined,
                direction: undefined,
                value: null,
                ivr: undefined,
            });
        }
    }, [selectedGateway, setFieldsValue]);

    const handleGatewaySubmit = event => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const data = {
                    name: values.name,
                    proxy: values.proxy,
                    username: values.username,
                    password: values.password,
                    register: values.register,
                    callerIdInFrom: values.callerIdInFrom,
                    realm: values.realm || null,
                    fromUser: values.fromUser || null,
                    fromDomain: values.fromDomain || null,
                    extension: values.extension || null,
                    outboundProxy: values.outboundProxy || null,
                    registerProxy: values.registerProxy || null,
                    expireSeconds: Number(values.expireSeconds) || null,
                    registerTransport: values.registerTransport,
                    retrySeconds: Number(values.retrySeconds) || null,
                    contactParams: values.contactParams || null,
                    ping: Number(values.ping) || null,
                    ivr: values.ivr || null,
                    variables: values.variables
                        ? [
                              {
                                  name: values.variables,
                                  direction: values.direction,
                                  value: values.value,
                              },
                          ]
                        : [],
                };
                if (selectedGateway && selectedGateway.length > 0) {
                    editGateways(
                        selectedId,
                        data,
                        () => {
                            toggleRoleModal();
                            fetchGateways();
                            fetchIvr();
                            // resetFields();
                        },
                        ({ error }) => {
                            if (
                                error?.response?.data?.error?.type ===
                                'gateway.create.duplicate.name'
                            ) {
                                setFields({
                                    name: {
                                        value: getFieldValue('name'),
                                        errors: [
                                            new Error(
                                                'Bu adlı SİP nömrə artıq mövcuddur'
                                            ),
                                        ],
                                    },
                                });
                            }
                        }
                    );
                } else {
                    createGateways(
                        data,
                        () => {
                            toast.success('Əməliyyat uğurla tamamlandı.');
                            toggleRoleModal();

                            fetchGateways();
                            fetchIvr();
                            // resetFields();
                        },
                        ({ error }) => {
                            if (
                                error?.response?.data?.error?.type ===
                                'gateway.create.duplicate.name'
                            ) {
                                setFields({
                                    name: {
                                        value: getFieldValue('name'),
                                        errors: [
                                            new Error(
                                                'Bu adlı SİP nömrə artıq mövcuddur'
                                            ),
                                        ],
                                    },
                                });
                            }
                        }
                    );
                }
            }
        });
    };

    const handleNumberInputs = (event, name) => {
        if (event.target.value === '') {
            setFieldsValue({
                [name]: null,
            });
            return undefined;
        }
        if (Number(event.target.value[0]) === 0) {
            return getFieldValue(name);
        }
        if (nums.test(event.target.value)) {
            setFieldsValue({
                [name]: Number(event.target.value),
            });
            return event.target.value;
        }
        return getFieldValue(name);
    };

    const handleSelectChanged = (event, name) => {
        if (
            (typeof event === 'undefined' || event === null) &&
            name === 'variables'
        ) {
            setFieldsValue({
                direction: undefined,
                value: null,
            });
        } else if (
            (typeof event === 'undefined' || event === null) &&
            name === 'direction'
        ) {
            setFieldsValue({
                value: null,
            });
        }
    };

    return (
        <div className={styles.UpdateRole}>
            <h2>
                {selectedGateway && selectedGateway.length > 0
                    ? 'Düzəliş et'
                    : 'Yeni SİP nömrə əlavə et'}
            </h2>
            <Spin spinning={selectedId ? actionLoading : false}>
                <Form onSubmit={event => handleGatewaySubmit(event)}>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="Name"
                                customStyle={styles.formItem}
                                help={getFieldError('name')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('name', {
                                    rules: [
                                        requiredRule,
                                        dinamicMaxLengthRule(100),
                                    ],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                label={
                                    <>
                                        <p className={styles.labelText}>
                                            Proxy
                                        </p>
                                        <Tooltip title="ip_address:port və ya hostname:port fomatında daxil edilməlidir (port olmaya da bilər). Məsələn, 127.0.0.1:8000">
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
                                help={getFieldError('proxy')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('proxy', {
                                    rules: [requiredRule, whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="Username"
                                customStyle={styles.formItem}
                                help={getFieldError('username')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('username', {
                                    rules: [requiredRule, whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                label="Password"
                                customStyle={styles.formItem}
                                help={getFieldError('password')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('password', {
                                    rules: [requiredRule, whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={6}>
                            <ProFormItem
                                label="Register"
                                customStyle={styles.formItemCheckbox}
                                help={getFieldError('register')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('register', {
                                    rules: [],
                                })(
                                    <Checkbox
                                        checked={getFieldValue('register')}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                        <Col span={6}>
                            <ProFormItem
                                label="Caller-id-from"
                                customStyle={styles.formItemCheckbox}
                                help={getFieldError('callerIdInFrom')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('callerIdInFrom', {
                                    rules: [],
                                })(
                                    <Checkbox
                                        checked={getFieldValue(
                                            'callerIdInFrom'
                                        )}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="Realm"
                                customStyle={styles.formItem}
                                help={getFieldError('realm')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('realm', {
                                    rules: [whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                label="From-user"
                                customStyle={styles.formItem}
                                help={getFieldError('fromUser')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('fromUser', {
                                    rules: [whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="From-domain"
                                customStyle={styles.formItem}
                                help={getFieldError('fromDomain')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('fromDomain', {
                                    rules: [whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                label="Extension"
                                customStyle={styles.formItem}
                                help={getFieldError('extension')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('extension', {
                                    rules: [whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="Outbound-proxy"
                                customStyle={styles.formItem}
                                help={getFieldError('outboundProxy')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('outboundProxy', {
                                    rules: [whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                label="Register-proxy"
                                customStyle={styles.formItem}
                                help={getFieldError('registerProxy')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('registerProxy', {
                                    rules: [whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="Expire-seconds"
                                customStyle={styles.formItem}
                                help={getFieldError('expireSeconds')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('expireSeconds', {
                                    getValueFromEvent: event =>
                                        handleNumberInputs(
                                            event,
                                            'expireSeconds'
                                        ),
                                    rules: [],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                label="Register-transport"
                                customStyle={styles.formItem}
                                help={getFieldError(`registerTransport`)?.[0]}
                            >
                                {getFieldDecorator(`registerTransport`, {
                                    rules: [requiredRule],
                                })(
                                    <ProSelect
                                        data={[
                                            {
                                                id: 'udp',
                                                name: 'UDP',
                                            },
                                            {
                                                id: 'tcp',
                                                name: 'TCP',
                                            },
                                            {
                                                id: 'tls',
                                                name: 'TLS',
                                            },
                                        ]}
                                        key={['id']}
                                        onChange={val => console.log(val)}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="Retry-seconds"
                                customStyle={styles.formItem}
                                help={getFieldError('retrySeconds')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('retrySeconds', {
                                    getValueFromEvent: event =>
                                        handleNumberInputs(
                                            event,
                                            'retrySeconds'
                                        ),
                                    rules: [],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                label="Contact-params"
                                customStyle={styles.formItem}
                                help={getFieldError('contactParams')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('contactParams', {
                                    rules: [whitespaceRule],
                                })(<Input size="large" placeholder="Yazın" />)}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="Ping"
                                customStyle={styles.formItem}
                                help={getFieldError('ping')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('ping', {
                                    getValueFromEvent: event =>
                                        handleNumberInputs(event, 'ping'),
                                    rules: [],
                                })(
                                    <Input
                                        size="large"
                                        placeholder="Yazın"
                                        // min={1}
                                        // style={{ width: '100%' }}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={8}>
                            <ProFormItem
                                label="Variables"
                                customStyle={styles.formItem}
                                help={getFieldError(`variables`)?.[0]}
                            >
                                {getFieldDecorator(`variables`, {})(
                                    <ProSelect
                                        data={[
                                            {
                                                id: 'dtmf_type',
                                                name: 'DTMF_TYPE',
                                            },
                                        ]}
                                        onChange={val =>
                                            handleSelectChanged(
                                                val,
                                                'variables'
                                            )
                                        }
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                        <Col span={8}>
                            <ProFormItem
                                label="Direction"
                                customStyle={styles.formItem}
                                help={getFieldError(`direction`)?.[0]}
                            >
                                {getFieldDecorator(`direction`, {
                                    rules: [
                                        getFieldValue('variables') !== undefined
                                            ? requiredRule
                                            : '',
                                    ],
                                })(
                                    <ProSelect
                                        data={[
                                            {
                                                id: 'inbound',
                                                name: 'INBOUND',
                                            },
                                            {
                                                id: 'outbound',
                                                name: 'OUTBOUND',
                                            },
                                            {
                                                id: 'both',
                                                name: 'BOTH',
                                            },
                                        ]}
                                        disabled={
                                            getFieldValue('variables') ===
                                            undefined
                                        }

                                        onChange={val =>
                                            handleSelectChanged(
                                                val,
                                                'direction'
                                            )
                                        }
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                        <Col span={8}>
                            <ProFormItem
                                label="Value"
                                customStyle={styles.formItem}
                                help={getFieldError('value')?.[0]}
                                style={{ height: '80px' }}
                            >
                                {getFieldDecorator('value', {
                                    rules: [
                                        getFieldValue('direction') !== undefined
                                            ? requiredRule
                                            : '',
                                    ],
                                })(
                                    <Input
                                        size="large"
                                        placeholder="Yazın"
                                        disabled={
                                            getFieldValue('direction') ===
                                            undefined
                                        }
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <Row gutter={6}>
                        <Col span={12}>
                            <ProFormItem
                                label="İVR"
                                customStyle={styles.formItem}
                                help={getFieldError(`ivr`)?.[0]}
                            >
                                {getFieldDecorator(`ivr`, {})(
                                    <ProSelect data={ivr} />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>

                    <ProButton
                        htmlType="submit"
                        style={{ marginRight: '10px' }}
                    >
                        Yadda saxla
                    </ProButton>
                    <ProButton onClick={toggleRoleModal} type="danger">
                        İmtina
                    </ProButton>
                </Form>
            </Spin>
        </div>
    );
};

const mapStateToProps = state => ({
    ivr: state.IVRReducer.ivr,
    actionLoading: state.GatewaysReducer.actionLoading,
});

export default connect(
    mapStateToProps,
    {
        fetchGateways,
        createGateways,
        fetchIvr,
        editGateways,
    }
)(Form.create({ name: 'GatewayForm' })(AddSip));
