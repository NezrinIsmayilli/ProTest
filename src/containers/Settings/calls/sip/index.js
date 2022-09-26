import React, { useState, useEffect } from 'react';
import { Table, ProButton, ProModal, Can } from 'components/Lib';
import { Switch, Icon, Button, Badge } from 'antd';
import { permissions, accessTypes } from 'config/permissions';

import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { fetchIvr } from 'store/actions/settings/ivr';
import {
    fetchGateways,
    toggleGateways,
    deleteGateways,
    fetchSelectedGateway,
} from 'store/actions/settings/gateways';
import swal from '@sweetalert/with-react';
import { connect } from 'react-redux';
import AddSip from './addSip';
import styles from './styles.module.scss';

const { manage } = accessTypes;

const Sip = props => {
    const {
        fetchGateways,
        fetchIvr,
        gateways,
        fetchGatewaysLoading,
        toggleGateways,
        toggleGatewaysLoading,
        deleteGateways,
        fetchSelectedGateway,
        permissionsList,
    } = props;
    useEffect(() => {
        if (gateways.length === 0) fetchGateways();
    }, [fetchGateways, gateways.length]);

    const [roleModalIsVisible, setRoleModalIsVisible] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState([]);
    const [selectedId, setSelectedId] = useState(undefined);

    useEffect(() => {
        if (roleModalIsVisible === false) setSelectedGateway([]);
    }, [roleModalIsVisible]);
    const handleRemoveSip = id => {
        swal({
            title: 'Diqqət!',
            text: 'Silmək istədiyinizə əminsiniz?',
            buttons: ['Ləğv et', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deleteGateways(id, () => {
                    fetchGateways();
                    fetchIvr();
                });
            }
        });
    };
    const editClick = id => {
        if (id) {
            fetchSelectedGateway({
                id,
                onSuccessCallback: ({ data }) => {
                    setSelectedGateway([data]);
                },
            });
            setSelectedId(id);
        }
        toggleRoleModal();
    };
    const toggleRoleModal = () => {
        setRoleModalIsVisible(prevValue => !prevValue);
    };
    function onChange(id, value) {
        toggleGateways(id, value, () => {
            fetchGateways();
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
            title: `Gateway adı`,
            dataIndex: 'name',
            align: 'left',
            render: value => value || '',
        },
        {
            title: `Bağlı olduği IVR`,
            dataIndex: 'ivr',
            align: 'left',
            render: value => (value ? value.name : '-'),
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            align: 'left',
            render: (value, row) => (
                <Switch
                    disabled={permissionsMap.permission === 1}
                    onChange={value => onChange(row.id, value)}
                    checked={value}
                />
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
                            onClick={() => handleRemoveSip(value)}
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
                <AddSip
                    toggleRoleModal={toggleRoleModal}
                    selectedGateway={selectedGateway}
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
                        Yeni SİP nömrə
                    </ProButton>
                </Can>
            </div>
            <Table
                columns={columns}
                dataSource={gateways}
                scroll={{ x: 'none' }}
                loading={fetchGatewaysLoading || toggleGatewaysLoading}
            />
        </div>
    );
};

const mapStateToProps = state => ({
    fetchGatewaysLoading: state.loadings.fetchGateways,
    toggleGatewaysLoading: state.loadings.toggleGateways,
    gateways: state.GatewaysReducer.gateways,
    permissionsList: state.permissionsReducer.permissions,
});

export default connect(
    mapStateToProps,
    {
        fetchIvr,
        fetchSelectedGateway,
        fetchGateways,
        toggleGateways,
        deleteGateways,
    }
)(Sip);
