/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Input, Form, Modal, Spin, Row, Col, InputNumber } from 'antd';
import { ProFormItem, ProSelect, ProAsyncSelect } from 'components/Lib';
import { createStock, editStock } from 'store/actions/stock';
import {
    requiredRule,
    minLengthRule,
    shortTextMaxRule,
    numberRule,
} from 'utils/rules';
import { fetchStockTypes } from 'store/actions/settings/anbar';
import { fetchUsers } from 'store/actions/users';
import { toast } from 'react-toastify';
import styles from '../styles.module.scss';
import { cookies } from 'utils/cookies';

const UpdateWarehouse = props => {
    const {
        form,
        data = null,
        visible,
        toggleVisible,
        createStock,
        editStock,
        actionLoading,
        fetchUsers,
        fetchStocks,
        fetchStockTypes,
        fetchStocksCount,
        usersLoading,
        filters,
        stockTypes,
        setStocktypes,
        users,
        setUsers,
    } = props;
    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
    } = form;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');

    const [selectedStockType, setSelectedStockType] = useState(undefined);
    const [selectedResponsibleMan, setSelectedResponsibleMan] = useState(
        undefined
    );

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
                if (data) {
                    return editStock(
                        data.id,
                        stockData,
                        () => {
                            toast.success('Anbar uğurla yeniləndi.');
                            toggleVisible(false);
                            fetchStocks(filters);
                            fetchStocksCount(filters);
                        },
                        () => {
                            toast.error('Xəta baş verdi.');
                        }
                    );
                }
                return createStock(
                    stockData,
                    () => {
                        toast.success('Anbar uğurla yaradıldı.');
                        toggleVisible(false);
                        fetchStocks(filters);
                        fetchStocksCount(filters);
                    },
                    () => {
                        toast.error('Xəta baş verdi.');
                    }
                );
            }
        });
    };

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        if (data) {
            setFieldsValue({
                warehouseName: data.name,
                width: Number(data.lat) || undefined,
                length: Number(data.lng) || undefined,
                area: Number(data.area) || undefined,
                stockType: data.stock_type_id || undefined,
                responsiblePerson: data.warehouseman_id || undefined,
            });
            data.stock_type_id &&
                fetchStockTypes({
                    filters: { ids: [data.stock_type_id] },
                    onSuccessCallback: data => {
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
                        setSelectedStockType(appendList);
                    },
                });
            data.warehouseman_id &&
                fetchUsers({
                    filters: {
                        businessUnitIds: [
                            data.business_unit_id == null
                                ? 0
                                : data.business_unit_id,
                        ],
                        ids: [data.warehouseman_id],
                    },
                    onSuccessCallback: data => {
                        setSelectedResponsibleMan(data.data);
                    },
                });
        } else {
            setSelectedStockType(undefined);
            setSelectedResponsibleMan(undefined);
        }
    }, [data]);

    const Users = users.map(user => ({
        ...user,
        name: `${user.name || ''} ${user.lastName || ''}`,
    }));
    useEffect(() => {
        if (Users.length == 1 && !data) {
            setFieldsValue({
                responsiblePerson: Users[0].id,
            });
        }
    }, [visible, users]);
    const ajaxStockTypesSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            'filters[search]': search,
        };
        fetchStockTypes({
            filters: defaultFilters,
            onSuccessCallback: data => {
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
                    setStocktypes(appendList);
                } else {
                    setStocktypes(stockTypes.concat(appendList));
                }
            },
        });
    };

    const ajaxResponsibleManSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            'filters[search]': search,
            businessUnitIds: data?.business_unit_id
                ? [data?.business_unit_id]
                : [BUSINESS_TKN_UNIT ? BUSINESS_TKN_UNIT : 0],
        };
        fetchUsers({
            filters: defaultFilters,
            onSuccessCallback: data => {
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
                    setUsers(appendList);
                } else {
                    setUsers(users.concat(appendList));
                }
            },
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
                    id="warehouse"
                    width={14}
                    height={14}
                    src="/img/icons/X.svg"
                    alt="trash"
                    className={styles.icon}
                />
            </Button>
            <div className={styles.WarehouseModal}>
                <Spin spinning={actionLoading}>
                    <div style={{ marginBottom: '20px' }}>
                        <span className={styles.header}>
                            {data ? 'Düzəliş et' : 'Yeni Anbar'}
                        </span>
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
                            label="Anbar növü"
                            name="stockType"
                            help={getFieldError('stockType')?.[0]}
                            customStyle={styles.formItem}
                        >
                            {getFieldDecorator('stockType', {
                                rules: [],
                            })(
                                <ProAsyncSelect
                                    selectRequest={ajaxStockTypesSelectRequest}
                                    data={
                                        selectedStockType
                                            ? [
                                                  ...selectedStockType,
                                                  ...stockTypes.filter(
                                                      item =>
                                                          !selectedStockType
                                                              .map(
                                                                  ({ id }) => id
                                                              )
                                                              ?.includes(
                                                                  item.id
                                                              )
                                                  ),
                                              ]
                                            : stockTypes
                                    }
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
                                <ProAsyncSelect
                                    selectRequest={
                                        ajaxResponsibleManSelectRequest
                                    }
                                    data={
                                        selectedResponsibleMan
                                            ? [
                                                  ...selectedResponsibleMan,
                                                  ...users.filter(
                                                      item =>
                                                          !selectedResponsibleMan
                                                              .map(
                                                                  ({ id }) => id
                                                              )
                                                              ?.includes(
                                                                  item.id
                                                              )
                                                  ),
                                              ].map(user => ({
                                                  ...user,
                                                  name: `${user.name ||
                                                      ''} ${user.lastName ||
                                                      ''}`,
                                              }))
                                            : users.map(user => ({
                                                  ...user,
                                                  name: `${user.name ||
                                                      ''} ${user.lastName ||
                                                      ''}`,
                                              }))
                                    }
                                />
                            )}
                        </ProFormItem>
                        <Row gutter={6}>
                            <Col span={12}>
                                <ProFormItem
                                    label="Enlik"
                                    name="width"
                                    help={getFieldError('width')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('width', {
                                        rules: [numberRule],
                                    })(
                                        <InputNumber
                                            size="large"
                                            className={styles.select}
                                            placeholder="Yazın"
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                            <Col span={12}>
                                <ProFormItem
                                    label="Uzunluq"
                                    name="length"
                                    help={getFieldError('length')?.[0]}
                                    customStyle={styles.formItem}
                                >
                                    {getFieldDecorator('length', {
                                        rules: [numberRule],
                                    })(
                                        <InputNumber
                                            size="large"
                                            className={styles.select}
                                            placeholder="Yazın"
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>
                        <ProFormItem
                            label="Sahəsi"
                            help={getFieldError('area')?.[0]}
                            customStyle={styles.formItem}
                        >
                            {getFieldDecorator('area', {
                                rules: [numberRule],
                            })(
                                <InputNumber
                                    size="large"
                                    className={styles.select}
                                    placeholder="Yazın"
                                    style={{ width: '100%' }}
                                />
                            )}
                        </ProFormItem>
                        <Button
                            size="large"
                            className={styles.button}
                            style={{ width: '100%' }}
                            htmlType="submit"
                        >
                            {data ? 'Düzəliş et' : 'Əlavə et'}
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
});

export default connect(
    mapStateToProps,
    { createStock, editStock, fetchStockTypes, fetchUsers }
)(Form.create({ name: 'UpdateWarehouse' })(UpdateWarehouse));
