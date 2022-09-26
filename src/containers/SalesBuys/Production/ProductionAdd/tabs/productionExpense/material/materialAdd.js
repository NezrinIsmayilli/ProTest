import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button, Form, Table } from 'antd';
import moment from 'moment';
import { setSelectedProductionMaterial } from 'store/actions/sales-operation';
import {
    ProDatePicker,
    ProFormItem,
    ProInput,
    ProSelect,
} from 'components/Lib';
import { dateFormat, formatNumberToLocale, defaultNumberFormat } from 'utils';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import swal from '@sweetalert/with-react';
import { minLengthRule, requiredRule } from 'utils/rules';
import EditModal from './editModal';
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
        <strong></strong>
        <strong style={{ marginLeft: '30px' }}>{quantity}</strong>
        <strong>{secondary}</strong>
    </div>
);

function MaterialAdd({
    visible,
    form,
    mainCurrency,
    selectedProductionMaterial,
    setSelectedProductionMaterial,
    measurements,
    changeCost,
    permissionsByKeyValue,
    disabledDate,
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
    //   const { balance_sheet_report } = permissionsByKeyValue;
    //   const isEditDisabled = balance_sheet_report.permission !== 2;

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
                quantity: null,
                amount: null,
            });
        }
        if (measurements.length === 1) {
            setFieldsValue({
                measurement: measurements[0].id,
            });
        }
    }, [visible,selectedProductionMaterial]);

    const handleAmount = (event, field) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
        if (re.test(event.target.value)) return event.target.value;

        if (event.target.value === '') return null;
        return getFieldValue(field);
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
                const newSelectedProductionMaterial = selectedProductionMaterial.filter(
                    (selectedProduct, index) => index !== id
                );
                const selectedMaterial = selectedProductionMaterial.filter(
                    (selectedProduct, index) => index === id
                );
                dispatch(
                    setSelectedProductionMaterial({
                        newSelectedProductionMaterial,
                    })
                );
                changeCost({
                    price: math.mul(
                        Number(selectedMaterial[0]?.price || 0),
                        Number(selectedMaterial[0]?.quantity || 0),
                        -1
                    ),
                });
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
            dataIndex: 'date',
            width: 120,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            width: 150,
            align: 'left',
            render: value => value,
        },
        {
            title: 'Miqdar',
            dataIndex: 'quantity',
            width: 100,
            align: 'left',
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value || 0)
                )} ${measurements.find(
                    measurement => measurement.id === row?.unitOfMeasurementId
                )?.name || ''}`,
        },
        {
            title: `Məbləğ (${mainCurrency?.code})`,
            dataIndex: 'price',
            align: 'center',
            width: 130,
            render: value =>
                `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${
                    mainCurrency?.code
                }`,
        },
        {
            title: `Toplam`,
            dataIndex: 'price',
            align: 'center',
            width: 130,
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(
                        Number(value) > 0 && Number(row.quantity) > 0
                            ? math.mul(Number(value), Number(row.quantity)) || 0
                            : 0
                    )
                )} ${mainCurrency?.code}`,
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
                const {
                    name,
                    operationDate,
                    quantity,
                    amount,
                    measurement,
                } = values;
                const data = {
                    name,
                    date: operationDate.format(dateFormat),
                    price: Number(amount),
                    quantity,
                    unitOfMeasurementId: measurement,
                };
                dispatch(
                    setSelectedProductionMaterial({
                        newSelectedProductionMaterial: [
                            data,
                            ...selectedProductionMaterial,
                        ],
                    })
                );
                setFieldsValue({
                    name: null,
                    operationDate: null,
                    amount: null,
                    quantity: null,
                    measurement: undefined,
                });
                changeCost({
                    price: math.mul(Number(amount), Number(quantity) || 0),
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
                measurements={measurements}
                changeCost={changeCost}
            />
            <div className={styles.exportBox}>
                <span
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginRight: '50px',
                    }}
                >
                    Materiallar
                </span>
            </div>
            {
                <div className={styles.infoWarning}>
                    <p className={styles.fade}>
                        Bu pəncərədə aparılan əməliyyatlar ticarət
                        əməliyyatlarında əks olunmayacaq və sənədsiz
                        əməliyyatlar sayılacaqdır.
                    </p>
                    <div>
                        <ExclamationIcon />
                    </div>
                </div>
            }

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
                    <ProFormItem
                        label="Məhsul adı"
                        help={getFieldError('name')?.[0]}
                    >
                        {getFieldDecorator('name', {
                            rules: [requiredRule, minLengthRule],
                        })(
                            <ProInput
                            // disabled={isEditDisabled}
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        style={{ width: '65%' }}
                        label="Miqdar"
                        help={getFieldError('quantity')?.[0]}
                    >
                        {getFieldDecorator('quantity', {
                            getValueFromEvent: event =>
                                handleAmount(event, 'quantity'),
                            rules: [requiredRule],
                        })(
                            <ProInput
                            // disabled={isEditDisabled}
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        style={{ width: '65%', marginBottom: '10px' }}
                        label="Ölçü vahidi"
                        help={getFieldError('measurement')?.[0]}
                    >
                        {getFieldDecorator('measurement', {
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                data={measurements}
                                placeholder="Seçin"
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        label={`Məbləğ (${mainCurrency?.code})`}
                        help={getFieldError('amount')?.[0]}
                    >
                        {getFieldDecorator('amount', {
                            getValueFromEvent: event =>
                                handleAmount(event, 'amount'),
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
                    scroll={{ x: 'max-content' }}
                    dataSource={selectedProductionMaterial}
                    className={styles.opInvoiceContentTable}
                    columns={columns}
                    pagination={false}
                    rowKey={record => record.id}
                    rowClassName={styles.row}
                />
            </div>
            <FooterRow
                primary="Toplam"
                quantity={`${formatNumberToLocale(
                    defaultNumberFormat(
                        selectedProductionMaterial.reduce(
                            (total, { price, quantity }) =>
                                math.add(
                                    total,
                                    math.mul(Number(price), Number(quantity)) ||
                                        0
                                ),
                            0
                        )
                    )
                )} ${mainCurrency?.code} `}
            />
        </div>
    );
}
const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
});

export default connect(
    mapStateToProps,
    {
        setSelectedProductionMaterial,
    }
)(Form.create({ name: 'MaterialForm' })(MaterialAdd));
