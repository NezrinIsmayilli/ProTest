/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, forwardRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import moment from 'moment';
import useForm from 'react-hook-form';
import { toast } from 'react-toastify';
import {
    ProWarningModal,
    ProContent,
    ProFormItem,
    ProSelect,
    ProDatePicker,
    ProRadio,
    ProWrapper,
    ProMaskedInput,
    FormInput,
    FormTextarea,
    ImageUpload,
    ProAsyncSelect,
} from 'components/Lib';
import { Row, Col, Spin, Checkbox, Button, Radio, Icon } from 'antd';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import { fetchWorkSchedules } from 'store/actions/hrm/attendance/workSchedules';
import { fetchHRMCalendars } from 'store/actions/hrm/calendars';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchPositions } from 'store/actions/settings/vezifeler';
import { fetchStructures } from 'store/actions/structure';
import { createSelector } from 'reselect';
import {
    createWorker,
    editWorker,
    editAndHireWorker,
    fetchWorker,
    fetchWorkers,
} from 'store/actions/hrm/workers';
import {
    today,
    dateFormat,
    toastHelper,
    minimumDate,
    maximumDate,
    formatNumberToLocale,
    defaultNumberFormat,
} from 'utils';
import {
    checkEmailisValid,
    checkValueIsOnlyCharacters,
    checkValueIsOnlyNumbers,
    isValidNumber,
} from 'utils/inputValidations';
import { history } from 'utils/history';
import styles from './styles.module.scss';

const returnUrlForWorker = '/hrm/employees/workers';
const returnUrlForDismissedPeople = '/hrm/employees/dismissed-people';
const returnUrlForEditAndHire = '/hrm/employees/operations';

const employmentTypes = [
    { id: 1, name: 'Tam ştat' },
    { id: 2, name: 'Yarım ştat' },
    { id: 3, name: 'Ştatdan kənar' },
];

const GeneralInfo = React.memo(props => {
    const {
        onChange,
        onImgBeforeChange,
        birthday,
        attachmentUrl,
        gender,
        attachment,
        errors,
        onChangeDate,
        onChangeWithValidation,
        register,
    } = props;
    return (
        <ProContent title="1. Ümumi məlumat">
            <ImageUpload
                imageBeforeChange={onImgBeforeChange}
                imageFieldChange={onChange}
                attachmentUrl={attachmentUrl}
                attachmentId={attachment}
            />
            <FormInput
                required
                label="Ad"
                name="name"
                placeholder="Yazın"
                onKeyDown={onChangeWithValidation}
                ref={register({
                    required: 'Bu dəyər boş olmamalıdır.',
                    validate: value => {
                        if (value.length && value.length < 3) {
                            return 'Bu dəyər 3 simvoldan az olmamalıdır.';
                        }
                        return true;
                    },
                })}
                maxLength={30}
                message={errors.name && errors.name.message}
            />
            <FormInput
                required
                label="Soyad"
                placeholder="Yazın"
                name="surname"
                onKeyDown={onChangeWithValidation}
                ref={register({
                    required: 'Bu dəyər boş olmamalıdır.',
                    validate: value => {
                        if (value.length && value.length < 3) {
                            return 'Bu dəyər 3 simvoldan az olmamalıdır.';
                        }
                        return true;
                    },
                })}
                maxLength={30}
                message={errors.surname && errors.surname.message}
            />
            <FormInput
                required
                label="Ata adı"
                placeholder="Yazın"
                name="patronymic"
                onKeyDown={onChangeWithValidation}
                ref={register({
                    required: 'Bu dəyər boş olmamalıdır.',
                    validate: value => {
                        if (value.length && value.length < 3) {
                            return 'Bu dəyər 3 simvoldan az olmamalıdır.';
                        }
                        return true;
                    },
                })}
                maxLength={30}
                message={errors.patronymic && errors.patronymic.message}
            />
            <FormInput
                required
                label="Fin kod"
                placeholder="Yazın"
                name="finCode"
                onKeyDown={onChangeWithValidation}
                ref={register({
                    validate: value => {
                        if (value?.length < 6) {
                            return 'Bu dəyər 6 simvoldan az olmamalıdır.';
                        }
                        if (!/^[A-Za-z0-9][A-Za-z0-9]*$/g.test(value)) {
                            return 'Fin kod formata uyğun deyil.';
                        }
                        return true;
                    },
                })}
                maxLength={7}
                message={errors?.finCode?.message}
            />
            <FormInput
                label="İşçi kodu"
                name="code"
                placeholder="Yazın"
                ref={register}
                maxLength={8}
            />
            <ProFormItem
                label="Doğum tarixi"
                placeholder="Yazın"
                required
                validateStatus={!!errors.birthday}
            >
                <ProDatePicker
                    name="birthday"
                    disabledDate={d =>
                        !d ||
                        d.isBefore(moment(minimumDate, dateFormat)) ||
                        d.isAfter(moment(maximumDate, dateFormat))
                    }
                    value={birthday && moment(birthday, dateFormat)}
                    onChange={(_, selectedDate) => {
                        onChange({
                            target: { name: 'birthday', value: selectedDate },
                        });
                    }}
                    hasError={!!errors.birthday}
                />
            </ProFormItem>
            <ProFormItem required label="Cinsi" validateStatus={errors.gender}>
                <Radio.Group
                    name="gender"
                    onChange={onChange}
                    validateStatus={errors.gender}
                >
                    <ProRadio value={1} checked={gender === 1}>
                        Kişi
                    </ProRadio>
                    <ProRadio value={2} checked={gender === 2}>
                        Qadın
                    </ProRadio>
                </Radio.Group>
            </ProFormItem>
            <FormTextarea
                label="Qeyd"
                ref={register}
                name="note"
                placeholder="Yazın"
                maxLength={170}
            />
        </ProContent>
    );
});

