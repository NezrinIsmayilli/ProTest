import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Switch } from 'antd';
import {
    ProModal,
    ProSelect,
    ProFormItem,
    ProButton,
    ProInput,
} from 'components/Lib';

import { requiredRule, minLengthRule, mediumTextMaxRule } from 'utils/rules';

import { addFolders, editFolders } from 'store/actions/calls/faq';

import styles from './styles.module.scss';

const Add = (props = {}) => {
    const { form, visible, handleModal, edit, cleanEdit } = props;

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
                type: edit.type,
            });
            setChecked(edit.status !== 0);
        } else {
            setFieldsValue({
                status: true,
                name: null,
                type: 1,
            });
        }
    }, [edit, handleModal, setFieldsValue]);

    const toggleModal = () => {
        handleModal(!visible);
        cleanEdit([]);
    };

    const handleSubmitContact = e => {
        e.preventDefault();

        form.validateFields((err, values) => {
            if (!err && !edit?.id) {
                dispatch(
                    addFolders(
                        {
                            ...values,
                            status: values.status ? 1 : 0,
                        },
                        () => {
                            toggleModal();
                        },
                        error => {
                            if (error === 'Folder is already exists.') {
                                form.setFields({
                                    name: {
                                        value: values.name,
                                        errors: [
                                            new Error(
                                                'Bu qovluq artıq mövcuddur'
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
                    editFolders(
                        edit.id,
                        {
                            ...values,
                            status: values.status ? 1 : 0,
                        },
                        () => {
                            toggleModal();
                        },
                        error => {
                            if (error === 'Folder is already exists.') {
                                form.setFields({
                                    name: {
                                        value: values.name,
                                        errors: [
                                            new Error(
                                                'Bu qovluq artıq mövcuddur'
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
                <h3>{edit.id ? 'Qovluqa düzəliş et' : 'Yeni Qovluq'}</h3>

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
                        label="Qovluq adı"
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

                    <ProFormItem
                        label="Qovluq tipi"
                        help={getFieldError('type')?.[0]}
                    >
                        {getFieldDecorator('type', {
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                disabled
                                data={[
                                    {
                                        id: 1,
                                        name: 'Əlaqə mərkəzi',
                                    },
                                ]}
                            />
                        )}
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

export default Form.create({ name: 'AddForm' })(Add);
