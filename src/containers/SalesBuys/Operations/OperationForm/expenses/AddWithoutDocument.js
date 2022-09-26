import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button, Form, Table, Row, Col } from 'antd';
import {
    setSelectedProductionExpense,
    setSelectedImportProducts,
} from 'store/actions/sales-operation';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import {
    ProDatePicker,
    ProFormItem,
    ProInput,
    ProSelect,
} from 'components/Lib';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { dateFormat, formatNumberToLocale, defaultNumberFormat } from 'utils';
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import swal from '@sweetalert/with-react';
import { minLengthRule, requiredRule, mediumTextMaxRule } from 'utils/rules';

import EditModal from './editModal/index';
import styles from '../../../styles.module.scss';

const math = require('exact-math');

export const PopContent = ({
    editClick,
    deleteClick,
    id,
    data,
    isEditDisabled,
}) => (
    <div className={styles.popContent}>
        {editClick && (
            <Button
                style={{ padding: '5px' }}
                disabled={isEditDisabled}
                className={styles.editIcon}
                type="button"
                onClick={() => editClick(id, data)}
            >
                <FaPencilAlt />
            </Button>
        )}
        {deleteClick && (
            <Button
                style={{ padding: '5px' }}
                type="button"
                disabled={isEditDisabled}
                className={styles.trashIcon}
                onClick={() => deleteClick(id)}
            >
                <FaTrash />
            </Button>
        )}
    </div>
);

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
    <div className={styles.opInvoiceContentFooter} style={{ color }}>
        <strong>{primary}</strong>
        <strong></strong>
        <strong></strong>
        <strong style={{ marginLeft: '2%' }}>{quantity}</strong>
        <strong>{secondary}</strong>
    </div>
);