const WorkInfo = React.memo(props => {
    const {
        fetchCurrencies,
        structureList,
        errors,
        onChange,
        structure,
        isLoadingStructure,
        occupation,
        occupations,
        isLoadingOccupations,
        onChangeCheckBox,
        workSchedules,
        workSchedule,
        isLoadingWork,
        employmentType,
        employmentTypes,
        calendars,
        calendar,
        isLoadingCalendar,
        tenantCurrency,
        isLoadingCurrencies,
        register,
        isChief,
        id,
        hireDate,
        onChangeWithValidation,
        isFired,
    } = props;


    const [currencies, setCurrencies] = useState([]);

    const ajaxCurrenciesSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = { limit, page, name: search };
        fetchCurrencies(defaultFilters, data => {
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
                setCurrencies(appendList);
            } else {
                setCurrencies(currencies.concat(appendList));
            }
        });
    };

    return (
        <ProContent title="2. İş haqqında">
            <ProFormItem
                required
                validateStatus={!!errors.structure}
                label="Bölmə"
            >
                <ProSelect
                    name="structure"
                    data={structureList}
                    hasError={!!errors.structure}
                    onChange={value =>
                        onChange({ target: { name: 'structure', value } })
                    }
                    value={structure}
                    loading={isLoadingStructure}
                    disabled={isLoadingStructure}
                />
            </ProFormItem>
            <ProFormItem label="Vəzifə">
                <ProSelect
                    name="occupation"
                    data={occupations}
                    hasError={!!errors.occupation}
                    onChange={value =>
                        onChange({ target: { name: 'occupation', value } })
                    }
                    value={occupation}
                    loading={isLoadingOccupations}
                    disabled={isLoadingOccupations}
                />
            </ProFormItem>
            <ProFormItem>
                <Checkbox
                    name="isChief"
                    className={styles.checkbox}
                    onChange={({ target: { checked } }) =>
                        onChangeCheckBox(checked)
                    }
                    checked={isChief}
                >
                    Bölmə rəhbəri
                </Checkbox>
            </ProFormItem>
            {isChief && (
                <div className={styles.infoWarning}>
                    <p>
                        Hər bir bölmə üçün yalnız bir bölmə rəhbəri təyin edilə
                        bilər. Seçim etdiyiniz halda daha öncə seçilmiş bölmə
                        rəhbəri dəyişdiriləcək!
                    </p>
                    <div>
                        <ExclamationIcon />
                    </div>
                </div>
            )}
            <ProFormItem
                required
                label="İş rejimi"
                validateStatus={!!errors.workSchedule}
            >
                <ProSelect
                    name="workSchedule"
                    data={workSchedules}
                    hasError={!!errors.workSchedule}
                    onChange={value =>
                        onChange({ target: { name: 'workSchedule', value } })
                    }
                    value={workSchedule}
                    loading={isLoadingWork}
                    disabled={isLoadingWork}
                />
            </ProFormItem>
            <ProFormItem
                label="Ştat növü"
                validateStatus={!!errors.employmentType}
            >
                <ProSelect
                    name="employmentType"
                    value={employmentType}
                    data={employmentTypes}
                    hasError={!!errors.employmentType}
                    onChange={value =>
                        onChange({
                            target: { name: 'employmentType', value },
                        })
                    }
                />
            </ProFormItem>
            <ProFormItem label="İşə başlama tarixi">
                {id !== null ? (
                    <ProDatePicker
                        name="hireDate"
                        disabled={id !== null && !isFired}
                        disabledDate={d =>
                            !d ||
                            d.isBefore(moment(minimumDate, dateFormat)) ||
                            d.isAfter(moment(maximumDate, dateFormat))
                        }
                        value={hireDate && moment(hireDate, dateFormat)}
                        onChange={(_, selectedDate) => {
                            onChange({
                                target: {
                                    name: 'hireDate',
                                    value: selectedDate,
                                },
                            });
                        }}
                    />
                ) : (
                    <ProDatePicker
                        name="hireDate"
                        disabledDate={d =>
                            !d ||
                            d.isBefore(moment(minimumDate, dateFormat)) ||
                            d.isAfter(moment(maximumDate, dateFormat))
                        }
                        defaultValue={moment(today, dateFormat)}
                        onChange={(_, selectedDate) => {
                            onChange({
                                target: {
                                    name: 'hireDate',
                                    value: selectedDate,
                                },
                            });
                        }}
                    />
                )}
            </ProFormItem>
            <FormInput
                label="Əmək müqaviləsi"
                name="contractNumber"
                placeholder="Yazın"
                ref={register({
                    required: false,
                    validate: value => {
                        if (value.length && value.length < 3) {
                            return 'Bu dəyər 3 simvoldan az olmamalıdır.';
                        }
                        return true;
                    },
                })}
                maxLength={15}
                message={errors.contractNumber && errors.contractNumber.message}
            />
            <ProFormItem
                style={{ marginBottom: '20px' }}
                required
                label="İstehsalat təqvimi"
                validateStatus={!!errors.calendar}
            >
                <ProSelect
                    name="calendar"
                    data={calendars}
                    hasError={!!errors.calendar}
                    onChange={value =>
                        onChange({ target: { name: 'calendar', value } })
                    }
                    value={calendar}
                    loading={isLoadingCalendar}
                    disabled={isLoadingCalendar}
                />
            </ProFormItem>
            <FormInput
                required={!(id !== null && !isFired)}
                label="Cari əməkhaqqı"
                placeholder="Yazın"
                name="salary"
                onKeyDown={onChangeWithValidation}
                ref={register({
                    required: 'Bu dəyər boş olmamalıdır.',
                })}
                message={errors.salary && errors.salary.message}
                disabled={id !== null && !isFired}
                maxLength={10}
            />
            <ProFormItem
                required
                label="Ödəniş valyutası"
                validateStatus={!!errors.tenantCurrency}
            >
                <ProAsyncSelect
                    allowClear={false}
                    keys={['code']}
                    selectRequest={
                        ajaxCurrenciesSelectRequest
                    }
                    data={currencies}
                    valueOnChange={value =>
                        onChange({
                            target: { name: 'tenantCurrency', value },
                        })
                    }
                    value={tenantCurrency ? tenantCurrency : undefined}
                    loading={isLoadingCurrencies}
                    disabled={isLoadingCurrencies || id !== null}
                />

                {/* <ProSelect
                    name="tenantCurrency"
                    data={currencies}
                    hasError={!!errors.tenantCurrency}
                    onChange={value =>
                        onChange({
                            target: { name: 'tenantCurrency', value },
                        })
                    }
                    value={tenantCurrency}
                    loading={isLoadingCurrencies}
                    disabled={isLoadingCurrencies || id !== null}
                /> */}
            </ProFormItem>
        </ProContent>
    );
});

