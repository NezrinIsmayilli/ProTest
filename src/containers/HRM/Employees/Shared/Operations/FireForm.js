import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import useForm from 'react-hook-form';
import { createSelector } from 'reselect';
import moment from 'moment';
import {
    ProFormItem,
    ProSelect,
    ProDatePicker,
    InfoCard,
    ProWarningModal,
    FormInput,
    FormTextarea,
} from 'components/Lib';
import { Button, Checkbox, Icon } from 'antd';
import { ReactComponent as TerminationIcon } from 'assets/img/icons/workend.svg';
import {
    createEmployeeActivityFire,
    editEmployeeActivityFire,
    infoEmployeeActivityFire,
} from 'store/actions/employeeActivity/employeeActivityFire';
import {
    fetchWorkers,
    addToBlackListWorker,
    removeToBlackListWorker,
} from 'store/actions/hrm/workers';
import { fetchFireReasons } from 'store/actions/settings/hr';

import {
    toastHelper,
    //  today,
    dateFormat,
} from 'utils';
import { history } from 'utils/history';

import styles from './styles.module.scss';

function FireForm(props) {
    const {
        id,
        handleCancel,
        infoData,
        createEmployeeActivityFire,
        fetchFireReasons,
        fireReasonsCount,
        fireReasons,
        fetchWorkers,
        addToBlackListWorker,
        removeToBlackListWorker,
        isLoading,
        isEdit,
        editEmployeeActivityFire,
        infoEmployeeActivityFire,
    } = props;

    const {
        register,
        unregister,
        errors,
        handleSubmit,
        setValue,
        getValues,
    } = useForm();

    const returnUrl = '/hrm/employees/workers';
    const returnEditUrl = '/hrm/employees/operations';

    useEffect(() => {
        register({ name: 'startDate' }, { required: 'error' });
        register({ name: 'isInBlackList' });
        register({ name: 'reason' }, { required: 'error' });

        return () => {
            unregister({ name: 'startDate' });
            unregister({ name: 'isInBlackList' });
            unregister({ name: 'reason' });
        };
    }, [register, unregister]);

    const { isInBlackList, startDate, reason } = getValues();

    useEffect(() => {
        if (fireReasonsCount === 0) {
            fetchFireReasons();
        }
        setValue('isInBlackList', infoData.isInBlacklist);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fireReasonsCount, infoData]);

    useEffect(() => {
        if (isEdit && infoData) {
            setValue('orderNumber', infoData.orderNumber);
            setValue('startDate', infoData.startDate);
            setValue('reason', infoData.fireReasonId);
            setValue('note', infoData.note);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, infoData]);

    useEffect(() => {
        if (fireReasons.length === 1) {
            setValue('reason', fireReasons[0].id);
        }
    }, [fireReasons]);

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
            return toastHelper(history, returnUrl, message);
        };
    }

    function onEditSuccessCallBack(message, id) {
        return () => {
            infoEmployeeActivityFire(id);
            return toastHelper(history, returnEditUrl, message);
        };
    }

    const handleEmployeeActivityFire = data => {
        const postData = {
            startDate: data.startDate,
            orderNumber: data.orderNumber,
            reason: data.reason,
            note: data.note || null,
            employee: id,
        };
        if (isEdit) {
            postData.employee = Number(infoData.employeeId);
            editEmployeeActivityFire(
                infoData.id,
                postData,
                onEditSuccessCallBack('Xitama dəyişiklik edildi.', infoData.id)
            );
        } else {
            createEmployeeActivityFire(
                postData,
                onSuccessCallBack('İşçi xitam olundu.')
            );
        }
    };
    function addBlackListOnSuccessCallBack() {
        return () => setValue('isInBlackList', true);
    }
    function removeBlackListOnSuccessCallBack() {
        return () => setValue('isInBlackList', false);
    }
    const onChangeCheckBox = React.useCallback(
        checked => {
            if (checked === true) {
                addToBlackListWorker(id, addBlackListOnSuccessCallBack);
            } else {
                removeToBlackListWorker(id, removeBlackListOnSuccessCallBack);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [id]
    );
    const [isOpenWarningModal, setisOpenWarningModal] = useState(false);

    function disabledDate(current) {
        return current && current < moment().subtract(1, 'day');
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
                <TerminationIcon />
                <h3>Ə.M Xitam</h3>
            </div>
            <form
                className={styles.padding24}
                onSubmit={handleSubmit(handleEmployeeActivityFire)}
            >
                <FormInput
                    required
                    label="Əmr Nömrəsi"
                    name="orderNumber"
                    ref={register({ required: 'Bu dəyər boş olmamalıdır.' })}
                    maxLength={15}
                    message={errors.orderNumber && errors.orderNumber.message}
                />
                <ProFormItem
                    required
                    label="Əmrin Tarixi "
                    validateStatus={errors.startDate}
                >
                    <ProDatePicker
                        disabledDate={disabledDate}
                        name="startDate"
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
                <ProFormItem
                    required
                    label="Əsas"
                    validateStatus={errors.reason}
                >
                    <ProSelect
                        name="reason"
                        data={fireReasons}
                        value={reason}
                        keys={['name']}
                        hasError={errors.reason}
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
                <ProFormItem>
                    <Checkbox
                        name="isInBlacklist"
                        className={styles.checkbox}
                        checked={isInBlackList === true}
                        onChange={({ target: { checked } }) =>
                            onChangeCheckBox(checked)
                        }
                    >
                        Qara siyahı
                    </Checkbox>
                </ProFormItem>
                <div className={`${styles.txtRight} ${styles.marginTop36}`}>
                    <Button
                        className={styles.cancelBtnNoBordered}
                        size="large"
                        onClick={() => setisOpenWarningModal(true)}
                    >
                        İmtina
                    </Button>
                    <Button
                        disabled={false}
                        type="danger"
                        htmlType="submit"
                        size="large"
                        loading={isLoading}
                    >
                        Təsdiq et
                    </Button>
                </div>
            </form>
            <ProWarningModal
                open={isOpenWarningModal}
                titleIcon={<Icon type="warning" />}
                okFunc={() => {
                    handleCancel(null);
                    setisOpenWarningModal(false);
                }}
                onCancel={() => {
                    setisOpenWarningModal(false);
                }}
            />
        </div>
    );
}

const getFireReasonsLength = createSelector(
    state => state.hrReducer.fireReasons,
    fireReasonsCount => fireReasonsCount.length
);

const mapStateToProps = state => ({
    isLoading: !!state.loadings.employeeActivityFires,
    fireReasons: state.hrReducer.fireReasons,
    fireReasonsCount: getFireReasonsLength(state),
});

export default connect(
    mapStateToProps,
    {
        fetchWorkers,
        addToBlackListWorker,
        removeToBlackListWorker,
        createEmployeeActivityFire,
        fetchFireReasons,
        editEmployeeActivityFire,
        infoEmployeeActivityFire,
    }
)(FireForm);
