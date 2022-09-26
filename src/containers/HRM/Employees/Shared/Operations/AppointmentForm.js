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
import { Button, Col } from 'antd';
import { ReactComponent as AppointmentIcon } from 'assets/img/icons/appoinment.svg';
import {
    createEmployeeActivityAppointment,
    editEmployeeActivityAppointment,
    infoEmployeeActivityAppointment,
} from 'store/actions/employeeActivity/employeeActivityAppointment';
import { fetchWorkers } from 'store/actions/hrm/workers';
import { fetchContacts } from 'store/actions/contact';

import { history } from 'utils/history';
import {
    todayWithMinutes,
    // today,
    dateFormat,
    toastHelper,
} from 'utils';

import styles from './styles.module.scss';

function AppointmentForm(props) {
    const {
        id,
        handleCancel,
        infoData,
        createEmployeeActivityAppointment,
        fetchWorkers,
        fetchContacts,
        contactsCount,
        contacts,
        isLoading,
        isEdit,
        editEmployeeActivityAppointment,
        infoEmployeeActivityAppointment,
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
        register({ name: 'contact' }, { required: 'error' });
        register({ name: 'startDate' });
        register({ name: 'startTimepicker' });
        register({ name: 'endTimepicker' });

        return () => {
            unregister({ name: 'contact' });
            unregister({ name: 'startDate' });
            unregister({ name: 'startTimepicker' });
            unregister({ name: 'endTimepicker' });
        };
    }, [register, unregister]);

    useEffect(() => {
        if (contactsCount === 0) {
            fetchContacts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isEdit && infoData) {
            // setValue('orderNumber', infoData && infoData.orderNumber);
            setValue('startDate', infoData.startDate.split(' ')[0]);
            setValue('startTimepicker', infoData.startDate.split(' ')[1]);
            setValue('endTimepicker', infoData.endDate.split(' ')[1]);
            setValue('contact', infoData.contactId);
            setValue('note', infoData.note);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, infoData]);

    useEffect(() => {
        if (contacts.length === 1) {
            setValue('contact', contacts[0].id);
        }
    }, [contacts]);

    const { startDate, startTimepicker, endTimepicker, contact } = getValues();

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
            infoEmployeeActivityAppointment(id);
            return toastHelper(history, returnEditUrl, message);
        };
    }

    const handleEmployeeActivityBusinessTrip = data => {
        const postData = {
            employee: id,
            startDate: `${data.startDate ||
                moment().format('DD-MM-YYYY')} ${data.startTimepicker ||
                moment().format('HH:mm')}`,
            endDate: `${data.startDate ||
                moment().format('DD-MM-YYYY')} ${data.endTimepicker ||
                moment().format('HH:mm')}`,
            contact: data.contact,
            note: data.note || null,
        };
        if (isEdit) {
            postData.employee = Number(infoData.employeeId);
            editEmployeeActivityAppointment(
                infoData.id,
                postData,
                onEditSuccessCallBack(
                    'İş görüşünə dəyişiklik edildi.',
                    infoData.id
                )
            );
        } else {
            createEmployeeActivityAppointment(
                postData,
                onSuccessCallBack('İşçiyə iş görüşü verildi.')
            );
        }
    };

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
                <AppointmentIcon />
                <h3>İş görüşü</h3>
            </div>
            <form
                className={styles.padding24}
                onSubmit={handleSubmit(handleEmployeeActivityBusinessTrip)}
            >
                <ProFormItem label="Tarix">
                    <p className={styles.disabledInput}>{todayWithMinutes}</p>
                </ProFormItem>

                <ProFormItem label="Görüş tarixi">
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
                    <Col span={11} className={styles.noPaddingLeft}>
                        <ProTimePicker
                            name="startTimepicker"
                            onChange={(_, selectedDate) => {
                                onChange({
                                    target: {
                                        name: 'startTimepicker',
                                        value: selectedDate,
                                    },
                                });
                            }}
                            value={
                                startTimepicker
                                    ? moment(startTimepicker, 'HH:mm')
                                    : moment()
                            }
                        />
                    </Col>
                    <Col span={2} className={styles.line}>
                        <hr />
                    </Col>
                    <Col span={11} className={styles.noPaddingLeft}>
                        <ProTimePicker
                            name="startTimepicker"
                            onChange={(_, selectedDate) => {
                                onChange({
                                    target: {
                                        name: 'endTimepicker',
                                        value: selectedDate,
                                    },
                                });
                            }}
                            value={
                                endTimepicker
                                    ? moment(endTimepicker, 'HH:mm')
                                    : moment()
                            }
                        />
                    </Col>
                </ProFormItem>
                <ProFormItem
                    required
                    label="Görüşüləcək şəxs"
                    validateStatus={errors.contact}
                >
                    <ProSelect
                        name="contact"
                        value={contact}
                        data={contacts}
                        hasError={errors.contact}
                        onChange={value =>
                            onChange({ target: { name: 'contact', value } })
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
const getContactsLength = createSelector(
    state => state.contactReducer.contacts,
    contactsCount => contactsCount.length
);

const mapStateToProps = state => ({
    contacts: state.contactReducer.contacts,
    isLoading: !!state.loadings.employeeActivityAppointments,
    contactsCount: getContactsLength(state),
});

export default connect(
    mapStateToProps,
    {
        fetchWorkers,
        createEmployeeActivityAppointment,
        fetchContacts,
        editEmployeeActivityAppointment,
        infoEmployeeActivityAppointment,
    }
)(AppointmentForm);
