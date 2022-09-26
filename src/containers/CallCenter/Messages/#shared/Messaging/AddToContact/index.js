import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from 'antd';
import {
    ProModal,
    ProSelect,
    ProFormItem,
    ProAutoComplete,
    ProButton,
} from 'components/Lib';

import { requiredRule, minLengthRule, mediumTextMaxRule } from 'utils/rules';
import { contactTypes, contactCategories } from 'utils';

import {
    fetchContacts,
    createContact,
    editContact,
} from 'store/actions/contacts-new';

import styles from './styles.module.scss';

function AddToContact(props = {}) {
    const { form, visible, handleModal, chats } = props;

    const { getFieldDecorator, getFieldError, setFieldsValue } = form;

    const dispatch = useDispatch();
    const contactList = useSelector(state => state.newContactsReducer.contacts);
    const actionIsLoading = useSelector(
        state => state.newContactsReducer.actionIsLoading
    );

    const [list, setList] = React.useState();
    const [editId, setEditId] = React.useState(0);

    useEffect(() => {
        if (chats && chats.contact && chats.contact.prospectContact) {
            setFieldsValue({
                name: chats.contact.prospectContact.name,
                type: chats.contact.prospectContact.typeId,
                category_ul: chats.contact.prospectContact.categoryIds,
            });
            setEditId(chats.contact.prospectContact.id);
        }
    }, [chats, setFieldsValue]);

    React.useEffect(() => {
        dispatch(fetchContacts());
    }, [dispatch]);

    React.useEffect(() => {
        const contacts = [];
        contactList.map(({ name }) => contacts.push(name));
        setList(contacts);
    }, [contactList]);

    const toggleModal = () => {
        handleModal(!visible);
    };

    const handleContactSelect = e => {
        const existingContact = contactList.find(contact => contact.name === e);
        if (existingContact && existingContact.id) {
            setEditId(existingContact.id);
        } else {
            setEditId(0);
        }
    };

    const handleSubmitContact = e => {
        e.preventDefault();
        form.validateFields((err, values) => {
            if (
                !err &&
                editId === 0 &&
                chats &&
                chats.contact &&
                chats.contact.identifier
            ) {
                dispatch(
                    createContact(
                        {
                            ...values,
                            status: 1,
                            company: null,
                            manager: null,
                            socialNetworkIds_ul: [
                                {
                                    type: 'facebook',
                                    userId: chats.contact.identifier,
                                },
                            ],
                        },
                        () => {
                            toggleModal();
                        },
                        () => { }
                    )
                );
            } else if (
                !err &&
                editId > 0 &&
                chats &&
                chats.contact &&
                chats.contact.identifier
            ) {
                dispatch(
                    editContact(
                        editId,
                        {
                            ...values,
                            status: 1,
                            socialNetworkIds_ul: [
                                {
                                    type: 'facebook',
                                    userId: chats.contact.identifier,
                                },
                            ],
                        },
                        () => {
                            toggleModal();
                        }
                    )
                );
            }
        });
    };

    return (
        <ProModal
            maskClosable
            width={600}
            centered
            padding
            isVisible={visible}
            handleModal={toggleModal}
        >
            <div className={styles.contactModalContainer}>
                <h3>
                    {chats && chats.contact && chats.contact.prospectContact
                        ? 'Əlaqəyə düzəliş et'
                        : 'Yeni əlaqə'}
                </h3>

                <Form onSubmit={handleSubmitContact}>
                    <ProFormItem
                        label="Kataloq adı"
                        customStyle={styles.formItem}
                        help={getFieldError('name')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('name', {
                            rules: [requiredRule, minLengthRule],
                        })(
                            <ProAutoComplete
                                dataSource={list}
                                onChange={handleContactSelect}
                            />
                        )}
                    </ProFormItem>

                    <ProFormItem
                        label="Əlaqə tipi"
                        help={getFieldError('type')?.[0]}
                    >
                        {getFieldDecorator('type', {
                            rules: [requiredRule],
                        })(<ProSelect data={contactTypes} />)}
                    </ProFormItem>

                    <ProFormItem
                        label="Kateqoriya"
                        help={getFieldError('category_ul')?.[0]}
                    >
                        {getFieldDecorator('category_ul', {
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                mode="multiple"
                                data={Object.values(contactCategories)}
                            />
                        )}
                    </ProFormItem>

                    <ProButton
                        htmlType="submit"
                        loading={actionIsLoading}
                        size="large"
                    >
                        {chats && chats.contact && chats.contact.prospectContact
                            ? 'Düzəliş et'
                            : 'Əlavə et'}
                    </ProButton>
                </Form>
            </div>
        </ProModal>
    );
}

export default Form.create({ name: 'ContactForm' })(AddToContact);
