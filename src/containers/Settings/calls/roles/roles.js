import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    fetchCallRoles,
    deleteCallRole,
    fetchSipSettings,
} from 'store/actions/settings/call-roles';
import swal from '@sweetalert/with-react';
import {
    CustomHeader,
    SettingsCollapse,
    SettingsPanel,
    ProModal,
} from 'components/Lib';
import { fetchUsers } from 'store/actions/users';
import { fetchCallOperators } from 'store/actions/calls/internalCalls';
import { toast } from 'react-toastify';
import { Tooltip, message as antMessage, Spin } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { TenantRole, UpdateRole } from './index';
import styles from '../styles.module.scss';

const url =
    process.env.NODE_ENV === 'production'
        ? 'backendpbx.prospect.az'
        : 'sparkle.pronet.az';

const roleTypes = [
    {
        label: 'Operator',
        type: 1,
    },
    {
        label: 'Supervayzer',
        type: 2,
    },
    {
        label: 'İcraçı',
        type: 3,
    },
];
const RolesList = props => {
    const {
        supervisors,
        executors,
        operators,
        deleteCallRole,
        fetchUsers,
        fetchCallRoles,
        fetchCallOperators,
        fetchSipSettings,
    } = props;

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [roleType, setRoleType] = useState(undefined);
    const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);
    const [operatorUsers, setOperatorUsers] = useState([]);
    useEffect(() => {
        if (operatorUsers.length === 0)
            fetchCallOperators({
                onSuccessCallback: ({ data }) => {
                    const result = data.filter(
                        user => user.prospectTenantPerson !== null
                    );
                    setOperatorUsers(result);
                },
            });
    }, [fetchCallOperators, operatorUsers.length]);
    const toggleRoleModal = roleType => {
        setRoleType(roleType);
        setRoleModalIsVisible(prevValue => !prevValue);
        setSelectedUsers([]);
    };

    const handleRemoveTenantPersonRole = id => {
        swal({
            title: 'Diqqət!',
            text: 'Silmək istədiyinizə əminsiniz?',
            buttons: ['Ləğv et', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deleteCallRole({
                    id,
                    onSuccessCallback: () => {
                        fetchCallRoles();
                    },
                    onFailureCallback: ({ error }) => {
                        if (
                            error?.response?.data?.error?.type ===
                            'operator_role.delete.linked.operator.ivr_action'
                        ) {
                            toast.error(
                                'Bu istifadəçi mövcud İVR - lardan birinin tərkibində olduğu üçün silinə bilməz'
                            );
                        } else if (
                            error?.response?.data?.error?.type ===
                            'operator_role.delete.linked.operator.callcenter_agent'
                        ) {
                            toast.error(
                                'Bu istifadəçi mövcud Operator qruplarından birinin tərkibində olduğu üçün silinə bilməz'
                            );
                        }
                    },
                });
            }
        });
    };

    const [settingsModalIsVisible, setSettingsModalIsVisible] = useState(false);
    const [settingsModalName, setSettingsModalName] = useState('');
    const [settingsModalData, setSettingsModalData] = useState(false);

    const toggleSettingsModal = () => {
        if (settingsModalIsVisible) {
            setSettingsModalName('');
            setSettingsModalData(false);
        }
        setSettingsModalIsVisible(prevValue => !prevValue);
    };
    const handleShowSettingModal = (id, name) => {
        setSettingsModalIsVisible(true);
        setSettingsModalName(name);
        fetchSipSettings({
            id,
            onSuccessCallback: ({ data }) => {
                setSettingsModalData(data);
            },
        });
    };

    const handleCopyToClipboart = text => {
        navigator.clipboard.writeText(text);
        antMessage.success('Məumat kopyalandı');
    };

    useEffect(() => {
        fetchUsers();
        fetchCallRoles();
    }, [fetchCallRoles, fetchUsers]);
    return (
        <div className={styles.OrderRoles}>
            <ProModal
                maskClosable
                padding
                centered
                width={400}
                isVisible={roleModalIsVisible}
                handleModal={toggleRoleModal}
            >
                <UpdateRole
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    operatorUsers={operatorUsers}
                    roleType={roleType}
                    toggleRoleModal={toggleRoleModal}
                />
            </ProModal>
            <ProModal
                maskClosable
                padding
                centered
                width={666}
                isVisible={settingsModalIsVisible}
                handleModal={toggleSettingsModal}
            >
                <Spin spinning={!settingsModalData}>
                    <div className={styles.UpdateRole}>
                        <h2>{settingsModalName}</h2>
                        <div>
                            <SettingsCollapse
                                className={styles.modalCollapse}
                                style={{ margin: 0, padding: 0 }}
                                accordion={false}
                                defaultActiveKey={['1', '2', '3']}
                            >
                                <SettingsPanel
                                    style={{ margin: '0 0 10px 0', padding: 0 }}
                                    header={
                                        <p className={styles.modalHeader}>
                                            İP telefon tənzimləmələri
                                        </p>
                                    }
                                    key={1}
                                >
                                    <ul className={styles.modalList}>
                                        <li>
                                            <div>SIP Server</div>
                                            <div>
                                                {settingsModalData.subdomain}.
                                                {url}:
                                                {settingsModalData.sipPort}
                                                <Tooltip
                                                    placement="top"
                                                    title="Kopyala"
                                                >
                                                    <CopyOutlined
                                                        style={{
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleCopyToClipboart(
                                                                `${settingsModalData.subdomain}-${url}:${settingsModalData.sipPort}`
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </li>
                                        <li>
                                            <div>SIP Proxy</div>
                                            <div>
                                                {settingsModalData.subdomain}.
                                                {url}:
                                                {settingsModalData.sipPort}
                                                <Tooltip
                                                    placement="top"
                                                    title="Kopyala"
                                                >
                                                    <CopyOutlined
                                                        style={{
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleCopyToClipboart(
                                                                `${settingsModalData.subdomain}-${url}:${settingsModalData.sipPort}`
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </li>
                                        <li>
                                            <div>Username</div>
                                            <div>
                                                {settingsModalData.number}
                                                <Tooltip
                                                    placement="top"
                                                    title="Kopyala"
                                                >
                                                    <CopyOutlined
                                                        style={{
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleCopyToClipboart(
                                                                settingsModalData.number
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </li>
                                        <li>
                                            <div>Domain</div>
                                            <div>
                                                {settingsModalData.subdomain}
                                                <Tooltip
                                                    placement="top"
                                                    title="Kopyala"
                                                >
                                                    <CopyOutlined
                                                        style={{
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleCopyToClipboart(
                                                                settingsModalData.subdomain
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </li>
                                        <li>
                                            <div>Password</div>
                                            <div>
                                                {settingsModalData.password}
                                                <Tooltip
                                                    placement="top"
                                                    title="Kopyala"
                                                >
                                                    <CopyOutlined
                                                        style={{
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleCopyToClipboart(
                                                                settingsModalData.password
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </li>
                                        <li>
                                            <div>Transport</div>
                                            <div>
                                                TLS
                                                <Tooltip
                                                    placement="top"
                                                    title="Kopyala"
                                                >
                                                    <CopyOutlined
                                                        style={{
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleCopyToClipboart(
                                                                'TLS'
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </li>
                                        <li>
                                            <div>TLS Port</div>
                                            <div>
                                                {settingsModalData.tlsPort}
                                                <Tooltip
                                                    placement="top"
                                                    title="Kopyala"
                                                >
                                                    <CopyOutlined
                                                        style={{
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            handleCopyToClipboart(
                                                                settingsModalData.tlsPort
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </li>
                                    </ul>
                                </SettingsPanel>
                            </SettingsCollapse>
                        </div>
                    </div>
                </Spin>
            </ProModal>
            <SettingsCollapse accordion={false}>
                {roleTypes.map(({ label, type }) => (
                    <SettingsPanel
                        header={
                            <CustomHeader
                                title={
                                    type === 1
                                        ? `Operatorlar (${operators.length})`
                                        : type === 2
                                            ? `${label}lər (${supervisors.length})`
                                            : `${label}lar (${executors.length})`
                                }
                            />
                        }
                        key={String(type)}
                    >
                        <TenantRole
                            operatorUsers={operatorUsers}
                            label={label}
                            type={type}
                            data={
                                type === 1
                                    ? operators
                                    : type === 2
                                        ? supervisors
                                        : executors
                            }
                            toggleRoleModal={toggleRoleModal}
                            handleRemoveTenantPersonRole={
                                handleRemoveTenantPersonRole
                            }
                            handleShowSettingModal={handleShowSettingModal}
                        />
                    </SettingsPanel>
                ))}
            </SettingsCollapse>
        </div>
    );
};

const mapStateToProps = state => ({
    operators: state.callRolesReducer.operators,
    supervisors: state.callRolesReducer.supervisors,
    executors: state.callRolesReducer.executors,
});

export const Roles = connect(
    mapStateToProps,
    {
        fetchUsers,
        fetchCallRoles,
        deleteCallRole,
        fetchCallOperators,
        fetchSipSettings,
    }
)(RolesList);
