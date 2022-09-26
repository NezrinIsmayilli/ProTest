import React, { useState, useEffect } from 'react';
import { Table, ProButton, ProModal, Can } from 'components/Lib';
import { Switch, Tooltip, Button, Badge } from 'antd';
import { permissions, accessTypes } from 'config/permissions';

import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import {
    fetchIvr,
    toggleIvr,
    deleteIvr,
    fetchSelectedIvr,
} from 'store/actions/settings/ivr';
import { fetchGateways } from 'store/actions/settings/gateways';
import swal from '@sweetalert/with-react';
import { connect } from 'react-redux';
import { values } from 'lodash';
import AddIvr from './addIvr';
import styles from './styles.module.scss';

const { manage } = accessTypes;

const Ivr = props => {
    const {
        fetchIvr,
        fetchGateways,
        ivr,
        fetchIvrLoading,
        toggleIvr,
        toggleIvrLoading,
        deleteIvr,
        fetchSelectedIvr,
        permissionsList,
    } = props;
    useEffect(() => {
        if (ivr.length === 0) fetchIvr();
    }, [fetchIvr, ivr.length]);

    const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);
    const [selectedIvr, setSelectedIvr] = useState([]);
    const [selectedId, setSelectedId] = useState(undefined);
    useEffect(() => {
        if (roleModalIsVisible === false) setSelectedIvr([]);
    }, [roleModalIsVisible]);
    const handleRemoveIvr = id => {
        swal({
            title: 'Diqqət!',
            text: 'Silmək istədiyinizə əminsiniz?',
            buttons: ['Ləğv et', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deleteIvr(id, () => {
                    fetchGateways();
                    fetchIvr();
                });
            }
        });
    };
    const editClick = (id, row) => {
        if (id) {
            fetchSelectedIvr({
                id,
                onSuccessCallback: ({ data }) => {
                    setSelectedIvr([data]);
                },
            });
            setSelectedId(id);
        }
        toggleRoleModal();
    };
    const toggleRoleModal = () => {
        setRoleModalIsVisible(prevValue => !prevValue);
    };
    function onChange(id) {
        toggleIvr(id, () => {
            fetchIvr();
        });
    }

    const permissionsMap = permissionsList.find(i =>
        i.key === 'msk_callcenter' ? i : null
    );

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 80,
            render: (value, item, index) => index + 1,
        },
        {
            title: `Ivr adı`,
            dataIndex: 'name',
            align: 'left',
            render: value => value || '',
        },
        // {
        // 	title: 'Status',
        // 	dataIndex: 'isActive',
        // 	align: 'left',
        // 	render: (value, row) => (
        // 		<Switch
        // 			disabled={permissionsMap.permission === 1}
        // 			onChange={value => onChange(row.id)}
        // 			checked={value}
        // 		/>
        // 	),
        // },
        {
            title: 'Bağlı olan SIP nömrələr',
            dataIndex: 'gateways',
            render: value => (
                <>
                    <span>{value[0]?.name}</span>
                    {'  '}
                    {value.length > 1 && (
                        <Tooltip
                            placement="top"
                            title={
                                value.length > 0 &&
                                value.map(
                                    (val, index) =>
                                        index > 0 && <div>{val.name}</div>
                                )
                            }
                        >
                            <Badge
                                count={value.length - 1}
                                style={{
                                    backgroundColor: '#3498db55',
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    boxShadow: '0 0 0 1px #3498db inset',
                                }}
                            />
                        </Tooltip>
                    )}
                </>
            ),
        },
        {
            title: (
                <Can I={manage} a={permissions.msk_callcenter}>
                    Seç
                </Can>
            ),
            dataIndex: 'id',
            key: 'delete',
            align: 'left',
            width: 100,
            render: (value, row) => (
                <Can I={manage} a={permissions.msk_callcenter}>
                    <div style={{ display: 'flex' }}>
                        <Button
                            style={{ padding: '5px' }}
                            type="button"
                            className={styles.trashIcon}
                            onClick={() => handleRemoveIvr(value)}
                        >
                            <FaTrash />
                        </Button>
                        <Button
                            style={{ padding: '5px' }}
                            type="button"
                            className={styles.editIcon}
                            onClick={() => editClick(value, row)}
                        >
                            <FaPencilAlt />
                        </Button>
                    </div>
                </Can>
            ),
        },
    ];

    return (
        <div>
            <ProModal
                maskClosable
                style={{ marginTop: '100px' }}
                padding
                centered
                width={800}
                isVisible={roleModalIsVisible}
                handleModal={toggleRoleModal}
            >
                <AddIvr
                    toggleRoleModal={toggleRoleModal}
                    selectedIvr={selectedIvr}
                    selectedId={selectedId}
                />
            </ProModal>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
                <Can I={manage} a={permissions.msk_callcenter}>
                    <ProButton
                        style={{ margin: '10px 0' }}
                        onClick={() => toggleRoleModal()}
                    >
                        Yeni IVR
                    </ProButton>
                </Can>
            </div>
            <Table
                columns={columns}
                dataSource={ivr}
                scroll={{ x: 'none' }}
                loading={fetchIvrLoading || toggleIvrLoading}
            />
        </div>
    );
};

const mapStateToProps = state => ({
    fetchIvrLoading: state.loadings.fetchIvr,
    toggleIvrLoading: state.loadings.toggleIvr,
    ivr: state.IVRReducer.ivr,
    permissionsList: state.permissionsReducer.permissions,
});

export default connect(
    mapStateToProps,
    { fetchIvr, fetchGateways, toggleIvr, deleteIvr, fetchSelectedIvr }
)(Ivr);
