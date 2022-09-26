import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button, Form, Table, Checkbox, Tooltip } from 'antd';
import { setSelectedProductionEmployeeExpense } from 'store/actions/sales-operation';
import {
    ProDatePicker,
    ProFormItem,
    ProInput,
    ProSelect,
} from 'components/Lib';
import {
    dateFormat,
    formatNumberToLocale,
    defaultNumberFormat,
    today,
} from 'utils';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import { useDebouncedCallback } from 'use-debounce';
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import swal from '@sweetalert/with-react';
import { dinamicMaxLengthRule, minLengthRule, requiredRule } from 'utils/rules';
import moment from 'moment';
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
        <strong></strong>
        <strong style={{ marginRight: '20px' }}>{quantity}</strong>
        <strong></strong>
    </div>
);

function ExpenseEmployeeAdd({
    visible,
    form,
    mainCurrency,
    selectedProductionEmployeeExpense,
    setSelectedProductionEmployeeExpense,
    changeCost,
    disabledDate,
    reportsFilteredData,
    selectedYearandMonth,
    setselectedYearandMonth,
    isLoading,
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
    const stopPropagationHandle = e => {
        if (e) e.stopPropagation();
    };

    const onChangeHandle = (e, row) => {
        dispatch(
            setSelectedProductionEmployeeExpense({
                newSelectedProductionEmployeeExpense: selectedProductionEmployeeExpense.map(
                    (item, index) => {
                        if (index === row) {
                            return { ...item, applyToSalary: e.target.checked };
                        }
                        return item;
                    }
                ),
            })
        );
    };

    const [debouncedCallback] = useDebouncedCallback((e, index) => {
        stopPropagationHandle(e);
        onChangeHandle(e, index);
    }, 200);

    useEffect(() => {
        if (!visible) {
            setFieldsValue({
                staff: undefined,
                name: null,
                operationDate: moment(),
                type: undefined,
                hour: null,
                amount: null,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useEffect(() => {
        if (selectedYearandMonth) {
            setFieldsValue({
                operationDate: moment(selectedYearandMonth, dateFormat),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYearandMonth]);

    useEffect(() => {
        if (!editModal) {
            setselectedYearandMonth(today);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editModal]);

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
                const selectedEmployeeExpense = selectedProductionEmployeeExpense.filter(
                    (selectedProduct, index) => index === id
                );
                const newSelectedProductionEmployeeExpense = selectedProductionEmployeeExpense.filter(
                    (selectedProduct, index) => index !== id
                );
                dispatch(
                    setSelectedProductionEmployeeExpense({
                        newSelectedProductionEmployeeExpense,
                    })
                );
                changeCost({
                    price: math.mul(
                        Number(selectedEmployeeExpense[0]?.price || 0),
                        Number(selectedEmployeeExpense[0]?.hours || 1),
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
            title: 'Ştat növü',
            dataIndex: 'staffEmployeeId',
            width: 115,
            align: 'left',
            render: value => (value !== null ? 'Ştat' : 'Ştatdankənar'),
        },
        {
            title: 'Əməkdaşın adı',
            dataIndex: 'employeeName',
            width: 180,
            className: styles.employeeTd,
            ellipsis: {
                showTitle: false,
            },
            align: 'left',
            render: (value, row) =>
                row?.staffEmployeeId !== null ? (
                    <Tooltip
                        placement="topLeft"
                        title={`${
                            row.staffEmployeeName
                        } ${row.staffEmployeeSurname ||
                            ''} ${row.staffEmployeePatronymic || ''}`}
                    >
                        <span>{`${
                            row.staffEmployeeName
                        } ${row.staffEmployeeSurname ||
                            ''} ${row.staffEmployeePatronymic || ''}`}</span>
                    </Tooltip>
                ) : (
                    <Tooltip placement="topLeft" title={value}>
                        <span>{value}</span>
                    </Tooltip>
                ),
        },
        {
            title: 'Tip',
            dataIndex: 'type',
            width: 100,
            align: 'center',
            render: value => (value === 1 ? 'Vaxtamuzd' : 'İşəmuzd'),
        },
        {
            title: 'Saat',
            dataIndex: 'hours',
            width: 80,
            align: 'center',
            render: value =>
                value ? formatNumberToLocale(defaultNumberFormat(value)) : '-',
        },
        {
            title: `Məbləğ (${mainCurrency?.code})`,
            dataIndex: 'price',
            align: 'center',
            width: 120,
            render: value =>
                `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${
                    mainCurrency?.code
                }`,
        },
        {
            title: `Toplam (${mainCurrency?.code})`,
            dataIndex: 'hours',
            align: 'center',
            width: 120,
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(
                        value
                            ? Number(value) > 0 && Number(row.price) > 0
                                ? math.mul(Number(value), Number(row.price))
                                : 0
                            : row.price || 0
                    )
                )} ${mainCurrency?.code}`,
        },
        {
            title: 'ƏH tətbiq olunsun',
            dataIndex: 'applyToSalary',
            width: 80,
            align: 'center',
            render: (value, row, index) =>
                row.staffEmployeeId !== null ? (
                    <Checkbox
                        disabled={row.isArchived}
                        onChange={e => debouncedCallback(e, index)}
                        onClick={stopPropagationHandle}
                        checked={value}
                    />
                ) : (
                    '-'
                ),
        },
        {
            title: 'Seç',
            width: 70,
            align: 'right',
            render: (value, row, index) => (
                <PopContent
                    id={index}
                    data={row}
                    isEditDisabled={row.isArchived}
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
                    amount,
                    type,
                    hour,
                    staff,
                } = values;
                const data = {
                    employeeName: staff === 1 ? null : name,
                    staffEmployeeId: staff === 1 ? name : null,
                    staffEmployeeName:
                        staff === 1
                            ? reportsFilteredData.find(({ id }) => id === name)
                                  .name
                            : null,
                    staffEmployeeSurname:
                        staff === 1
                            ? reportsFilteredData.find(({ id }) => id === name)
                                  .surname
                            : null,
                    staffEmployeePatronymic:
                        staff === 1
                            ? reportsFilteredData.find(({ id }) => id === name)
                                  .patronymic
                            : null,
                    date: operationDate.format(dateFormat),
                    price: Number(amount),
                    type,
                    hours: hour,
                    applyToSalary: false,
                };
                dispatch(
                    setSelectedProductionEmployeeExpense({
                        newSelectedProductionEmployeeExpense: [
                            data,
                            ...selectedProductionEmployeeExpense,
                        ],
                    })
                );
                setFieldsValue({
                    staff: undefined,
                    name: null,
                    operationDate: moment(),
                    amount: null,
                    type: undefined,
                    hour: null,
                });
                changeCost({
                    price: math.mul(Number(amount), Number(hour || 1) || 0),
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
                selectedYearandMonth={selectedYearandMonth}
                setselectedYearandMonth={setselectedYearandMonth}
            />
            <div className={styles.exportBox}>
                <span
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginRight: '50px',
                    }}
                >
                    İşçilik
                </span>
            </div>
            <div>
                {
                    <div className={styles.infoWarning}>
                        <p className={styles.fade}>
                            Yalnız "Ştat" növlü əməkdaşlara təyin edilmiş
                            işçilik xərcləri "ƏH tətbiq olsun" seçilən halda
                            əməkhaqqı hesabatında əks olunacaqdır
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
                        })(
                            <ProDatePicker
                                disabledDate={disabledDate}
                                onChange={(_, selectedDate) => {
                                    setselectedYearandMonth(selectedDate);
                                }}
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        style={{ width: '65%', marginBottom: '10px' }}
                        label="Ştat növü"
                        help={getFieldError('staff')?.[0]}
                    >
                        {getFieldDecorator('staff', {
                            getValueFromEvent: staff => staff,
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                allowClear={false}
                                placeholder="Seçin"
                                data={[
                                    { id: 1, name: 'Ştat' },
                                    { id: 2, name: 'Ştatdan kənar' },
                                ]}
                                onChange={() =>
                                    setFieldsValue({ name: undefined })
                                }
                            />
                        )}
                    </ProFormItem>
                    {getFieldValue('staff') === 1 ? (
                        <ProFormItem
                            customStyle={styles.employeeSelect}
                            label="Əməkdaşın adı"
                            help={getFieldError('name')?.[0]}
                        >
                            {getFieldDecorator('name', {
                                rules: [requiredRule],
                            })(
                                <ProSelect
                                    loading={isLoading}
                                    allowClear={false}
                                    placeholder="Seçin"
                                    data={reportsFilteredData}
                                    keys={['name', 'surname', 'patronymic']}
                                />
                            )}
                        </ProFormItem>
                    ) : (
                        <ProFormItem
                            label="Əməkdaşın adı"
                            help={getFieldError('name')?.[0]}
                        >
                            {getFieldDecorator('name', {
                                rules: [
                                    requiredRule,
                                    minLengthRule,
                                    dinamicMaxLengthRule(90),
                                ],
                            })(<ProInput />)}
                        </ProFormItem>
                    )}
                    <ProFormItem
                        style={{ width: '65%', marginBottom: '10px' }}
                        label="Tip"
                        help={getFieldError('type')?.[0]}
                    >
                        {getFieldDecorator('type', {
                            getValueFromEvent: type => {
                                if (type === 2)
                                    setFieldsValue({ hour: undefined });
                                return type;
                            },
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                allowClear={false}
                                placeholder="Seçin"
                                data={[
                                    { id: 1, name: 'Vaxtamuzd' },
                                    { id: 2, name: 'İşəmuzd' },
                                ]}
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        style={{ width: '65%' }}
                        label="Saat"
                        help={getFieldError('hour')?.[0]}
                    >
                        {getFieldDecorator('hour', {
                            getValueFromEvent: event =>
                                handleAmount(event, 'hour'),
                            rules:
                                getFieldValue('type') === 2
                                    ? []
                                    : [requiredRule],
                        })(<ProInput disabled={getFieldValue('type') === 2} />)}
                    </ProFormItem>
                    <ProFormItem
                        style={{ width: '80%' }}
                        label={`Məbləğ (${mainCurrency?.code})`}
                        help={getFieldError('amount')?.[0]}
                    >
                        {getFieldDecorator('amount', {
                            getValueFromEvent: event =>
                                handleAmount(event, 'amount'),
                            rules: [requiredRule],
                        })(<ProInput />)}
                    </ProFormItem>
                    <Button
                        type="primary"
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
                    dataSource={selectedProductionEmployeeExpense}
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
                        selectedProductionEmployeeExpense.reduce(
                            (total, { price, hours }) =>
                                math.add(
                                    total,
                                    math.mul(
                                        Number(price),
                                        Number(hours || 1)
                                    ) || 0
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
    selectedProductionEmployeeExpense:
        state.salesOperation.selectedProductionEmployeeExpense,
    reportsFilteredData: state.reportReducer.reports,
    isLoading: !!state.loadings.reports,
});

export default connect(
    mapStateToProps,
    {
        setSelectedProductionEmployeeExpense,
    }
)(Form.create({ name: 'ProductionExpenseEmloyeeForm' })(ExpenseEmployeeAdd));
