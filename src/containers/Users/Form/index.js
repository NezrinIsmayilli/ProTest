import React, {
    useImperativeHandle,
    useEffect,
    useReducer,
    useState,
} from 'react';
import { connect } from 'react-redux';
import { Button, Input, Form, Modal, Checkbox } from 'antd';
import { ProFormItem, ProSelect, ProAsyncSelect } from 'components/Lib';

// utils
import { messages, formItemSize, createReducer } from 'utils';

// actions

import { fetchRoles } from 'store/actions/settings/roles';
import { createUser, editUser, fetchUsers } from 'store/actions/users';
import { fetchCallOperators } from 'store/actions/calls/internalCalls';
import { fetchFilteredWorkers } from 'store/actions/hrm/workers';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styles from '../styles.module.scss';

const requiredRule = {
    required: true,
    message: messages.requiredText,
};

const minLengthRule = {
    min: 3,
    message: messages.mintextLimitMessage(3),
};

const maxLengthRule = {
    max: 15,
    message: messages.maxtextLimitMessage(15),
};
const maxLengthRuleEmail = {
    max: 35,
    message: messages.maxtextLimitMessage(35),
};

const emailRule = {
    type: 'email',
    message: messages.emailFormat,
};

const baseRules = [requiredRule, minLengthRule, maxLengthRule];

const initialState = {
    modalStatus: false,
    id: undefined,
};

const reducer = createReducer(initialState, {
    modal: (state, action) => ({
        modalStatus: action.modalStatus,
        id: action.id,
    }),
});

const CloseIcon = () => null;

