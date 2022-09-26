import React, { useCallback, Fragment, useState, useEffect } from 'react';
import { cookies } from 'utils/cookies';
import { connect } from 'react-redux';

import {
    EditableRow,
    Sidebar,
    Can,
    ProSidebarItem,
    ProAsyncSelect,
} from 'components/Lib';
import { Button, Row, Col, Input, Spin, Dropdown, Menu } from 'antd';

import { FaSave, FaWindowClose, BiUnite } from 'react-icons/all';
// actions
import {
    fetchCashboxNames,
    createCashboxNames,
    editCashboxNames,
    deleteCashboxNames,
    fetchCashboxBalance,
} from 'store/actions/settings/kassa';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { useFilterHandle } from 'hooks';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import swal from '@sweetalert/with-react';

import { permissions, accessTypes } from 'config/permissions';

import CashboxInfoButton from './CashboxInfoButton';

import styles from './index.module.sass';
import { useHistory, useLocation } from 'react-router-dom';

const { manage } = accessTypes;

function Accounts(props) {
    const {
        fetchCashboxNames,
        createCashboxNames,
        editCashboxNames,
        deleteCashboxNames,
        cashBoxNames,
        fetchCashboxBalance,
        isLoading,
        profile,
        fetchBusinessUnitList,
        allBusinessUnits,
    } = props;

    const history = useHistory();
    const location = useLocation();

    const [activeTab, setActiveTab] = React.useState('1');
    const [businessUnits, setBusinessUnits] = useState([]);
    const [businessUnitLength, setBusinessUnitLength] = useState(2);

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {
                limit: 10,
                page: 1,
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
            onSuccess: data => {
                setBusinessUnitLength(data.data?.length || 0);
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (cashBoxNames) {
            history.push({
                search: '',
            });
        }
    }, [cashBoxNames]);

    const ajaxBusinessUnitSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = {
            limit,
            page,
            name: search,
            isDeleted: 0,
            businessUnitIds: profile.businessUnits?.map(({ id }) => id),
        };
        fetchBusinessUnitList({
            filters,
            onSuccess: data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!appendList.length);
                }
                if (stateReset) {
                    setBusinessUnits(appendList);
                } else {
                    setBusinessUnits(businessUnits.concat(appendList));
                }
            },
        });
    };

    function tabChangeHandle(tab) {
        setActiveTab(tab);
        fetchCashboxNames({ attribute: tab, filters });
    }
    const [filters, onFilter] = useFilterHandle(
        {
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
        },
        ({ filters }) => {
            fetchCashboxNames({ attribute: activeTab, filters });
        }
    );
    const {
        open,
        error,
        value,
        inputChangeHandle,
        handleSubmit,
        toggleHandle,
        inputRef,
        onKeyUp,
    } = useToggledInputHandle(activeTab, (index, name) =>
        createCashboxNames(index, name, activeTab)
    );
    const handleMenuClick = ({ key }) => {
        history.push({
            pathname: location.pathName,
            search: `?tkn_unit=${key == 'null' ? 0 : key}`,
        });
    };
    const menu = (
        <Menu
            style={{ maxHeight: '500px', overflowY: 'auto' }}
            onClick={handleMenuClick}
        >
            {profile.businessUnits?.length === 0
                ? allBusinessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                          onClick={() => toggleHandle()}
                      >
                          <BiUnite style={{ marginRight: '5px' }} />
                          {item.name}
                      </Menu.Item>
                  ))
                : profile?.businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                          onClick={() => toggleHandle()}
                      >
                          <BiUnite style={{ marginRight: '5px' }} />
                          {item.name}
                      </Menu.Item>
                  ))}
        </Menu>
    );
    const positionDeleteHandle = useCallback(
        id => {
            swal({
                title: 'Silmək istədiyinizə əminsinizmi?',
                icon: 'warning',
                buttons: ['İmtina', 'Sil'],
                dangerMode: true,
            }).then(willDelete => {
                if (willDelete) {
                    deleteCashboxNames(id, activeTab);
                }
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeTab]
    );

    const positionEditHandle = useCallback(
        (id, name) => {
            editCashboxNames(id, name, activeTab);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeTab]
    );

    return (
        <Fragment>
            <Sidebar title="Hesablar">
                {businessUnitLength === 1 &&
                profile.businessUnits.length === 0 ? null : (
                    <ProSidebarItem label="Biznes blok">
                        <ProAsyncSelect
                            mode="multiple"
                            selectRequest={ajaxBusinessUnitSelectRequest}
                            valueOnChange={values => {
                                onFilter('businessUnitIds', values);
                            }}
                            disabled={businessUnitLength === 1}
                            data={businessUnits?.map(item =>
                                item.id === null ? { ...item, id: 0 } : item
                            )}
                            disabledBusinessUnit={businessUnitLength === 1}
                            value={
                                businessUnitLength === 1
                                    ? businessUnits[0]?.id === null
                                        ? businessUnits[0]?.name
                                        : businessUnits[0]?.id
                                    : filters.businessUnitIds
                            }
                        />
                    </ProSidebarItem>
                )}
            </Sidebar>
            <section className="scrollbar aside">
                <div className={styles.cashboxContainer}>
                    <div className={styles['btn-container']}>
                        <Can I={manage} a={permissions.accounts}>
                            {profile.businessUnits?.length > 1 ? (
                                <Dropdown
                                    className={styles.newDropdownBtn}
                                    overlay={menu}
                                >
                                    <Button
                                        icon="plus"
                                        size="large"
                                        type="primary"
                                    >
                                        Yeni hesab
                                    </Button>
                                </Dropdown>
                            ) : profile.businessUnits?.length === 1 ? (
                                <Button
                                    icon="plus"
                                    onClick={toggleHandle}
                                    size="large"
                                    type="primary"
                                >
                                    Yeni hesab
                                </Button>
                            ) : allBusinessUnits?.length === 1 ? (
                                <Button
                                    icon="plus"
                                    onClick={toggleHandle}
                                    size="large"
                                    type="primary"
                                >
                                    Yeni hesab
                                </Button>
                            ) : (
                                <Dropdown
                                    className={styles.newDropdownBtn}
                                    overlay={menu}
                                >
                                    <Button
                                        icon="plus"
                                        size="large"
                                        type="primary"
                                    >
                                        Yeni hesab
                                    </Button>
                                </Dropdown>
                            )}
                        </Can>
                    </div>

                    <Row className={styles.paddigBottom}>
                        <Col span={8}>
                            <ul className={styles['menu-kassa-msk-hesab']}>
                                <li
                                    className={
                                        activeTab === '1' ? styles.active : ''
                                    }
                                >
                                    <a
                                        href="javascript:;"
                                        onClick={() => tabChangeHandle('1')}
                                    >
                                        Nəğd hesablar
                                    </a>
                                </li>

                                <li
                                    className={
                                        activeTab === '2' ? styles.active : ''
                                    }
                                >
                                    <a
                                        href="javascript:;"
                                        onClick={() => tabChangeHandle('2')}
                                    >
                                        Bank hesabları
                                    </a>
                                </li>

                                <li
                                    className={
                                        activeTab === '3' ? styles.active : ''
                                    }
                                >
                                    <a
                                        href="javascript:;"
                                        onClick={() => tabChangeHandle('3')}
                                    >
                                        Kredit kartları
                                    </a>
                                </li>

                                <li
                                    className={
                                        activeTab === '4' ? styles.active : ''
                                    }
                                >
                                    <a
                                        href="javascript:;"
                                        onClick={() => tabChangeHandle('4')}
                                    >
                                        Digər
                                    </a>
                                </li>
                            </ul>
                        </Col>

                        <Col span={16}>
                            <Spin size="large" spinning={isLoading}>
                                <table
                                    className={[
                                        styles['table-msk'],
                                        styles['table-msk-hesab'],
                                    ].join(' ')}
                                >
                                    <thead>
                                        <tr>
                                            <th>№</th>
                                            <th>Hesab</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {open && (
                                            <tr>
                                                <td />
                                                <td>
                                                    <Input
                                                        value={value}
                                                        ref={inputRef}
                                                        type="text"
                                                        autoComplete="off"
                                                        onKeyUp={onKeyUp}
                                                        onChange={
                                                            inputChangeHandle
                                                        }
                                                        style={{
                                                            borderColor: error
                                                                ? 'red'
                                                                : '#dedede',
                                                        }}
                                                        placeholder="Hesab adı"
                                                        name="name"
                                                        maxLength={50}
                                                    />
                                                    <a
                                                        onClick={() => {
                                                            toggleHandle();
                                                            history.push({
                                                                search: '',
                                                            });
                                                        }}
                                                        href="javascript:;"
                                                        className={
                                                            styles.delete
                                                        }
                                                    >
                                                        <FaWindowClose
                                                            size={18}
                                                        />
                                                    </a>
                                                    <a
                                                        onClick={handleSubmit}
                                                        href="javascript:;"
                                                        className={styles.edit}
                                                    >
                                                        <FaSave size={18} />
                                                    </a>
                                                </td>
                                            </tr>
                                        )}
                                        {cashBoxNames[activeTab].map(
                                            ({ id, name }, index) => (
                                                <EditableRow
                                                    key={`${id}${name}`}
                                                    {...{ id, name, index }}
                                                    placeholder="Hesab adı"
                                                    maxLength={50}
                                                    editHandle={
                                                        positionEditHandle
                                                    }
                                                    deleteHandle={
                                                        positionDeleteHandle
                                                    }
                                                    permission={
                                                        permissions.accounts
                                                    }
                                                    infoButton={
                                                        <CashboxInfoButton
                                                            fetchInfo={callback =>
                                                                fetchCashboxBalance(
                                                                    {
                                                                        attribute: id,
                                                                    },
                                                                    callback
                                                                )
                                                            }
                                                        />
                                                    }
                                                />
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </Spin>
                        </Col>
                    </Row>
                </div>
            </section>
        </Fragment>
    );
}

const mapStateToProps = state => ({
    cashBoxNames: state.kassaReducer.cashBoxNames,
    isLoading: state.kassaReducer.isLoading,
    profile: state.profileReducer.profile,
});

export default connect(
    mapStateToProps,
    {
        fetchCashboxNames,
        createCashboxNames,
        editCashboxNames,
        deleteCashboxNames,
        fetchCashboxBalance,
        fetchBusinessUnitList,
    }
)(Accounts);
