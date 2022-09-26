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
    FormInput,
} from 'components/Lib';
import { Button } from 'antd';
import { ReactComponent as BusinessTripIcon } from 'assets/img/icons/businesstrip.svg';
import {
    createEmployeeActivityBusinessTrip,
    editEmployeeActivityBusinessTrip,
    infoEmployeeActivityBusinessTrip,
} from 'store/actions/employeeActivity/employeeActivityBusinessTrip';
import { fetchWorkers } from 'store/actions/hrm/workers';
import { fetchBusinessTripReasons } from 'store/actions/settings/hr';

import { history } from 'utils/history';
import {
    todayWithMinutes,
    //  today,
    dateFormat,
    toastHelper,
} from 'utils';

import styles from './styles.module.scss';

function BusinessTripForm(props) {
    const {
        id,
        handleCancel,
        infoData,
        createEmployeeActivityBusinessTrip,
        fetchWorkers,
        fetchBusinessTripReasons,
        businessTripReasonsCount,
        businessTripReasons,
        isLoading,
        isEdit,
        editEmployeeActivityBusinessTrip,
        infoEmployeeActivityBusinessTrip,
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
        register({ name: 'startDate' });
        register({ name: 'endDate' });

        return () => {
            unregister({ name: 'reason' });
            unregister({ name: 'startDate' });
            unregister({ name: 'endDate' });
        };
    }, [register, unregister]);

    const { startDate, endDate, reason } = getValues();

    useEffect(() => {
        if (businessTripReasonsCount === 0) {
            fetchBusinessTripReasons();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessTripReasonsCount]);

    useEffect(() => {
        if (isEdit && infoData) {
            setValue('orderNumber', infoData.orderNumber);
            setValue('startDate', infoData.startDate);
            setValue('endDate', infoData.endDate);
            setValue('reason', infoData.businessTripReasonId);
            setValue('address', infoData.address);
            setValue('note', infoData.note);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, infoData]);

    useEffect(() => {
        if (businessTripReasons.length === 1) {
            setValue('reason', businessTripReasons[0].id);
        }
    }, [businessTripReasons]);

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
            infoEmployeeActivityBusinessTrip(id);
            return toastHelper(history, returnEditUrl, message);
        };
    }

    const handleEmployeeActivityBusinessTrip = data => {
        const postData = {
            employee: id,
            orderNumber: data.orderNumber,
            startDate: data.startDate || moment().format('DD-MM-YYYY'),
            endDate: data.endDate || moment().format('DD-MM-YYYY'),
            businessTripReason: data.reason,
            address: data.address || null,
            note: data.note || null,
        };
        if (isEdit) {
            postData.employee = Number(infoData.employeeId);
            editEmployeeActivityBusinessTrip(
                infoData.id,
                postData,
                onEditSuccessCallBack(
                    'Ezamiyyətə dəyişiklik edildi.',
                    infoData.id
                )
            );
        } else {
            createEmployeeActivityBusinessTrip(
                postData,
                onSuccessCallBack('İşçiyə ezamiyyət verildi.')
            );
        }
    };

    function disabledDate(current) {
        const dateObj = new Date(
            startDate &&
                startDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
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
                <BusinessTripIcon />
                <h3>Ezamiyyət</h3>
            </div>
            <form
                className={styles.padding24}
                onSubmit={handleSubmit(handleEmployeeActivityBusinessTrip)}
            >
                <FormInput
                    required
                    label="Sənədin nömrəsi"
                    name="orderNumber"
                    ref={register({ required: 'Bu dəyər boş olmamalıdır.' })}
                    maxLength={30}
                    message={errors.orderNumber && errors.orderNumber.message}
                />
                <ProFormItem label="Tarix">
                    <p className={styles.disabledInput}>{todayWithMinutes}</p>
                </ProFormItem>

                <ProFormItem label="Başlama">
                    <ProDatePicker
                        name="startDate"
                        disabledDate={d =>
                            !d ||
                            d.isBefore(moment(infoData.hireDate, dateFormat))
                        }
                        value={
                            startDate ? moment(startDate, dateFormat) : moment()
                        }
                        onChange={(_, selectedDate) => {
                            onChange({
                                target: {
                                    name: 'startDate',
                                    value: selectedDate,
                                },
                            });
                        }}
                    />
                </ProFormItem>

                <ProFormItem label="Bitmə">
                    <ProDatePicker
                        name="endDate"
                        disabledDate={disabledDate}
                        allowClear={false}
                        value={endDate ? moment(endDate, dateFormat) : moment()}
                        onChange={(_, selectedDate) => {
                            onChange({
                                target: {
                                    name: 'endDate',
                                    value: selectedDate,
                                },
                            });
                        }}
                    />
                </ProFormItem>

                <ProFormItem
                    required
                    label="Səbəb"
                    validateStatus={errors.reason}
                >
                    <ProSelect
                        name="reason"
                        data={businessTripReasons}
                        value={reason}
                        hasError={errors.reason}
                        onChange={value =>
                            onChange({ target: { name: 'reason', value } })
                        }
                    />
                </ProFormItem>
                <FormInput
                    label="Ezam olunacaq ünvan"
                    name="address"
                    ref={register({})}
                    maxLength={90}
                />
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

const getBusinessTripReasonsLength = createSelector(
    state => state.hrReducer.businessTripReasons,
    businessTripReasonsCount => businessTripReasonsCount.length
);

const mapStateToProps = state => ({
    isLoading: !!state.loadings.employeeActivityBusinessTrips,
    businessTripReasons: state.hrReducer.businessTripReasons,
    businessTripReasonsCount: getBusinessTripReasonsLength(state),
});

export default connect(
    mapStateToProps,
    {
        fetchWorkers,
        createEmployeeActivityBusinessTrip,
        fetchBusinessTripReasons,
        editEmployeeActivityBusinessTrip,
        infoEmployeeActivityBusinessTrip,
    }
)(BusinessTripForm);
