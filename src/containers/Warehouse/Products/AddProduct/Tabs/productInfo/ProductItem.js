/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Modal } from 'antd';
import { ProFormItem, ProSelect, ProAsyncSelect } from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { toast } from 'react-toastify';
import styles from '../../styles.module.scss';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { fetchCustomerTypes } from 'store/actions/contacts-new';
import { Tooltip } from 'antd';
import AddProItemType from './AddProItemType';
import { fetchFilteredProductPriceTypes } from 'store/actions/settings/mehsul';
const ProductItem = props => {
    const {
        form,
        id,
        priceTypeData,
        setPriceTypeData,
        removeData,
        allDataPriceEdit,
        setAllDataPriceEdit,
        fetchCustomerTypes,
        visible,
        ProductPriceTypesSelect,
        productPriceTypes,
        filteredProductPriceTypes,
        fetchFilteredProductPriceTypes,
        setProductPriceTypesSelect,
        setIsVisible,
    } = props;
    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    const ajaxProductPriceTypesSelectRequest = (
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
        fetchCustomerTypes({
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
                    setProductPriceTypesSelect(appendList);
                } else {
                    setProductPriceTypesSelect(
                        ProductPriceTypesSelect.concat(appendList)
                    );
                }
            },
        });
    };
    const priceType = [];
    ProductPriceTypesSelect.forEach(element => {
        if (element.isDeletable === true) {
            priceType.push(element);
        }
    });
    const [typeVisible, SettypeVisible] = useState(false);
    const [addedType, SetAddedType] = useState(undefined);
    const [addedProductType, setAddedProductType] = useState([]);
    const handleProItemType = () => {
        SettypeVisible(true);
    };
    const selectData = priceType.filter(
        element => ![...removeData?.map(el => el?.id)]?.includes(element.id)
    );
    const selectDataId = priceType.filter(
        element =>
            ![...allDataPriceEdit?.map(el => el?.price_type_id)]?.includes(
                element.id
            )
    );

    const dataPrice = [];

    const handleFormSubmit = event => {
        event.preventDefault();

        validateFields((errors, values) => {
            if (!errors) {
                const { reason } = values;
                reason.forEach(element => {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const i in filteredProductPriceTypes) {
                        if (element === filteredProductPriceTypes[i].id) {
                            if (id) {
                                dataPrice.push({
                                    price_type_id: element,
                                    price_type_name: (element =
                                        filteredProductPriceTypes[i].name),
                                });
                            } else {
                                dataPrice.push({
                                    id: element,
                                    name: (element =
                                        filteredProductPriceTypes[i].name),
                                });
                            }
                        }
                    }
                });
                setAddedProductType([]);
                if (id) {
                    return setAllDataPriceEdit(
                        [...allDataPriceEdit, ...dataPrice],

                        toast.success('Əlavə edildi.'),
                        setIsVisible(false)
                    );
                }
                return setPriceTypeData(
                    {
                        dataPrice: [...priceTypeData.dataPrice, ...dataPrice],
                    },
                    toast.success('Əlavə edildi.'),
                    setIsVisible(false)
                );
            }
        });
    };

    useEffect(() => {
        if (addedType) {
            setFieldsValue({
                reason: getFieldValue('reason')
                    ? [
                          filteredProductPriceTypes.find(
                              item => item.name === addedType
                          )?.id,
                          ...getFieldValue('reason').map(Number),
                      ]
                    : [
                          filteredProductPriceTypes.find(
                              item => item.name === addedType
                          )?.id,
                      ],
            });
            SetAddedType(undefined);
        }
    }, [filteredProductPriceTypes]);

    useEffect(() => {
        if (getFieldValue('reason')&&!addedType) {
            fetchFilteredProductPriceTypes({
                filters: { ids: getFieldValue('reason') },
                onSuccessCallback: data => {
                    if (data.data) {
                        setAddedProductType(data.data);
                    }
                },
            });
        }
    }, [addedType,getFieldValue('reason')]);

    useEffect(() => {
        if (filteredProductPriceTypes?.find(item => item.name == addedType)) {
            SettypeVisible(false);
        }
    }, [filteredProductPriceTypes]);

    return (
        <>
            <AddProItemType
                isVisible={typeVisible}
                SettypeVisible={SettypeVisible}
                selectData={selectData}
                SetAddedType={SetAddedType}
            />
            <Modal
                visible={visible}
                onCancel={() => setIsVisible(false)}
                closable={false}
                width={450}
                footer={null}
                className={styles.customModal}
                destroyOnClose
                // maskClosable={false}
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
                <div className={styles.demoModal}>
                    <div style={{ marginBottom: '20px' }}>
                        <span className={styles.header}>
                            Qiymət tipi əlavə et
                        </span>
                    </div>
                    <Form
                        className={styles.form}
                        onSubmit={event => handleFormSubmit(event)}
                    >
                        <div style={{ position: 'relative' }}>
                            <Tooltip title="Yeni qiymət tipi əlavə et">
                                <PlusIcon
                                    color="#FF716A"
                                    className={styles.plusBtn}
                                    onClick={() => handleProItemType()}
                                />
                            </Tooltip>

                            <ProFormItem
                                label="Qiymət tipi"
                                name="reason"
                                help={getFieldError('reason')?.[0]}
                                customStyle={styles.formItem}
                            >
                                {getFieldDecorator('reason', {
                                    rules: [requiredRule],
                                })(
                                    <ProAsyncSelect
                                        selectRequest={
                                            ajaxProductPriceTypesSelectRequest
                                        }
                                        mode="multiple"
                                        data={
                                            addedProductType.length > 0
                                                ? id
                                                    ? [
                                                          ...addedProductType,
                                                          ...selectDataId.filter(
                                                              item =>
                                                                  !addedProductType
                                                                      .map(
                                                                          ({
                                                                              id,
                                                                          }) =>
                                                                              id
                                                                      )
                                                                      ?.includes(
                                                                          item.id
                                                                      )
                                                          ),
                                                      ]
                                                    : [
                                                          ...addedProductType,
                                                          ...selectData.filter(
                                                              item =>
                                                                  !addedProductType
                                                                      .map(
                                                                          ({
                                                                              id,
                                                                          }) =>
                                                                              id
                                                                      )
                                                                      ?.includes(
                                                                          item.id
                                                                      )
                                                          ),
                                                      ]
                                                : id
                                                ? selectDataId
                                                : selectData
                                        }
                                    />
                                )}
                            </ProFormItem>

                            <Button
                                size="large"
                                className={styles.button}
                                style={{ width: '100%', marginTop: 'unset' }}
                                htmlType="submit"
                            >
                                {'Əlavə et'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </>
    );
};

const mapStateToProps = state => ({
    productPriceTypes: state.mehsulReducer.productPriceTypes,
    filteredProductPriceTypes: state.mehsulReducer.filteredProductPriceTypes,
});

export default connect(
    mapStateToProps,
    { fetchCustomerTypes, fetchFilteredProductPriceTypes }
)(Form.create({ name: 'ProductItem' })(ProductItem));
