import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Switch } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { ProModal, ProFormItem, ProButton, ProInput } from 'components/Lib';

import { requiredRule, minLengthRule, bigTextMaxRule } from 'utils/rules';

import { messages } from 'utils';

import { addQuestions, editQuestions } from 'store/actions/calls/faq';

import styles from './styles.module.scss';
import './errors.css';

const AddQuestions = (props = {}) => {
    const {
        form,
        visible,
        handleModal,
        selected,
        editQuestion = [],
        setEditQusetion,
        handleQuestionEditedOrAddedSucces,
    } = props;

    const { getFieldDecorator, getFieldError, setFieldsValue } = form;

    const dispatch = useDispatch();

    const [checked, setChecked] = React.useState(true);
    const [answer, setAnswer] = React.useState('');
    const [errors, setErrors] = React.useState({});

    const actionLoading = useSelector(state => state.FaqReducer.actionLoading);

    React.useEffect(() => {
        if (editQuestion.id) {
            handleModal(true);

            setFieldsValue({
                question: editQuestion.question,
                status: editQuestion.status,
            });
            setChecked(editQuestion.status !== 0);
            setAnswer(editQuestion.answer);
        } else {
            setFieldsValue({
                question: null,
                status: true,
            });
            setChecked(true);
            setAnswer('');
        }
    }, [editQuestion, handleModal, setFieldsValue]);

    const toggleModal = () => {
        handleModal(!visible);
        setEditQusetion([]);
        setErrors({});
    };

    const handleSubmitContact = e => {
        e.preventDefault();

        form.validateFields((err, values) => {
            if (
                (!err && answer === '') ||
                answer.replace(/(<([^>]+)>)/gi, '') === ''
            ) {
                setErrors({
                    answer: messages.requiredText,
                });
            } else if (!err && answer.replace(/(<([^>]+)>)/gi, '').length < 2) {
                setErrors({
                    answer: messages.mintextLimitMessage(2),
                });
            } else if (
                !err &&
                answer.replace(/(<([^>]+)>)/gi, '').length > 2000
            ) {
                setErrors({
                    answer: messages.maxtextLimitMessage(2000),
                });
            } else if (!err && answer !== '' && !editQuestion?.id) {
                dispatch(
                    addQuestions(
                        {
                            subject: selected,
                            answer,
                            ...values,
                            status: values.status ? 1 : 0,
                        },
                        () => {
                            handleQuestionEditedOrAddedSucces();
                            toggleModal();
                        },
                        error => {
                            if (error === 'Question is already exists.') {
                                form.setFields({
                                    question: {
                                        value: values.question,
                                        errors: [
                                            new Error(
                                                'Bu sual artıq mövcuddur'
                                            ),
                                        ],
                                    },
                                });
                            }
                        }
                    )
                );
            } else if (!err && answer !== '' && editQuestion?.id) {
                dispatch(
                    editQuestions(
                        editQuestion.id,
                        {
                            subject: selected,
                            answer,
                            ...values,
                            status: values.status ? 1 : 0,
                        },
                        () => {
                            handleQuestionEditedOrAddedSucces();
                            toggleModal();
                        },
                        error => {
                            if (error === 'Question is already exists.') {
                                form.setFields({
                                    question: {
                                        value: values.question,
                                        errors: [
                                            new Error(
                                                'Bu sual artıq mövcuddur'
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

    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [
                { list: 'ordered' },
                { list: 'bullet' },
                { indent: '-1' },
                { indent: '+1' },
            ],
            ['link'],
            ['clean'],
        ],
    };

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
    ];

    const handleChangeAnswer = value => {
        setAnswer(value);
        setErrors({});
    };

    return (
        <ProModal
            width={777}
            centered
            padding
            isVisible={visible}
            handleModal={toggleModal}
            maskClosable
        >
            <div>
                <h3>{editQuestion.id ? 'Suala düzəliş et' : 'Yeni Sual'}</h3>

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
                        label="Sual"
                        customStyle={styles.formItem}
                        help={getFieldError('question')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('question', {
                            rules: [
                                requiredRule,
                                minLengthRule,
                                bigTextMaxRule,
                            ],
                        })(<ProInput />)}
                    </ProFormItem>

                    <ProFormItem
                        label="Cavab"
                        customStyle={styles.formItem}
                        style={{ height: '460px' }}
                    >
                        <ReactQuill
                            theme="snow"
                            value={answer}
                            onChange={e => handleChangeAnswer(e)}
                            className={errors.answer ? `withError` : ''}
                            style={{
                                height: '380px',
                            }}
                            modules={modules}
                            formats={formats}
                        />
                        {errors.answer && (
                            <div className={styles.error}>{errors.answer}</div>
                        )}
                    </ProFormItem>

                    <ProButton
                        htmlType="submit"
                        loading={actionLoading}
                        size="large"
                        style={{ width: '100%', marginTop: '10px' }}
                    >
                        {editQuestion.id ? 'Düzəliş et' : 'Əlavə et'}
                    </ProButton>
                </Form>
            </div>
        </ProModal>
    );
};

export default Form.create({ name: 'AddQuestionForm' })(AddQuestions);
