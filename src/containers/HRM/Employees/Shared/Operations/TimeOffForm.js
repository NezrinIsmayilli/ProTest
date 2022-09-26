import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import useForm from 'react-hook-form';
import { createSelector } from 'reselect';
import moment from 'moment';
import {
    ProFormItem,
    ProSelect,
    InfoCard,
    FormTextarea,
    ProDatePicker,
    ProTimePicker,
} from 'components/Lib';
import { Button, Row, Col } from 'antd';
import { ReactComponent as PermissionIcon } from 'assets/img/icons/permission.svg';
import {
    createEmployeeActivityTimeOff,
    editEmployeeActivityTimeOff,
    infoEmployeeActivityTimeOff,
} from 'store/actions/employeeActivity/employeeActivityTimeOff';
import { fetchWorkers } from 'store/actions/hrm/workers';
import { fetchTimeOffReasons } from 'store/actions/settings/hr';

import { history } from 'utils/history';
import { todayWithMinutes, dateFormat, toastHelper } from 'utils';

import styles from './styles.module.scss';

function TimeOffForm(props) {
    const {
        id,
        handleCancel,
        infoData,
        createEmployeeActivityTimeOff,
        fetchWorkers,
        fetchTimeOffReasons,
        timeOffReasonsCount,
        timeOffReasons,
        isLoading,
        isEdit,
        editEmployeeActivityTimeOff,
        infoEmployeeActivityTimeOff,
    } = props;

    const {
        register,
        unregister,
        errors,
        handleSubmit,
        setValue,
        getValues,
        reset,
    } = useForm();

    const returnUrl = '/hrm/employees/workers';
    const returnEditUrl = '/hrm/employees/operations';

    useEffect(() => {
        register({ name: 'reason' }, { required: 'error' });
        register({ name: 'startDatepicker' });
        register({ name: 'startTimepicker' });
        register({ name: 'endDatepicker' });
        register({ name: 'endTimepicker' });

        return () => {
            unregister({ name: 'reason' });
            unregister({ name: 'startDatepicker' });
            unregister({ name: 'startTimepicker' });
            unregister({ name: 'endDatepicker' });
            unregister({ name: 'endTimepicker' });
        };
    }, [register, unregister]);

    const {
        startDatepicker,
        endDatepicker,
        startTimepicker,
        endTimepicker,
        reason,
    } = getValues();

    useEffect(() => {
        if (timeOffReasonsCount === 0) {
            fetchTimeOffReasons();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeOffReasonsCount]);

    useEffect(() => {
        if (isEdit && infoData) {
            setValue('startDatepicker', infoData.startDate.split(' ')[0]);
            setValue('startTimepicker', infoData.startDate.split(' ')[1]);
            setValue('endDatepicker', infoData.endDate.split(' ')[0]);
            setValue('endTimepicker', infoData.endDate.split(' ')[1]);
            setValue('reason', infoData.timeOffReasonId);
            setValue('note', infoData.note);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, infoData]);

    useEffect(() => {
        if (timeOffReasons.length === 1) {
            setValue('reason', timeOffReasons[0].id);
        }
    }, [timeOffReasons]);

    const onChange = React.useCallback(
        event => {
            const { name, value = '' } = event.target || {};
            setValue(name, value, true);
        },
        [setValue]
    );

    function onSuccessCallBack(message) {
        return () => {
            fetchWorkers({
                filters: {
                    lastEmployeeActivityType: 1,
                },
            });
            handleCancel(null);
            reset();
            return toastHelper(history, returnUrl, message);
        };
    }

    function onEditSuccessCallBack(message, id) {
        return () => {
            infoEmployeeActivityTimeOff(id);
            return toastHelper(history, returnEditUrl, message);
        };
    }

    const handleEmployeeActivityFire = data => {
        const postData = {
            employee: id,
            orderNumber: null,
            startDate: `${data.startDatepicker ||
                moment().format('DD-MM-YYYY')} ${data.startTimepicker ||
                moment().format('HH:mm')}`,
            endDate: `${data.endDatepicker ||
                moment().format('DD-MM-YYYY')} ${data.endTimepicker ||
                moment().format('HH:mm')}`,
            timeOffReason: data.reason,
            note: data.note || null,
        };
        if (isEdit) {
            postData.employee = Number(infoData.employeeId);
            editEmployeeActivityTimeOff(
                infoData.id,
                postData,
                onEditSuccessCallBack('İcazəyə dəyişiklik edildi.', infoData.id)
            );
        } else {
            createEmployeeActivityTimeOff(
                postData,
                onSuccessCallBack('İşçiyə icazə verildi.')
            );
        }
    };
    function disabledDate(current) {
        const dateObj = new Date(
            startDatepicker &&
                startDatepicker.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
        );
        return current && current < moment(dateObj);
    }

    return (
        <div className={styles.operationBox}>
            <div className={styles.padding24}>
                <InfoCard
                    name={infoData.name}
                    surname={infoData.surname}
                    patronymic={infoData.patronymic}
                    occupationName={infoData.occupationName}
                    attachmentUrl={infoData.attachmentUrl}
                    width="48px"
                    height="48px"
                />
            </div>

            <div
                className={`${styles.operationType} ${styles.padding24} ${styles.flexCenter}`}
            >
                <PermissionIcon />
                <h3>İcazə</h3>
            </div>
            <form
                className={styles.padding24}
                onSubmit={handleSubmit(handleEmployeeActivityFire)}
            >
                <ProFormItem label="Tarix">
                    <p className={styles.disabledInput}>{todayWithMinutes}</p>
                </ProFormItem>

                <ProFormItem label="Başlama">
                    <Row gutter={32}>
                        <Col span={16}>
                            <ProDatePicker
                                name="startDatepicker"
                                disabledDate={d =>
                                    !d ||
                                    d.isBefore(
                                        moment(infoData.hireDate, dateFormat)
                                    )
                                }
                                value={
                                    startDatepicker
                                        ? moment(startDatepicker, dateFormat)
                                        : moment()
                                }
                                onChange={(_, selectedDate) => {
                                    onChange({
                                        target: {
                                            name: 'startDatepicker',
                                            value: selectedDate,
                                        },
                                    });
                                }}
                            />
                        </Col>
                        <Col span={8} className={styles.noPaddingLeft}>
                            <ProTimePicker
                                name="startTimepicker"
                                value={
                                    startTimepicker
                                        ? moment(startTimepicker, 'HH:mm')
                                        : moment()
                                }
                                onChange={(_, selectedDate) => {
                                    onChange({
                                        target: {
                                            name: 'startTimepicker',
                                            value: selectedDate,
                                        },
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                </ProFormItem>

                <ProFormItem label="Bitmə">
                    <Row gutter={32}>
                        <Col span={16}>
                            <ProDatePicker
                                name="endDatepicker"
                                disabledDate={disabledDate}
                                allowClear={false}
                                value={
                                    endDatepicker
                                        ? moment(endDatepicker, dateFormat)
                                        : moment()
                                }
                                onChange={(_, selectedDate) => {
                                    onChange({
                                        target: {
                                            name: 'endDatepicker',
                                            value: selectedDate,
                                        },
                                    });
                                }}
                            />
                        </Col>
                        <Col span={8} className={styles.noPaddingLeft}>
                            <ProTimePicker
                                name="endTimepicker"
                                value={
                                    endTimepicker
                                        ? moment(endTimepicker, 'HH:mm')
                                        : moment()
                                }
                                onChange={(_, selectedDate) => {
                                    onChange({
                                        target: {
                                            name: 'endTimepicker',
                                            value: selectedDate,
                                        },
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                </ProFormItem>

                <ProFormItem
                    required
                    label="Səbəb"
                    validateStatus={errors.reason}
                >
                    <ProSelect
                        name="reason"
                        data={timeOffReasons}
                        hasError={errors.reason}
                        value={reason}
                        onChange={value =>
                            onChange({ target: { name: 'reason', value } })
                        }
                    />
                </ProFormItem>

                <FormTextarea
                    label="Qeyd"
                    name="note"
                    maxLength={170}
                    ref={register({
                        required: false,
                        validate: value => {
                            if (value.length && value.length < 3) {
                                return 'Bu dəyər 3 simvoldan az olmamalıdır.';
                            }
                            return true;
                        },
                    })}
                    message={errors.note && errors.note.message}
                />
                <div className={`${styles.txtRight} ${styles.marginTop36}`}>
                    <Button
                        className={styles.cancelBtnNoBordered}
                        size="large"
                        onClick={() => {
                            handleCancel(null);
                            reset();
                        }}
                    >
                        İmtina
                    </Button>
                    <Button
                        disabled={false}
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isLoading}
                    >
                        Təsdiq et
                    </Button>
                </div>
            </form>
        </div>
    );
}

const getTimeOffReasonsLength = createSelector(
    state => state.hrReducer.timeOffReasons,
    timeOffReasonsCount => timeOffReasonsCount.length
);

const mapStateToProps = state => ({
    isLoading: !!state.loadings.employeeActivityTimeOffs,
    timeOffReasons: state.hrReducer.timeOffReasons,
    timeOffReasonsCount: getTimeOffReasonsLength(state),
});

export default connect(
    mapStateToProps,
    {
        fetchWorkers,
        createEmployeeActivityTimeOff,
        fetchTimeOffReasons,
        editEmployeeActivityTimeOff,
        infoEmployeeActivityTimeOff,
    }
)(TimeOffForm);