const WorkerForm = forwardRef(props => {
    const {
        fetchWorkSchedules,
        workSchedulesCount,
        workSchedules,
        fetchCurrencies,
        isLoadingWork,
        currencies,
        isLoadingCurrencies,
        createWorker,
        fetchHRMCalendars,
        calendars,
        isLoadingCalendar,
        fetchPositions,
        occupations,
        isLoadingOccupations,
        fetchStructures,
        structureList,
        isLoadingStructure,
        occupationsCount,
        structuresCount,
        currenciesCount,
        calendarsCount,
        fetchWorkers,
        editWorker,
        fromForm,
        editAndHireWorker,
        worker,
        fetchWorker,
        isLoading,
    } = props;
    const { id = null } = useParams();
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        Promise.all([
            workSchedulesCount === 0 && fetchWorkSchedules(),
            fetchCurrencies(),
            calendarsCount === 0 && fetchHRMCalendars(),
            occupationsCount === 0 && fetchPositions(),
            structuresCount === 0 && fetchStructures(),
        ]);
    }, []);

    useEffect(() => {
        id !== null && fetchWorker(id);
    }, [id]);

    const {
        register,
        unregister,
        errors,
        handleSubmit,
        setValue,
        getValues,
    } = useForm();

    useEffect(() => {
        register({ name: 'attachment' });
        register({ name: 'gender' }, { required: 'error' });
        register({ name: 'birthday' }, { required: 'error' });
        register({ name: 'occupation' });
        register({ name: 'salary' }, { required: 'error' });
        register({ name: 'structure' }, { required: 'error' });
        register({ name: 'isChief' });
        register({ name: 'workSchedule' }, { required: 'error' });
        register({ name: 'calendar' }, { required: 'error' });
        register({ name: 'hireDate' });
        register({ name: 'tenantCurrency' }, { required: 'error' });
        register({ name: 'mobileNumber' });
        register({ name: 'employmentType' });
        register({ name: 'attachmentUrl' });
        register({ name: 'attachmentId' });
        register({ name: 'isOpen' });
        register({ name: 'isFired' });

        return () => {
            unregister({ name: 'attachment' });
            unregister({ name: 'gender' });
            unregister({ name: 'birthday' });
            unregister({ name: 'occupation' });
            unregister({ name: 'salary' });
            unregister({ name: 'structure' });
            unregister({ name: 'isChief' });
            unregister({ name: 'workSchedule' });
            unregister({ name: 'calendar' });
            unregister({ name: 'hireDate' });
            unregister({ name: 'tenantCurrency' });
            unregister({ name: 'mobileNumber' });
            unregister({ name: 'employmentType' });
            unregister({ name: 'attachmentUrl' });
            unregister({ name: 'attachmentId' });
            unregister({ name: 'isOpen' });
            unregister({ name: 'isFired' });
        };
    }, []);

    useEffect(() => {
        if (id !== null && worker != null) {
            const editedWorker = GenerateEditedWorker();
            setValue('isFired', editedWorker.isFired);
            setValue('name', editedWorker.name);
            setValue('surname', editedWorker.surname);
            setValue('patronymic', editedWorker.patronymic);
            setValue('gender', editedWorker.gender);
            setValue('finCode', editedWorker.finCode);
            setValue('salary', defaultNumberFormat(editedWorker.salary));
            setValue('code', editedWorker.code);
            setValue('birthday', editedWorker.birthday);
            setValue('note', editedWorker.note);
            setValue('occupation', editedWorker.occupationId);
            setValue('structure', editedWorker.structureId);
            setValue('isChief', editedWorker.isChief);
            setValue('workSchedule', editedWorker.workScheduleId);
            setValue('calendar', editedWorker.calendarId);
            setValue('hireDate', editedWorker.hireDate);
            setValue('contractNumber', editedWorker.contractNumber);
            setValue('tenantCurrency', editedWorker.tenantCurrencyId);
            setValue('email', editedWorker.email);
            setValue('mobileNumber', editedWorker.mobileNumber);
            setValue('address', editedWorker.address);
            setValue('employmentType', editedWorker.employmentType);
            setValue('attachmentUrl', editedWorker.attachmentUrl);
            setValue('attachment', editedWorker.attachmentId);
            setValue('isOpen', editedWorker.isOpen);
        }
    }, [id, worker]);

    useEffect(() => {
        if (structureList.length === 1) {
            setValue('structure', structureList[0].id);
        }
        if (workSchedules.length === 1) {
            setValue('workSchedule', workSchedules[0].id);
        }
        if (calendars.length === 1) {
            setValue('calendar', calendars[0].id);
        }
    }, [structureList, workSchedules, calendars]);

    function GenerateEditedWorker() {
        if (!worker) {
            toast.error('İşçi tapılmadı', {
                position: 'top-right',
            });
            return {
                name: '',
                surname: '',
                patronymic: '',
                gender: '',
                finCode: '',
                salary: '',
                code: '',
                birthday: '',
                note: '',
                occupation: '',
                structure: '',
                isChief: false,
                workSchedule: '',
                calendar: '',
                hireDate: '',
                contractNumber: '',
                tenantCurrency: '',
                email: '',
                mobileNumber: '',
                address: '',
                employmentType: '',
                sattachment: '',
                isOpen: '',
                isFired: false,
            };
        }
        return worker;
    }

    const {
        name,
        surname,
        patronymic,
        finCode,
        code,
        birthday,
        gender,
        note,
        occupation,
        structure,
        workSchedule,
        calendar,
        contractNumber,
        tenantCurrency,
        mobileNumber,
        salary,
        employmentType,
        attachmentUrl,
        attachment,
        isOpen,
        isChief,
        hireDate,
        isFired,
    } = getValues();

    const onImgBeforeChange = () => {
        setDisabled(true);
    };
    const onChange = React.useCallback(event => {
        const { name, value = '' } = event.target || {};
        setValue(name, value, true);
    }, []);

    function onChangeWithValidation(event) {
        const { name } = event.target || {};
        if (name === 'name' || name === 'surname' || name === 'patronymic') {
            if (!checkValueIsOnlyCharacters(event.key)) {
                event.preventDefault();
                return false;
            }
        }
        if (name === 'salary') {
            if (!checkValueIsOnlyNumbers(event.key)) {
                event.preventDefault();
                return false;
            }
        }
    }

    const onChangeDate = React.useCallback((name, date) => {
        if (date.trim()) {
            setValue(name, date);
        } else {
            setValue(name, today);
        }
    }, []);

    const scrollTop = useRef(null);
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            scrollTop.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [errors]);

    useEffect(() => {
        if (attachment) {
            setDisabled(false);
        }
    }, [attachment]);

    const getMainFormValuesAndSubmit = data => {
        const postData = {
            name: data.name,
            surname: data.surname,
            gender: data.gender || null,
            calendar: data.calendar || null,
            hireDate:
                data.hireDate || moment(today, dateFormat).format('DD-MM-YYYY'),
            workSchedule: data.workSchedule || null,
            tenantCurrency: data.tenantCurrency || null,
            attachment: data.attachment || null,
            patronymic: data.patronymic,
            code: data.code || null,
            finCode: data.finCode || null,
            note: data.note || null,
            occupation: data.occupation || null,
            structure: data.structure || null,
            isChief: data.isChief,
            contractNumber: data.contractNumber || null,
            email: data.email || null,
            mobileNumber: data.mobileNumber || null,
            address: data.address || null,
            birthday: data.birthday || null,
            employmentType: data.employmentType || null,
            salary: data.salary || null,
        };
        if (id === null) {
            postData.isChief = postData.isChief || false;
            createWorker(postData, onSuccesCallBack('İşçi'));
        } else if (id !== null && fromForm === 1) {
            editWorker(id, postData, onSuccesCallBack('İşçi'));
        } else {
            editAndHireWorker(
                id,
                postData,
                onSuccesEditAndHireCallBack('İşçi')
            );
        }
    };

    function onSuccesCallBack(message) {
        return () => {
            fetchWorkers({
                filters: {
                    lastEmployeeActivityType: fromForm,
                },
            });
            return toastHelper(
                history,
                fromForm === 1
                    ? returnUrlForWorker
                    : returnUrlForDismissedPeople,
                `${message} uğurla əlavə olundu.`
            );
        };
    }

    function onSuccesEditAndHireCallBack(message) {
        return () =>
            toastHelper(
                history,
                returnUrlForEditAndHire,
                `${message} məlumatları uğurla dəyişdirildi.`
            );
    }
    function handleCancel() {
        setValue('isOpen', true);
    }

    const onChangeCheckBox = React.useCallback(checked => {
        setValue('isChief', checked);
    }, []);

    return (
        <ProWrapper>
            <ProWarningModal
                open={isOpen}
                titleIcon={<Icon type="warning" />}
                okFunc={() => {
                    history.replace(
                        fromForm === 1
                            ? returnUrlForWorker
                            : returnUrlForDismissedPeople
                    );
                }}
                onCancel={() => setValue('isOpen', false)}
            />
            <section className={styles.workerPanel}>
                <div className="container">
                    <div>
                        <Link
                            to={returnUrlForWorker}
                            className={styles.returnBackButton}
                        >
                            <MdKeyboardArrowLeft
                                size={24}
                                style={{ marginRight: 4 }}
                            />
                            Əməkdaşlar Siyahısı
                        </Link>
                    </div>
                    <div className={styles.nameCode}>
                        {id !== null ? 'Redakte et' : 'Yeni əməkdaş əlavə et'}
                    </div>
                    <Spin spinning={false}>
                        <form
                            ref={scrollTop}
                            onSubmit={handleSubmit(getMainFormValuesAndSubmit)}
                        >
                            <Row gutter={32} className={styles.flexRow}>
                                <Col span={8}>
                                    <GeneralInfo
                                        {...{
                                            onImgBeforeChange,
                                            onChange,
                                            birthday,
                                            gender,
                                            attachmentUrl,
                                            attachment,
                                            errors,
                                            onChangeDate,
                                            note,
                                            onChangeWithValidation,
                                            name,
                                            surname,
                                            patronymic,
                                            finCode,
                                            code,
                                            register,
                                        }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <WorkInfo
                                        {...{
                                            fetchCurrencies,
                                            structureList,
                                            errors,
                                            onChange,
                                            structure,
                                            isLoadingStructure,
                                            occupation,
                                            occupations,
                                            isLoadingOccupations,
                                            onChangeCheckBox,
                                            workSchedules,
                                            workSchedule,
                                            isLoadingWork,
                                            employmentType,
                                            employmentTypes,
                                            contractNumber,
                                            calendars,
                                            calendar,
                                            isLoadingCalendar,
                                            currencies,
                                            tenantCurrency,
                                            isLoadingCurrencies,
                                            salary,
                                            id,
                                            onChangeWithValidation,
                                            register,
                                            isChief,
                                            hireDate,
                                            isFired,
                                        }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <ProContent title="3. Əlaqə">
                                        <FormInput
                                            label="Email"
                                            name="email"
                                            placeholder="Yazın"
                                            ref={register({
                                                required: false,
                                                validate: value => {
                                                    if (
                                                        value.length > 0 &&
                                                        !checkEmailisValid(
                                                            value
                                                        )
                                                    ) {
                                                        return 'Bu dəyər düzgün bir e-poçt adresi deyil';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            message={
                                                errors.email &&
                                                errors.email.message
                                            }
                                        />
                                        <ProFormItem
                                            label="Telefon"
                                            validateStatus={errors.mobileNumber}
                                        >
                                            <ProMaskedInput
                                                id="mobileNumber"
                                                name="mobileNumber"
                                                mask="mobilePhoneMask"
                                                placeholder="Yazın"
                                                value={mobileNumber}
                                                onChange={onChange}
                                                className="ant-input ant-input-lg"
                                            />
                                        </ProFormItem>
                                        <FormInput
                                            label="Ünvan"
                                            name="address"
                                            placeholder="Yazın"
                                            ref={register({
                                                required: false,
                                                validate: value => {
                                                    if (
                                                        value.length &&
                                                        value.length < 3
                                                    ) {
                                                        return 'Bu dəyər 3 simvoldan az olmamalıdır.';
                                                    }
                                                    return true;
                                                },
                                            })}
                                            maxLength={60}
                                            message={
                                                errors.address &&
                                                errors.address.message
                                            }
                                        />
                                    </ProContent>
                                </Col>
                            </Row>
                            <div
                                className={`${styles.txtRight} ${styles.marginTop36}`}
                            >
                                <Button
                                    className={styles.cancelBtn}
                                    size="large"
                                    onClick={handleCancel}
                                >
                                    İmtina
                                </Button>
                                <Button
                                    disabled={disabled}
                                    loading={isLoading}
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                >
                                    Təsdiq et
                                </Button>
                            </div>
                        </form>
                    </Spin>
                </div>
            </section>
        </ProWrapper>
    );
});

WorkerForm.displayName = 'WorkerForm';

const getWorkSchedulesLength = createSelector(
    state => state.workSchedulesReducer.workSchedules,
    workSchedulesCount => workSchedulesCount.length
);

const getOccupationsLength = createSelector(
    state => state.vezifelerReducer.data,
    occupationsCount => occupationsCount.length
);

const getStructuresLength = createSelector(
    state => state.structureReducer.structures,
    structuresCount => structuresCount.length
);

const getCalendarsLength = createSelector(
    state => state.hrmCalendarReducer.calendars,
    calendarsCount => calendarsCount.length
);

const getCurrenciesLength = createSelector(
    state => state.kassaReducer.currencies,
    currenciesCount => currenciesCount.length
);

// const getWorkersLength = createSelector(
//   state => state.workersReducer.workers,
//   workersCount => workersCount.length
// );

const mapStateToProps = state => ({
    workSchedulesCount: getWorkSchedulesLength(state),
    workSchedules: state.workSchedulesReducer.workSchedules,
    isLoadingWork: state.workSchedulesReducer.isLoading,
    currencies: state.kassaReducer.currencies,
    currenciesCount: getCurrenciesLength(state),
    isLoadingCurrencies: state.kassaReducer.isLoading,

    calendars: state.hrmCalendarReducer.calendars,
    isLoadingCalendar: !!state.loadings.fetchHRMCalendars,

    calendarsCount: getCalendarsLength(state),
    occupations: state.vezifelerReducer.data,
    occupationsCount: getOccupationsLength(state),
    isLoadingOccupations: state.vezifelerReducer.isLoading,
    structureList: state.structureReducer.structures,
    structuresCount: getStructuresLength(state),
    isLoadingStructure: state.structureReducer.isLoading,
    worker: state.workersReducer.worker,
    isLoading: state.workersReducer.isLoading,
});

export default connect(
    mapStateToProps,
    {
        fetchWorkSchedules,
        fetchCurrencies,
        fetchHRMCalendars,
        fetchPositions,
        fetchStructures,
        createWorker,
        editWorker,
        editAndHireWorker,
        fetchWorker,
        fetchWorkers,
    },
    null,
    { forwardRef: true }
)(WorkerForm);
