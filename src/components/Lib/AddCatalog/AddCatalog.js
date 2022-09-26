/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Radio, Button, Modal, Form } from 'antd';
import { ProFormItem, AddButton } from 'components/Lib';
import {
    createCatalog,
    fetchCatalogs,
    editCatalog,
} from 'store/actions/catalog';
import { fetchPurchaseCatalogs } from 'store/actions/sales-operation';

import { requiredRule, minLengthRule, mediumTextMaxRule } from 'utils/rules';
import { toast } from 'react-toastify';
import errorMessages from 'utils/errors';
import styles from './styles.module.scss';

const AddCatalog = props => {
    const {
        form,
        isVisible,
        setIsVisible,
        type,
        fetchCatalogs,
        editCatalog,
        actionLoading,
        createCatalog,
        parentCatalogId,
        parentCatalogName,
        onSuccessAddModal,
        selectedItemForUpdate,
        setParentCatalogName,
        editCatalogDefaults,
        edit,
        radioDisabled = false,
        fetchPurchaseCatalogs,
        fetchPurchasedCatalogs = false,
        selectedStock,
    } = props;

    const {
        getFieldDecorator,
        getFieldValue,
        getFieldError,
        validateFields,
        setFieldsValue,
        resetFields,
        setFields,
    } = form;

    const addCatalog = event => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const { productType, serialNumber, name } = values;
                const newCatalog = {
                    name,
                    productType: null,
                    parent:
                        type === 'catalog' || edittype === 'catalog'
                            ? null
                            : parentCatalogId,
                    type: '',
                    isWithoutSerialNumber: serialNumber !== 1,
                    isServiceType: productType !== 1,
                    parameters_ul: [],
                };

                if (edit === 'edit') {
                    editCatalog(
                        selectedItemForUpdate,
                        newCatalog,
                        () => {
                            setIsVisible(false);
                        },
                        ({ error }) => {
                            const errorKey =
                                error?.response?.data?.error?.messageKey;
                            if (
                                errorKey !== 'catalog_product_is_already_used'
                            ) {
                                setFields({
                                    name: {
                                        value: getFieldValue('name'),
                                        errors: [
                                            new Error(errorMessages[errorKey]),
                                        ],
                                    },
                                });
                            }
                        }
                    );
                } else {
                    createCatalog(
                        newCatalog,
                        ({ data }) => {
                            toast.success('Əməliyyat uğurla tamamlandı.');
                            setIsVisible(false);
                            if (fetchPurchasedCatalogs) {
                                fetchPurchaseCatalogs({
                                    filters: {
                                        limit: 1000,
                                        serviceType: 1,
                                        stock: selectedStock,
                                    },
                                    label: 'fetchCatalogsByInvoiceType',
                                    onSuccessCallback: () => {
                                        onSuccessAddModal(data);
                                        type === 'catalog' &&
                                            setParentCatalogName(name);
                                    },
                                });
                            } else {
                                fetchCatalogs({
                                    onSuccessCallback: () => {
                                        onSuccessAddModal(data, type);
                                        type === 'catalog' &&
                                            setParentCatalogName(name);
                                    },
                                });
                            }

                            resetFields();
                        },
                        ({ error }) => {
                            const errorKey =
                                error?.response?.data?.error?.messageKey;
                            if (
                                errorKey !== 'catalog_product_is_already_used'
                            ) {
                                setFields({
                                    name: {
                                        value: getFieldValue('name'),
                                        errors: [
                                            new Error(errorMessages[errorKey]),
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

    let edittype = '';
    if (edit === 'edit') {
        editCatalogDefaults.isServiceType === undefined
            ? (edittype = 'sub-catalog')
            : (edittype = 'catalog');
    }
    useEffect(() => {
        if (edit === 'edit') {
            setFieldsValue({
                productType: editCatalogDefaults.isServiceType === true ? 2 : 1,
                name: editCatalogDefaults.name,
                serialNumber:
                    editCatalogDefaults.isWithoutSerialNumber === true ? 2 : 1,
            });
        } else {
            setFieldsValue({
                productType: 1,
                name: null,
                serialNumber: 2,
            });
        }
    }, [isVisible]);
    return (
        <Modal
            // loading={categoryCreateLoader}
            closable={false}
            confirmLoading
            footer={null}
            className={styles.customModal}
            style={{ marginTop: '100px' }}
            onCancel={() => setIsVisible(false)}
            visible={isVisible}
        >
            <Button
                className={styles.closeButton}
                size="large"
                onClick={() => setIsVisible(false)}
            >
                <img
                    width={14}
                    height={14}
                    src="/img/icons/X.svg"
                    alt="trash"
                    className={styles.icon}
                />
            </Button>

            <div className={styles.addCatalogModal}>
                <h2>
                    {edit === 'edit'
                        ? edittype === 'catalog'
                            ? 'Kataloqa düzəliş et'
                            : `Alt kataloqa düzəliş et`
                        : type === 'catalog'
                        ? 'Yeni Kataloq'
                        : `Yeni alt kataloq - ${parentCatalogName}`}
                </h2>

                <Form onSubmit={event => addCatalog(event)}>
                    <ProFormItem
                        label={
                            edit === 'edit' ? 'Kataloqun növü' : 'Məhsul növü'
                        }
                        name="productType"
                        help={getFieldError('productType')?.[0]}
                        customStyle={styles.formItem}
                        hidden={
                            edit === 'edit'
                                ? edittype === 'sub-catalog'
                                : type === 'sub-catalog'
                        }
                    >
                        {getFieldDecorator('productType', {
                            rules: [],
                        })(
                            <Radio.Group style={{ fontSize: '14px' }}>
                                <Radio value={1}>
                                    {' '}
                                    {edit === 'edit'
                                        ? 'Məhsul'
                                        : 'Fiziki məhsul'}
                                </Radio>
                                <Radio disabled={radioDisabled} value={2}>
                                    Xidmət
                                </Radio>
                            </Radio.Group>
                        )}
                    </ProFormItem>

                    <ProFormItem
                        label={
                            type === 'catalog' || edittype === 'catalog'
                                ? `Kataloq adı`
                                : `Alt kataloq adı`
                        }
                        customStyle={styles.formItem}
                        help={getFieldError('name')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('name', {
                            rules: [
                                requiredRule,
                                minLengthRule,
                                mediumTextMaxRule,
                            ],
                        })(<Input size="large" placeholder="Yazın" />)}
                    </ProFormItem>
                    <ProFormItem
                        label="Seriya nömrəsi"
                        name="serialNumber"
                        help={getFieldError('serialNumber')?.[0]}
                        customStyle={styles.formItem}
                        hidden={
                            edit === 'edit'
                                ? !!(
                                      getFieldValue('productType') === 2 ||
                                      edittype === 'sub-catalog'
                                  )
                                : !!(
                                      getFieldValue('productType') === 2 ||
                                      type === 'sub-catalog'
                                  )
                        }
                    >
                        {getFieldDecorator('serialNumber', {
                            rules: [],
                        })(
                            <Radio.Group
                                style={{ fontSize: '14px' }}
                                disabled={edit === 'edit'}
                            >
                                <Radio value={2}>Yox</Radio>
                                <Radio value={1}>Hə</Radio>
                            </Radio.Group>
                        )}
                    </ProFormItem>
                    <AddButton
                        loading={actionLoading}
                        htmlType="submit"
                        label={
                            edit === 'edit'
                                ? edittype === 'catalog'
                                    ? `Kataloqu yenilə`
                                    : `Alt kataloqu yenilə`
                                : type === 'catalog'
                                ? `Kataloq əlavə et`
                                : `Alt kataloq əlavə et`
                        }
                    />
                </Form>
            </div>
        </Modal>
    );
};

const mapStateToProps = state => ({
    isLoading: state.catalogsReducer.isLoading,
    actionLoading: state.catalogsReducer.actionLoading,
});

export default connect(
    mapStateToProps,
    {
        createCatalog,
        fetchCatalogs,
        editCatalog,
        fetchPurchaseCatalogs,
    }
)(Form.create({ name: 'CatalogForm' })(AddCatalog));
