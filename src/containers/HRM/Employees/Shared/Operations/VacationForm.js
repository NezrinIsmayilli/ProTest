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
import { ReactComponent as PalmaIcon } from 'assets/img/icons/palma.svg';
import {
    createEmployeeActivityVacation,
    editEmployeeActivityVacation,
    infoEmployeeActivityVacation,
} from 'store/actions/employeeActivity/employeeActivityVacation';
import { fetchWorkers } from 'store/actions/hrm/workers';
import { fetchVacationTypes } from 'store/actions/settings/hr';

import { history } from 'utils/history';
import { todayWithMinutes, today, dateFormat, toastHelper } from 'utils';

import styles from './styles.module.scss';

const returnUrl = '/hrm/employees/workers';
const returnEditUrl = '/hrm/employees/operations';

function VacationForm(props) {
    const {
        id,
        handleCancel,
        infoData,
        createEmployeeActivityVacation,
        fetchWorkers,
        fetchVacationTypes,
        vacationTypesCount,
        vacationTypes,
        isLoading,
        isEdit,
        editEmployeeActivityVacation,
        infoEmployeeActivityVacation,
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

    useEffect(() => {
        register({ name: 'vacationType' }, { required: 'error' });
        register({ name: 'startDate' });
        register({ name: 'endDate' });

        return () => {
            unregister({ name: 'vacationType' });
            unregister({ name: 'startDate' });
            unregister({ name: 'endDate' });
        };
    }, [register, unregister]);

    const { startDate, endDate, vacationType } = getValues();

    useEffect(() => {
        if (vacationTypesCount === 0) {
            fetchVacationTypes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vacationTypesCount]);

    useEffect(() => {
        if (isEdit && infoData) {
            setValue('orderNumber', infoData.orderNumber);
            setValue('vacationType', infoData.vacationTypeId);

            setValue('startDate', infoData.startDate);
            setValue('endDate', infoData.endDate);
            setValue('note', infoData.note);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, infoData]);

    useEffect(() => {
        if (vacationTypes.length === 1) {
            setValue('vacationType', vacationTypes[0].id);
        }
    }, [vacationTypes]);

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
            handleCancel();
            reset();
            return toastHelper(history, returnUrl, message);
        };
    }
    function onEditSuccessCallBack(message, id) {
        return () => {
            infoEmployeeActivityVacation(id);
            return toastHelper(history, returnEditUrl, message);
        };
    }

    const handleEmployeeActivityVacation = data => {
        const postData = {
            employee: id,
            orderNumber: data.orderNumber,
            startDate: `${data.startDate || today}`,
            endDate: `${data.endDate || today}`,
            vacationType: data.vacationType,
            note: data.note || null,
        };
        if (isEdit) {
            postData.employee = Number(infoData.employeeId);
            editEmployeeActivityVacation(
                infoData.id,
                postData,
                onEditSuccessCallBack(
                    'Məzuniyyətə düzəliş olundu.',
                    infoData.id
                )
            );
        } else {
            createEmployeeActivityVacation(
                postData,
                onSuccessCallBack('İşçiyə məzuniyyət verildi.')
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

    function countVacationDays() {
        const start = startDate || today;
        const end = endDate || today;
        const startDateObj = new Date(
            start && start.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
        );
        const endDateObj = new Date(
            end && end.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
        );
        const timeDiff = (endDateObj - startDateObj) / (3600 * 24 * 1000);
        if (startDate && endDate) {
            return timeDiff + 1;
        }
        return 0;
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
                <PalmaIcon />
                <h3>Məzuniyyət</h3>
            </div>
            <form
                className={styles.padding24}
                onSubmit={handleSubmit(handleEmployeeActivityVacation)}
            >
                <FormInput
                    required
                    label="Əmr nömrəsi"
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
                        defaultValue={moment(today, dateFormat)}
                        value={startDate && moment(startDate, dateFormat)}
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
                        defaultValue={moment()}
                        value={endDate && moment(endDate, dateFormat)}
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
                    label="Məzuniyyət növü"
                    validateStatus={errors.vacationType}
                >
                    <ProSelect
                        name="vacationType"
                        data={vacationTypes}
                        value={vacationType}
                        hasError={errors.vacationTypes}
                        onChange={value =>
                            onChange({
                                target: { name: 'vacationType', value },
                            })
                        }
                    />
                </ProFormItem>

                <ProFormItem label="Məzuniyyət günlərinin sayı">
                    <p className={styles.disabledInput}>
                        {countVacationDays()}
                    </p>
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

const getVacationTypesLength = createSelector(
    state => state.hrReducer.vacationTypes,
    vacationTypesCount => vacationTypesCount.length
);

const mapStateToProps = state => ({
    isLoading: !!state.loadings.employeeActivityVacation,
    vacationTypes: state.hrReducer.vacationTypes,
    vacationTypesCount: getVacationTypesLength(state),
});

export default connect(
    mapStateToProps,
    {
        fetchWorkers,
        createEmployeeActivityVacation,
        editEmployeeActivityVacation,
        fetchVacationTypes,
        infoEmployeeActivityVacation,
    }
)(VacationForm);