const UsersForm = React.forwardRef((props, ref) => {
    const { t } = useTranslation();

    const founderLabel = t('founder');
    const coFounderLabel = t('coFounder');
    const {
        form,
        // data
        filters,
        actionLoading,
        usersLoading,
        users,
        worker,
        roles,
        setWorker,
        setRoles,
        // actions
        editUser,
        createUser,
        fetchUsers,
        fetchRoles,
        fetchFilteredWorkers,
        fetchCallOperators,
    } = props;

    const history = useHistory();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
    const [state, dispatch] = useReducer(reducer, initialState);
    const [admin, setAdmin] = useState(false);
    const [isOneAdmin, setIsOneAdmin] = useState(true);
    const [whoChanges, setWhoChanges] = useState(false);
    const [roleChange, setRoleChange] = useState(false);
    const [workerChange, setWorkerChange] = useState(false);
    const [selectedRole, setSelectedRole] = useState(undefined);
    const [businessUnit, setBusinessUnit] = useState(undefined);
    const { modalStatus, id } = state;
    const openModal = ({ id }) =>
        dispatch({ type: 'modal', modalStatus: true, id: id || undefined });

    const closeModal = () => {
        dispatch({ type: 'modal', modalStatus: false, id: undefined });
        resetFields();
    };

    useImperativeHandle(ref, () => ({
        openModal,
        closeModal,
    }));

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
        resetFields,
    } = form;

    useEffect(() => {
        if (users) {
            const me = users.find(user => user.isItMe === true);
            const { isAdmin } = me || {};
            setWhoChanges(isAdmin);
            if (users.filter(user => user.isAdmin === true).length > 1) {
                setIsOneAdmin(false);
            } else {
                setIsOneAdmin(true);
            }
        } else {
            setWhoChanges(false);
            setIsOneAdmin(true);
        }
    }, [users]);
    useEffect(() => {
        if (id) {
            const user = users.find(user => user.id === id);
            user.businessUnits[0]?.id &&
                setBusinessUnit(user.businessUnits[0]?.id);
            if (user.businessUnits[0]?.id) {
                fetchFilteredWorkers({
                    filters: {
                        limit: 20,
                        page: 1,
                        withTenantPerson: 0,
                        lastEmployeeActivityType: 1,
                        businessUnitIds: [user.businessUnits[0]?.id],
                    },

                    onSuccessCallback: data => {
                        setWorker(data.data);
                    },
                });
            }
            const {
                name,
                lastName,
                email,
                roleId,
                employeeId,
                employeeFullName,
                isAdmin,
            } = user || {};
            setAdmin(isAdmin);

            setFieldsValue({
                name,
                lastname: lastName,
                email,
                role: isAdmin
                    ? isOneAdmin
                        ? 'Təsisçi'
                        : 'Həmtəsisçi'
                    : roleId,
                connectEmployee: !!employeeId,
                employee: employeeFullName,
            });

            fetchRoles({
                filters: { ids: [user.roleId] },
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
                    setSelectedRole(appendList);
                },
            });
        } else {
            setAdmin(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, users]);

    useEffect(() => {
        if (!modalStatus) {
            setBusinessUnit(undefined);
            history.push({
                search: '',
            });
        }
        if (businessUnit) {
            ajaxWorkerSelectRequest(1, 20, '', 1);
        }
    }, [modalStatus, businessUnit]);

    const onSuccesCallback = () => {
        closeModal();
        fetchCallOperators();
        fetchUsers({ filters });
        // fetchFilteredWorkers(
        //     { filters: { withTenantPerson: 0, lastEmployeeActivityType: 1 } },
        //     data => {
        //         setWorker(data.data);
        //     }
        // );
    };

    const handleSubmit = e => {
        e.preventDefault();

        validateFields((errors, values) => {
            if (!errors) {
                const {
                    name,
                    lastname,
                    email,
                    role,
                    inviteSend,
                    employee,
                } = values;

                const data = {
                    name,
                    lastname,
                    email,
                    role:
                        admin || (role === 'Təsisçi' || role === 'Həmtəsisçi')
                            ? null
                            : role,
                    isAdmin: role === 'Təsisçi' || role === 'Həmtəsisçi',
                    patronymic: null,
                    birthday: null,
                    attachment: null,
                    occupation: null,
                    structure: null,
                    isChief: null,
                    mobileNumber: null,
                    phoneNumber: null,
                    gender: 1,
                    isActive: true,
                    employee: getFieldValue('connectEmployee')
                        ? typeof employee === 'string'
                            ? users.find(
                                  user => user.employeeFullName === employee
                              )?.employeeId
                            : employee
                        : null,
                };
                if (id) {
                    return editUser(id, data, onSuccesCallback);
                }
                return createUser(data, onSuccesCallback, inviteSend);
            }
        });
    };
    const ajaxRolesSelectRequest = (
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
        fetchRoles({
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
                    setRoles(appendList);
                } else {
                    setRoles(roles.concat(appendList));
                }
            },
        });
    };
    const ajaxWorkerSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            withTenantPerson: 0,
            businessUnitIds: businessUnit
                ? [businessUnit]
                : [BUSINESS_TKN_UNIT],
            lastEmployeeActivityType: 1,
            'filters[search]': search,
        };
        fetchFilteredWorkers({
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
                    setWorker(appendList);
                } else {
                    setWorker(worker.concat(appendList));
                }
            },
        });
    };
    const Roles = whoChanges
        ? [
              {
                  id: isOneAdmin ? founderLabel : coFounderLabel,
                  name: isOneAdmin ? founderLabel : coFounderLabel,
              },
              ...roles,
          ]
        : roles;

    useEffect(() => {
        if (!id && !roleChange) {
            setFieldsValue({
                role: Roles.length === 1 ? Roles[0].id : undefined,
            });
        }
    }, [Roles.length, modalStatus]);

    useEffect(() => {
        if (!id && !workerChange) {
            setFieldsValue({
                employee: worker.length === 1 ? worker[0].id : undefined,
            });
        }
    }, [worker, getFieldValue('connectEmployee')]);

    return (
        <Modal
            visible={modalStatus}
            footer={null}
            onCancel={closeModal}
            bodyStyle={{ padding: 0 }}
            width={420}
            closeIcon={<CloseIcon />}
            destroyOnClose
        >
            <div className={styles.modalHeader}>
                <p>{id ? t('users:modal:edit') : t('users:modal:newUser')}</p>
            </div>

            <Form onSubmit={handleSubmit} className={styles.form} noValidate>
                <ProFormItem
                    label={t('users:modal:name')}
                    help={getFieldError('name')?.[0]}
                >
                    {getFieldDecorator('name', {
                        rules: baseRules,
                    })(<Input size={formItemSize} />)}
                </ProFormItem>

                <ProFormItem
                    label={t('users:modal:lastName')}
                    help={getFieldError('lastname')?.[0]}
                >
                    {getFieldDecorator('lastname', {
                        rules: baseRules,
                    })(<Input size={formItemSize} />)}
                </ProFormItem>

                <ProFormItem
                    label={t('users:modal:email')}
                    help={getFieldError('email')?.[0]}
                >
                    {getFieldDecorator('email', {
                        rules: [requiredRule, emailRule, maxLengthRuleEmail],
                    })(<Input size={formItemSize} />)}
                </ProFormItem>

                <ProFormItem
                    label={t('users:modal:role')}
                    help={getFieldError('role')?.[0]}
                >
                    {getFieldDecorator('role', {
                        rules: [requiredRule],
                    })(
                        <ProAsyncSelect
                            selectRequest={ajaxRolesSelectRequest}
                            size={formItemSize}
                            data={
                                selectedRole
                                    ? [
                                          ...selectedRole,
                                          ...Roles.filter(
                                              item =>
                                                  !selectedRole
                                                      .map(({ id }) => id)
                                                      ?.includes(item.id)
                                          ),
                                      ]
                                    : Roles
                            }
                            onChange={() => setRoleChange(true)}
                            disabled={admin && !whoChanges}
                        />
                    )}
                </ProFormItem>
                <ProFormItem label="" style={{ marginBottom: 0 }}>
                    {getFieldDecorator('connectEmployee')(
                        <Checkbox checked={getFieldValue('connectEmployee')}>
                            {t('users:modal:connectEmployee')}
                        </Checkbox>
                    )}
                </ProFormItem>
                <ProFormItem
                    label={t('users:modal:employee')}
                    hidden={!getFieldValue('connectEmployee')}
                    help={getFieldError('employee')?.[0]}
                >
                    {getFieldDecorator('employee', {
                        rules: getFieldValue('connectEmployee')
                            ? [requiredRule]
                            : [],
                    })(
                        <ProAsyncSelect
                            size={formItemSize}
                            data={worker}
                            onChange={() => setWorkerChange(true)}
                            selectRequest={ajaxWorkerSelectRequest}
                            keys={['name', 'surname', 'patronymic']}
                        />
                    )}
                </ProFormItem>

                {/* send invite check */}
                {!id && (
                    <ProFormItem label="">
                        {getFieldDecorator('inviteSend')(
                            <Checkbox defaultChecked={false}>
                                {t('users:modal:inviteSend')}
                            </Checkbox>
                        )}
                    </ProFormItem>
                )}

                <p
                    style={{
                        fontSize: '13px',
                        color: 'red',
                        marginTop: '20px',
                    }}
                >
                    {!id ? t('users:modal:info') : null}
                </p>

                {/* Buttons */}
                <div className={styles.buttonsBox}>
                    <Button
                        size="large"
                        className={styles.cancelButton}
                        onClick={closeModal}
                    >
                        {t('users:modal:cancel')}
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={actionLoading || usersLoading}
                    >
                        {t('users:modal:save')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
});

const EnhancedForm = Form.create({ name: 'UsersForm' })(UsersForm);

const mapStateToProps = state => ({
    actionLoading: !!state.loadings.userActionLoading,
    usersLoading: !!state.loadings.fetchUsers,
    users: state.usersReducer.users,
    filters: state.usersReducer.filters,
});

export default connect(
    mapStateToProps,
    {
        createUser,
        editUser,
        fetchUsers,
        fetchFilteredWorkers,
        fetchCallOperators,
        fetchRoles,
    },
    null,
    { forwardRef: true }
)(EnhancedForm);
