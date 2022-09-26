import React from 'react';
import { Row, Col, Dropdown, Menu } from 'antd';
import { NewButton } from 'components/Lib';
import { AiOutlineDown, BiUnite } from 'react-icons/all';
import styles from '../styles.module.scss';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

export default function AddButton({
    businessUnits,
    profile,
    openModal,
    setWorker,
    setRoles,
}) {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const handleMenuClick = ({ key }) => {
        setWorker([]);
        setRoles([]);
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
                ? businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                          onClick={openModal}
                      >
                          <BiUnite style={{ marginRight: '5px' }} />
                          {item.name}
                      </Menu.Item>
                  ))
                : profile?.businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                          onClick={openModal}
                      >
                          <BiUnite style={{ marginRight: '5px' }} />
                          {item.name}
                      </Menu.Item>
                  ))}
        </Menu>
    );
    return (
        <Row style={{ margin: '20px 0' }}>
            <Col span={24}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    {profile.businessUnits?.length > 1 ? (
                        <Dropdown
                            className={styles.newDropdownBtn}
                            overlay={menu}
                        >
                            <NewButton
                                type="button"
                                label={t('users:newUser')}
                                title={t('users:newUser')}
                                icon={
                                    <AiOutlineDown
                                        style={{ marginLeft: '5px' }}
                                    />
                                }
                            />
                        </Dropdown>
                    ) : profile.businessUnits?.length === 1 ? (
                        <NewButton
                            type="button"
                            label={t('users:newUser')}
                            title={t('users:newUser')}
                            onClick={openModal}
                        />
                    ) : businessUnits?.length === 1 ? (
                        <NewButton
                            type="button"
                            label={t('users:newUser')}
                            title={t('users:newUser')}
                            onClick={openModal}
                        />
                    ) : (
                        <Dropdown
                            className={styles.newDropdownBtn}
                            overlay={menu}
                        >
                            <NewButton
                                type="button"
                                label={t('users:newUser')}
                                title={t('users:newUser')}
                                icon={
                                    <AiOutlineDown
                                        style={{ marginLeft: '5px' }}
                                    />
                                }
                            />
                        </Dropdown>
                    )}
                </div>
            </Col>
        </Row>
    );
}