function AddWithoutDocument({
    visible,
    form,
    mainCurrency,
    selectedProductionExpense,
    setSelectedProductionExpense,
    changeCost,
    disabledDate,
    fetchCurrencies,
    currencies,
    setSelectedImportProducts,
    selectedImportProducts,
    rates,
    invoiceCurrencyCode,
}) {
    const componentRef = useRef();
    const dispatch = useDispatch();
    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
    } = form;

    const [editModal, setEditModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(undefined);
    const [selectedItemForUpdate, setSelectedItemForUpdate] = useState(
        undefined
    );

    useEffect(() => {
        if (!visible) {
            setFieldsValue({
                name: null,
                operationDate: null,
                cost: null,
                currency: undefined,
            });
        } else fetchCurrencies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);
    const handleAmount = event => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
        if (re.test(event.target.value) && event.target.value <= 10000000)
            return event.target.value;

        if (event.target.value === '') return null;
        return getFieldValue('cost');
    };
    const editClick = (id, row) => {
        setEditModal(!editModal);
        setSelectedRow(row);
        setSelectedItemForUpdate(id);
    };
    const onSuccessAddModal = () => {};
    const deleteClick = id => {
        swal({
            title: 'Diqqət!',
            text: 'Əməliyyatı silmək istədiyinizə əminsiniz?',
            buttons: ['İmtina', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                // const selectedExpense = selectedProductionExpense.filter(
                //     (selectedProduct, index) => index === id
                // );
                const newSelectedProductionExpense = selectedImportProducts?.filter(
                    (selectedProduct, index) => index !== id
                );
                setSelectedImportProducts(newSelectedProductionExpense);
            }
        });
    };
    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 50,
            render: (value, row, index) => index + 1,
        },
        {
            title: 'Tarix',
            dataIndex: 'operationDate',
            width: 120,
        },
        {
            title: 'Adı',
            dataIndex: 'name',
            ellipsis: true,
            width: 100,
            align: 'left',
            render: value => value,
        },
        {
            title: 'Valyuta',
            dataIndex: 'currencyCode',
            align: 'center',
            width: 80,
            render: value => value,
        },
        {
            title: 'Məbləğ',
            dataIndex: 'endPrice',
            align: 'center',
            width: 150,
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${
                    row.currencyCode
                }`,
        },
        {
            title: `Məbləğ (${invoiceCurrencyCode})`,
            dataIndex: 'endPrice',
            width: 150,
            align: 'center',
            render: (value, row) =>
                formatNumberToLocale(
                    defaultNumberFormat(
                        math.mul(
                            Number(
                                rates[
                                    [
                                        ...new Set(
                                            selectedImportProducts.map(
                                                ({ currencyId }) =>
                                                    Number(currencyId)
                                            )
                                        ),
                                    ].indexOf(row.currencyId)
                                ]?.rate || 1
                            ),
                            Number(value)
                        ) || 0
                    )
                ),
        },
        {
            title: 'Seç',
            width: 90,
            align: 'right',
            render: (value, row, index) => (
                <PopContent
                    id={index}
                    data={row}
                    //   isEditDisabled={isEditDisabled}
                    editClick={editClick}
                    deleteClick={deleteClick}
                />
            ),
        },
    ];

    const handleCompleteOperation = event => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const { name, operationDate, cost, currency } = values;

                const data = {
                    name,
                    operationDate: operationDate?.format(dateFormat),
                    usedPrice: Number(cost),
                    endPrice: Number(cost),
                    currencyId: currency,
                    currencyCode: currencies?.find(({ id }) => id === currency)
                        ?.code,
                    expenseInvoiceId: null,
                    dateForSend: operationDate?.format(dateFormat),
                };
                setSelectedImportProducts([data, ...selectedImportProducts]);
                setFieldsValue({
                    name: null,
                    operationDate: null,
                    cost: null,
                    currency: undefined,
                });
            }
        });
    };
    return (
        <div ref={componentRef} style={{ width: '100%', padding: '20px' }}>
            <EditModal
                isVisible={editModal}
                setIsVisible={setEditModal}
                onSuccessAddModal={onSuccessAddModal}
                row={selectedRow}
                selectedItemForUpdate={selectedItemForUpdate}
                currencyCode={mainCurrency?.code}
                changeCost={changeCost}
                currencies={currencies}
                setSelectedImportProducts={setSelectedImportProducts}
                selectedImportProducts={selectedImportProducts}
            />
            <div className={styles.exportBox}>
                <span
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginRight: '50px',
                    }}
                >
                    Xərclər
                </span>
            </div>
            <div>
                {
                    <div className={styles.infoWarning}>
                        <p className={styles.fade}>
                            Bu pəncərədə aparılan əməliyyatlar sizin hesablarda
                            olan pul qalıqlarında əks olunmayacaq və sənədsiz
                            əməliyyatlar sayılacaqdır.
                        </p>
                        <div>
                            <ExclamationIcon />
                        </div>
                    </div>
                }
            </div>
            <div
                className={styles.exportBox}
                style={{
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: 40,
                }}
            >
                <Form
                    className={styles.balanceForm}
                    layout="vertical"
                    onSubmit={handleCompleteOperation}
                >
                    <ProFormItem
                        label="Tarix"
                        help={getFieldError('operationDate')?.[0]}
                    >
                        {getFieldDecorator('operationDate', {
                            getValueFromEvent: date => date,
                            rules: [requiredRule],
                        })(<ProDatePicker disabledDate={disabledDate} />)}
                    </ProFormItem>
                    <ProFormItem label="Adı" help={getFieldError('name')?.[0]}>
                        {getFieldDecorator('name', {
                            rules: [
                                requiredRule,
                                minLengthRule,
                                mediumTextMaxRule,
                            ],
                        })(
                            <ProInput
                            // disabled={isEditDisabled}
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        label="Valyuta"
                        help={getFieldError('currency')?.[0]}
                    >
                        {getFieldDecorator('currency', {
                            getValueFromEvent: event => event,
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                keys={['code']}
                                data={currencies}
                                allowClear={false}
                                // disabled={isDisabled}
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        label="Məbləğ"
                        help={getFieldError('cost')?.[0]}
                    >
                        {getFieldDecorator('cost', {
                            getValueFromEvent: event => handleAmount(event),
                            rules: [requiredRule],
                        })(
                            <ProInput
                            // disabled={isEditDisabled}
                            />
                        )}
                    </ProFormItem>
                    <Button
                        type="primary"
                        // disabled={isEditDisabled}
                        className={styles.addCategoryButton}
                        size="large"
                        htmlType="submit"
                    >
                        <FaPlus className={styles.buttonIcon} />
                    </Button>
                </Form>
            </div>
            <div
                className={styles.opInvTable}
                style={{
                    marginTop: 32,
                    maxHeight: 600,
                    paddingRight: 8,
                    overflowY: 'auto',
                }}
            >
                <Table
                    dataSource={selectedImportProducts?.filter(
                        ({ expenseInvoiceId }) => expenseInvoiceId === null
                    )}
                    className={styles.opInvoiceContentTable}
                    columns={columns}
                    pagination={false}
                    rowKey={record => record.id}
                    rowClassName={styles.row}
                    scroll={{ y: 500 }}
                />{' '}
            </div>
            <FooterRow
                primary="Toplam"
                quantity={`${formatNumberToLocale(
                    defaultNumberFormat(
                        selectedImportProducts
                            ?.filter(
                                ({ expenseInvoiceId }) =>
                                    expenseInvoiceId === null
                            )
                            .reduce(
                                (total, { usedPrice, currencyId }) =>
                                    math.add(
                                        total,
                                        Number(
                                            math.mul(
                                                Number(
                                                    rates[
                                                        [
                                                            ...new Set(
                                                                selectedImportProducts.map(
                                                                    ({
                                                                        currencyId,
                                                                    }) =>
                                                                        Number(
                                                                            currencyId
                                                                        )
                                                                )
                                                            ),
                                                        ].indexOf(currencyId)
                                                    ]?.rate || 1
                                                ),
                                                Number(usedPrice || 0)
                                            )
                                        ) || 0
                                    ),
                                0
                            )
                    )
                )} ${invoiceCurrencyCode}`}
            />
        </div>
    );
}
const mapStateToProps = state => ({
    selectedProductionExpense: state.salesOperation.selectedProductionExpense,
    currencies: state.kassaReducer.currencies,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    selectedImportProducts: state.salesOperation.selectedImportProducts,
});

export default connect(
    mapStateToProps,
    { setSelectedProductionExpense, fetchCurrencies, setSelectedImportProducts }
)(Form.create({ name: 'AddWithoutDocumentForm' })(AddWithoutDocument));
