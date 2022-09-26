/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Input, Form, Modal, Spin } from 'antd';
import { ProFormItem, ProSelect } from 'components/Lib';
import { createStock, fetchStocks } from 'store/actions/stock';
import { cookies } from 'utils/cookies';
import { fetchUnitStock } from 'store/actions/businessUnit';
import { requiredRule, minLengthRule, shortTextMaxRule } from 'utils/rules';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

const StockAdd = props => {
    const {
        form,
        users,
        visible,
        toggleVisible,
        setData,
        createStock,
        actionLoading,
        usersLoading,
        fetchStocks,
    } = props;
    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
    } = form;

    useEffect(() => {
        if (users.length === 1) {
            setFieldsValue({ responsiblePerson: users[0]?.id });
        }
    }, [users, visible]);

    const handleWarehouseFormSubmit = event => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const {
                    warehouseName,
                    stockType,
                    responsiblePerson,
                    length,
                    width,
                    area,
                } = values;

                const stockData = {
                    name: warehouseName || null,
                    structure: null,
                    lat: width || null,
                    lng: length || null,
                    area: area || null,
                    personInCharge: responsiblePerson || null,
                    stockType: stockType || null,
                };
                return createStock(
                    stockData,
                    () => {
                        setData(stockData);
                        toggleVisible(false);
                        if (cookies.get('_TKN_UNIT_')) {
                            fetchStocks({
                                limit: 1000,
                                businessUnitIds:
                                    [cookies.get('_TKN_UNIT_')] || 0,
                            });
                        } else {
                            fetchStocks({ limit: 1000 });
                        }
                    },
                    () => {
                        toast.error('Xəta baş verdi.');
                    }
                );
            }
        });
    };

    return (
        <Modal
            visible={visible}
            onCancel={() => toggleVisible(false)}
            closable={false}
            centered
            footer={null}
            className={styles.customModal}
            destroyOnClose
            // maskClosable={false}
        >
            <Button
                className={styles.closeButton}
                size="large"
                onClick={() => toggleVisible(false)}
            >
                <img
                    width={14}
                    height={14}
                    src="/img/icons/X.svg"
                    alt="trash"
                    className={styles.icon}
                />
            </Button>
            <div className={styles.contactAddModal}>
                <Spin spinning={actionLoading}>
                    <div style={{ marginBottom: '20px' }}>
                        <span className={styles.header}>Yeni Anbar</span>
                    </div>
                    <Form
                        onSubmit={handleWarehouseFormSubmit}
                        className={styles.form}
                        noValidate
                    >
                        <ProFormItem
                            label="Anbar adı"
                            name="warehouseName"
                            help={getFieldError('warehouseName')?.[0]}
                            customStyle={styles.formItem}
                        >
                            {getFieldDecorator('warehouseName', {
                                rules: [
                                    requiredRule,
                                    minLengthRule,
                                    shortTextMaxRule,
                                ],
                            })(
                                <Input
                                    size="large"
                                    className={styles.select}
                                    placeholder="Yazın"
                                />
                            )}
                        </ProFormItem>

                        <ProFormItem
                            label="Məsul şəxs"
                            name="responsiblePerson"
                            help={getFieldError('responsiblePerson')?.[0]}
                            customStyle={styles.formItem}
                        >
                            {getFieldDecorator('responsiblePerson', {
                                rules: [requiredRule],
                            })(
                                <ProSelect
                                    loading={usersLoading}
                                    data={users.map(user => ({
                                        ...user,
                                        name: `${user.name ||
                                            ''} ${user.lastName || ''}`,
                                    }))}
                                />
                            )}
                        </ProFormItem>

                        <Button
                            size="large"
                            className={styles.button}
                            style={{ width: '100%' }}
                            htmlType="submit"
                        >
                            Əlavə et
                        </Button>
                    </Form>
                </Spin>
            </div>
        </Modal>
    );
};

const mapStateToProps = state => ({
    isLoading: state.stockReducer.isLoading,
    actionLoading: state.stockReducer.actionLoading,
    usersLoading: state.loadings.fetchUsers,
    users: state.usersReducer.users,
});

export default connect(
    mapStateToProps,
    { createStock, fetchStocks, fetchUnitStock }
)(Form.create({ name: 'StockAdd' })(StockAdd));
