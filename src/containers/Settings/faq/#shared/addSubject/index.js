import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Switch } from 'antd';
import { ProModal, ProFormItem, ProButton, ProInput } from 'components/Lib';

import { requiredRule, minLengthRule, mediumTextMaxRule } from 'utils/rules';

import { addSubjects, editSubjects } from 'store/actions/calls/faq';

import styles from './styles.module.scss';

const Add = (props = {}) => {
    const {
        form,
        visible,
        handleModal,
        edit,
        cleanEdit,
        folder,
        handleSubjectAddedOrEditedSuccess,
    } = props;

    const { getFieldDecorator, getFieldError, setFieldsValue } = form;

    const dispatch = useDispatch();

    const [checked, setChecked] = React.useState(true);

    const actionLoading = useSelector(state => state.FaqReducer.actionLoading);

    React.useEffect(() => {
        if (edit.id) {
            handleModal(true);

            setFieldsValue({
                status: edit.status,
                name: edit.name,
            });
            setChecked(edit.status !== 0);
        } else {
            setFieldsValue({
                status: true,
                name: null,
            });
        }
    }, [edit, folder, handleModal, setFieldsValue]);

    const toggleModal = () => {
        handleModal(!visible);
        cleanEdit([]);
    };

    const handleSubmitContact = e => {
        e.preventDefault();

        form.validateFields((err, values) => {
            if (!err && !edit?.id) {
                dispatch(
                    addSubjects(
                        {
                            folder,
                            ...values,
                            status: values.status ? 1 : 0,
                        },
                        () => {
                            handleSubjectAddedOrEditedSuccess();
                            toggleModal();
                        },
                        error => {
                            if (error === 'Subject is already exists.') {
                                form.setFields({
                                    name: {
                                        value: values.name,
                                        errors: [
                                            new Error(
                                                'Bu mövzu artıq mövcuddur'
                                            ),
                                        ],
                                    },
                                });
                            }
                        }
                    )
                );
            } else if (!err && edit?.id) {
                dispatch(
                    editSubjects(
                        edit.id,
                        {
                            folder,
                            ...values,
                            status: values.status ? 1 : 0,
                        },
                        () => {
                            handleSubjectAddedOrEditedSuccess();
                            toggleModal();
                        },
                        error => {
                            if (error === 'Subject is already exists.') {
                                form.setFields({
                                    name: {
                                        value: values.name,
                                        errors: [
                                            new Error(
                                                'Bu mövzu artıq mövcuddur'
                                            ),
                                        ],
                                    },
                                });
                            }
                        }
                    )
                );
            }
        });
    };

    return (
        <ProModal
            width={400}
            centered
            padding
            isVisible={visible}
            handleModal={toggleModal}
            maskClosable
        >
            <div className={styles.contactModalContainer}>
                <h3>{edit.id ? 'Mövzuya düzəliş et' : 'Yeni Mövzu'}</h3>

                <Form onSubmit={handleSubmitContact}>
                    <div className={styles.floatingSwitch}>
                        Deaktiv
                        <ProFormItem>
                            {getFieldDecorator('status', {
                                initialValue: checked,
                            })(
                                <Switch
                                    checked={checked}
                                    onChange={e => setChecked(e)}
                                />
                            )}
                        </ProFormItem>
                        Aktiv
                    </div>
                    <ProFormItem
                        label="Mövzu adı"
                        customStyle={styles.formItem}
                        help={getFieldError('name')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('name', {
                            rules: [
                                requiredRule,
                                minLengthRule,
                                mediumTextMaxRule,
                            ],
                        })(<ProInput />)}
                    </ProFormItem>

                    <ProButton
                        htmlType="submit"
                        loading={actionLoading}
                        size="large"
                    >
                        {edit.id ? 'Düzəliş et' : 'Əlavə et'}
                    </ProButton>
                </Form>
            </div>
        </ProModal>
    );
};

export default Form.create({ name: 'AddSubjectForm' })(Add);
